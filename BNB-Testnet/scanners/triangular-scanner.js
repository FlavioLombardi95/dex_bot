const { ethers } = require('ethers');
const BaseScanner = require('../core/base-scanner');
const config = require('../core/config');
const logger = require('../core/logger');

class TriangularScanner extends BaseScanner {
    constructor(options = {}) {
        const defaultOptions = {
            scanInterval: 3000, // 3 secondi
            minProfitPercentage: 0.1,
            maxSlippage: 2.0,
            minAmount: 0.001,
            maxAmount: 1.0,
            enableVolatilityDetection: true,
            prioritizeHighLiquidity: true,
            ...options
        };

        super('triangular-arbitrage', defaultOptions);
        
        this.tradingConfig = config.getTradingConfig();
        this.triangularPaths = this.tradingConfig.arbitrage.triangular.paths;
        this.opportunities = [];
        this.volatilityThreshold = 0.05; // 5% volatility threshold
        this.lastPrices = new Map();
        
        this.logger.info('Triangular scanner initialized', {
            paths: this.triangularPaths.length,
            minProfit: this.options.minProfitPercentage,
            maxSlippage: this.options.maxSlippage
        });
    }

    async performScan() {
        const opportunities = [];
        
        // Get enabled paths sorted by priority
        const enabledPaths = this.triangularPaths
            .filter(path => path.enabled)
            .sort((a, b) => a.priority - b.priority);
        
        // Scan each path
        for (const path of enabledPaths) {
            try {
                const pathOpportunities = await this.scanTriangularPath(path);
                opportunities.push(...pathOpportunities);
            } catch (error) {
                this.logger.warn('Path scan failed', {
                    pathId: path.id,
                    error: error.message
                });
            }
        }
        
        // Filter and sort opportunities
        const filteredOpportunities = this.filterOpportunities(opportunities);
        const sortedOpportunities = this.sortOpportunities(filteredOpportunities);
        
        return {
            opportunities: sortedOpportunities,
            pathsScanned: enabledPaths.length,
            totalOpportunities: opportunities.length,
            filteredOpportunities: filteredOpportunities.length
        };
    }

    async scanTriangularPath(path) {
        const opportunities = [];
        const { tokens } = path;
        
        // Get token addresses
        const tokenAddresses = tokens.map(symbol => this.getTokenAddress(symbol));
        
        // Test different amounts
        const testAmounts = this.generateTestAmounts();
        
        for (const amount of testAmounts) {
            try {
                const opportunity = await this.testTriangularArbitrage(
                    path,
                    tokenAddresses,
                    amount
                );
                
                if (opportunity) {
                    opportunities.push(opportunity);
                }
            } catch (error) {
                this.logger.debug('Amount test failed', {
                    pathId: path.id,
                    amount,
                    error: error.message
                });
            }
        }
        
        return opportunities;
    }

    async testTriangularArbitrage(path, tokenAddresses, amountIn) {
        const { tokens, id } = path;
        const amountInWei = ethers.utils.parseUnits(amountIn.toString(), 18);
        
        // Execute triangular path: A -> B -> C -> A
        const step1 = await this.getMultiHopPrice(
            [tokenAddresses[0], tokenAddresses[1]], 
            amountInWei
        );
        
        const step2 = await this.getMultiHopPrice(
            [tokenAddresses[1], tokenAddresses[2]], 
            step1.output
        );
        
        const step3 = await this.getMultiHopPrice(
            [tokenAddresses[2], tokenAddresses[0]], 
            step2.output
        );
        
        // Calculate profit
        const finalAmount = parseFloat(ethers.utils.formatUnits(step3.output, 18));
        const inputAmount = parseFloat(amountIn);
        const grossProfit = finalAmount - inputAmount;
        const grossProfitPercentage = (grossProfit / inputAmount) * 100;
        
        // Calculate costs
        const gasCosts = await this.calculateGasCosts();
        const netProfit = grossProfit - gasCosts.totalCostInToken;
        const netProfitPercentage = (netProfit / inputAmount) * 100;
        
        // Check profitability
        if (netProfitPercentage >= this.options.minProfitPercentage) {
            const opportunity = {
                id: `${id}_${Date.now()}`,
                pathId: id,
                path: {
                    tokens,
                    addresses: tokenAddresses
                },
                amounts: {
                    input: inputAmount,
                    step1: parseFloat(ethers.utils.formatUnits(step1.output, 18)),
                    step2: parseFloat(ethers.utils.formatUnits(step2.output, 18)),
                    final: finalAmount
                },
                profit: {
                    gross: grossProfit,
                    grossPercentage: grossProfitPercentage,
                    net: netProfit,
                    netPercentage: netProfitPercentage,
                    gasCosts: gasCosts.totalCostInToken
                },
                timing: {
                    detected: Date.now(),
                    blockNumber: await this.getBlockNumber(),
                    gasPrice: gasCosts.gasPrice
                },
                volatility: this.calculateVolatility(tokens[0]),
                priority: this.calculatePriority(netProfitPercentage, path.priority),
                estimatedExecutionTime: this.estimateExecutionTime(),
                slippage: this.calculateSlippage(step1, step2, step3)
            };
            
            // Log opportunity
            this.logger.opportunity(opportunity);
            
            return opportunity;
        }
        
        return null;
    }

    async calculateGasCosts() {
        const gasPrice = await this.getCurrentGasPrice();
        const gasLimit = this.tradingConfig.gas.limit;
        const gasMultiplier = this.tradingConfig.gas.multiplier;
        
        const estimatedGas = gasLimit * gasMultiplier;
        const gasCostBNB = (estimatedGas * gasPrice) / 1e9;
        
        // Convert to token cost (assume BNB price for simplicity)
        const gasCostInToken = gasCostBNB; // This could be more sophisticated
        
        return {
            gasPrice,
            gasLimit,
            estimatedGas,
            gasCostBNB,
            totalCostInToken: gasCostInToken
        };
    }

    calculateVolatility(tokenSymbol) {
        const priceHistory = this.lastPrices.get(tokenSymbol) || [];
        
        if (priceHistory.length < 2) {
            return 0;
        }
        
        const recent = priceHistory.slice(-10); // Last 10 prices
        const avg = recent.reduce((sum, price) => sum + price, 0) / recent.length;
        const variance = recent.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / recent.length;
        
        return Math.sqrt(variance) / avg;
    }

    calculatePriority(netProfitPercentage, pathPriority) {
        // Higher profit = higher priority, lower path priority number = higher priority
        const profitScore = netProfitPercentage * 10;
        const pathScore = (10 - pathPriority) * 2;
        
        return profitScore + pathScore;
    }

    estimateExecutionTime() {
        // Estimate based on network conditions
        const networkConfig = config.getNetworkConfig()[config.getCurrentNetwork()];
        const blockTime = networkConfig.blockTime;
        const confirmations = networkConfig.finalityBlocks;
        
        return blockTime * confirmations;
    }

    calculateSlippage(step1, step2, step3) {
        // Calculate potential slippage based on amounts
        const totalSlippage = 0.25 * 3; // 0.25% per step for 3 steps
        return totalSlippage;
    }

    generateTestAmounts() {
        const amounts = [];
        const min = this.options.minAmount;
        const max = this.options.maxAmount;
        const steps = 10;
        
        for (let i = 0; i < steps; i++) {
            const amount = min + (max - min) * (i / (steps - 1));
            amounts.push(amount);
        }
        
        return amounts;
    }

    filterOpportunities(opportunities) {
        return opportunities.filter(opportunity => {
            // Filter by minimum profit
            if (opportunity.profit.netPercentage < this.options.minProfitPercentage) {
                return false;
            }
            
            // Filter by maximum slippage
            if (opportunity.slippage > this.options.maxSlippage) {
                return false;
            }
            
            // Filter by volatility if enabled
            if (this.options.enableVolatilityDetection && 
                opportunity.volatility > this.volatilityThreshold) {
                return false;
            }
            
            return true;
        });
    }

    sortOpportunities(opportunities) {
        return opportunities.sort((a, b) => {
            // Sort by priority (higher is better)
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            
            // Then by net profit percentage
            return b.profit.netPercentage - a.profit.netPercentage;
        });
    }

    async processOpportunity(opportunity) {
        this.logger.info('Processing triangular opportunity', {
            id: opportunity.id,
            pathId: opportunity.pathId,
            netProfit: opportunity.profit.netPercentage,
            priority: opportunity.priority
        });
        
        // Store in memory for analysis
        this.opportunities.push(opportunity);
        
        // Keep only last 100 opportunities
        if (this.opportunities.length > 100) {
            this.opportunities = this.opportunities.slice(-100);
        }
        
        // Update price history for volatility calculation
        this.updatePriceHistory(opportunity);
        
        // Execute if not in dry run mode
        if (!config.getConfig().environment.dryRun) {
            await this.executeOpportunity(opportunity);
        }
    }

    updatePriceHistory(opportunity) {
        const { tokens, amounts } = opportunity.path;
        
        tokens.forEach((token, index) => {
            if (index < amounts.length) {
                const history = this.lastPrices.get(token) || [];
                history.push(amounts[index]);
                
                // Keep only last 50 prices
                if (history.length > 50) {
                    history.shift();
                }
                
                this.lastPrices.set(token, history);
            }
        });
    }

    async executeOpportunity(opportunity) {
        try {
            this.logger.info('Executing triangular arbitrage', {
                id: opportunity.id,
                expectedProfit: opportunity.profit.netPercentage
            });
            
            // Implementation would go here
            // For now, just log the execution
            
            this.logger.profit(opportunity, {
                component: 'triangular-execution'
            });
            
        } catch (error) {
            this.logger.errorWithContext(error, {
                operation: 'execute-opportunity',
                opportunityId: opportunity.id
            });
        }
    }

    async getBlockNumber() {
        const connectionPool = require('../core/connection-pool');
        return await connectionPool.getBlockNumber();
    }

    // Analytics methods
    getOpportunityStats() {
        const now = Date.now();
        const lastHour = now - 3600000; // 1 hour ago
        
        const recentOpportunities = this.opportunities.filter(
            op => op.timing.detected > lastHour
        );
        
        const profitableOpportunities = recentOpportunities.filter(
            op => op.profit.netPercentage > 0
        );
        
        const avgProfit = profitableOpportunities.length > 0 ?
            profitableOpportunities.reduce((sum, op) => sum + op.profit.netPercentage, 0) / profitableOpportunities.length :
            0;
        
        return {
            total: this.opportunities.length,
            lastHour: recentOpportunities.length,
            profitable: profitableOpportunities.length,
            avgProfit,
            bestOpportunity: this.opportunities.length > 0 ?
                this.opportunities.reduce((best, current) => 
                    current.profit.netPercentage > best.profit.netPercentage ? current : best
                ) : null
        };
    }

    // Override base class health check
    async healthCheck() {
        const baseHealth = await super.healthCheck();
        
        const opportunityStats = this.getOpportunityStats();
        
        return {
            ...baseHealth,
            triangularSpecific: {
                opportunityStats,
                activePaths: this.triangularPaths.filter(p => p.enabled).length,
                lastOpportunity: this.opportunities.length > 0 ?
                    this.opportunities[this.opportunities.length - 1].timing.detected :
                    null
            }
        };
    }
}

module.exports = TriangularScanner; 