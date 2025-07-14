#!/usr/bin/env node

const { ethers } = require('ethers');
const ConfigManager = require('../core/config');
const Logger = require('../core/logger');
const ConnectionPool = require('../core/connection-pool');

class ProfitabilityAnalyzer {
    constructor() {
        this.config = new ConfigManager();
        this.logger = Logger.getLogger('profitability-analyzer');
        this.pool = new ConnectionPool();
        this.marketData = this.initializeMarketData();
    }

    initializeMarketData() {
        return {
            scenarios: [
                {
                    name: 'Spread Micro (0.05%)',
                    spread: 0.05,
                    likelihood: 'Molto comune',
                    frequency: '50-100 volte/ora',
                    duration: '1-5 secondi'
                },
                {
                    name: 'Spread Basso (0.1%)',
                    spread: 0.1,
                    likelihood: 'Comune',
                    frequency: '20-50 volte/ora',
                    duration: '5-15 secondi'
                },
                {
                    name: 'Spread Medio (0.5%)',
                    spread: 0.5,
                    likelihood: 'Frequente',
                    frequency: '10-20 volte/ora',
                    duration: '15-60 secondi'
                },
                {
                    name: 'Spread Alto (1.0%)',
                    spread: 1.0,
                    likelihood: 'Raro',
                    frequency: '2-5 volte/ora',
                    duration: '30-120 secondi'
                },
                {
                    name: 'Spread Estremo (2.0%)',
                    spread: 2.0,
                    likelihood: 'Molto raro',
                    frequency: '1-2 volte/giorno',
                    duration: '60-300 secondi'
                }
            ],
            testAmounts: [
                { amount: 0.1, label: 'Micro' },
                { amount: 0.5, label: 'Piccolo' },
                { amount: 1.0, label: 'Medio' },
                { amount: 2.0, label: 'Grande' },
                { amount: 5.0, label: 'Molto Grande' }
            ],
            gasPrices: {
                low: this.config.trading.gasPrice * 0.5,
                medium: this.config.trading.gasPrice,
                high: this.config.trading.gasPrice * 2,
                extreme: this.config.trading.gasPrice * 5
            }
        };
    }

    async getCurrentMarketConditions() {
        this.logger.info('🔍 Analisi condizioni mercato correnti...');
        
        try {
            const provider = this.pool.getProvider();
            const gasPrice = await provider.getGasPrice();
            const currentGasPrice = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
            
            // Ottieni prezzo native token (BNB/ETH/MATIC)
            const nativePrice = await this.estimateNativeTokenPrice();
            
            this.logger.info('📊 Condizioni mercato', {
                gasPrice: currentGasPrice + ' gwei',
                nativeTokenPrice: nativePrice,
                network: this.config.network.name,
                currency: this.config.network.currency
            });
            
            return {
                gasPrice: currentGasPrice,
                nativeTokenPrice: nativePrice,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            this.logger.error('❌ Errore ottenimento condizioni mercato', { 
                error: error.message 
            });
            throw error;
        }
    }

    async estimateNativeTokenPrice() {
        // Stima prezzo basata su DEX configurati
        // Per demo, usiamo valori realistici
        const prices = {
            'bsc-testnet': 300,   // BNB ~$300
            'ethereum': 2400,     // ETH ~$2400
            'polygon': 0.8,       // MATIC ~$0.8
            'amoy': 0.8          // MATIC testnet
        };
        
        return prices[this.config.network.name] || 100;
    }

    calculateGasCost(gasPrice, nativeTokenPrice) {
        const gasLimit = this.config.trading.gasLimit;
        const gasCostWei = ethers.utils.parseUnits(gasPrice.toString(), 'gwei').mul(gasLimit);
        const gasCostNative = parseFloat(ethers.utils.formatEther(gasCostWei));
        const gasCostUSD = gasCostNative * nativeTokenPrice;
        
        return {
            gasLimit,
            gasPriceGwei: gasPrice,
            costNative: gasCostNative,
            costUSD: gasCostUSD
        };
    }

    analyzeArbitrageOpportunity(scenario, amount, marketConditions) {
        const { gasPrice, nativeTokenPrice } = marketConditions;
        
        // Calcola profitto teorico
        const basePrice = 2000; // Prezzo base per calcoli
        const priceA = basePrice;
        const priceB = basePrice * (1 + scenario.spread / 100);
        const priceDiff = priceB - priceA;
        const grossProfit = amount * priceDiff;
        
        // Calcola costi
        const gasCost = this.calculateGasCost(gasPrice, nativeTokenPrice);
        const slippage = this.config.trading.slippage / 100;
        const slippageCost = grossProfit * slippage;
        
        // Calcola MEV protection cost (se abilitato)
        const mevProtectionCost = this.config.trading.mevProtection ? 
            grossProfit * 0.001 : 0; // 0.1% per MEV protection
        
        // Profitto netto
        const netProfit = grossProfit - gasCost.costUSD - slippageCost - mevProtectionCost;
        const profitMargin = (netProfit / (amount * basePrice)) * 100;
        
        return {
            scenario: scenario.name,
            amount,
            prices: { A: priceA, B: priceB },
            costs: {
                gas: gasCost,
                slippage: slippageCost,
                mevProtection: mevProtectionCost,
                total: gasCost.costUSD + slippageCost + mevProtectionCost
            },
            profit: {
                gross: grossProfit,
                net: netProfit,
                margin: profitMargin
            },
            viable: netProfit > 0,
            roi: netProfit > 0 ? (netProfit / (amount * basePrice)) * 100 : 0
        };
    }

    async runFullAnalysis() {
        this.logger.info('🚀 Avvio analisi completa profittabilità');
        
        try {
            const marketConditions = await this.getCurrentMarketConditions();
            const results = [];
            
            for (const scenario of this.marketData.scenarios) {
                this.logger.info(`📈 Analisi scenario: ${scenario.name}`);
                
                const scenarioResults = {
                    scenario: scenario.name,
                    spread: scenario.spread,
                    likelihood: scenario.likelihood,
                    frequency: scenario.frequency,
                    opportunities: []
                };
                
                for (const testAmount of this.marketData.testAmounts) {
                    const opportunity = this.analyzeArbitrageOpportunity(
                        scenario,
                        testAmount.amount,
                        marketConditions
                    );
                    
                    opportunity.sizeLabel = testAmount.label;
                    scenarioResults.opportunities.push(opportunity);
                    
                    // Log opportunità profittevoli
                    if (opportunity.viable) {
                        this.logger.opportunity('💰 Opportunità profittevole trovata', {
                            scenario: scenario.name,
                            amount: testAmount.amount,
                            netProfit: opportunity.profit.net,
                            roi: opportunity.roi,
                            margin: opportunity.profit.margin
                        });
                    }
                }
                
                results.push(scenarioResults);
            }
            
            // Genera report
            const report = await this.generateReport(results, marketConditions);
            await this.saveReport(report);
            
            return report;
            
        } catch (error) {
            this.logger.error('❌ Errore durante analisi', { 
                error: error.message 
            });
            throw error;
        }
    }

    async generateReport(results, marketConditions) {
        const viableOpportunities = results.flatMap(r => 
            r.opportunities.filter(o => o.viable)
        );
        
        const bestOpportunity = viableOpportunities.reduce((best, current) => 
            current.profit.net > best.profit.net ? current : best,
            viableOpportunities[0] || { profit: { net: 0 } }
        );
        
        const averageROI = viableOpportunities.length > 0 ? 
            viableOpportunities.reduce((sum, o) => sum + o.roi, 0) / viableOpportunities.length : 0;
        
        const report = {
            timestamp: new Date().toISOString(),
            network: this.config.network.name,
            marketConditions,
            summary: {
                totalScenarios: results.length,
                viableOpportunities: viableOpportunities.length,
                bestOpportunity: bestOpportunity,
                averageROI: averageROI,
                minProfitableAmount: this.findMinProfitableAmount(results)
            },
            scenarios: results,
            recommendations: this.generateRecommendations(results, marketConditions)
        };
        
        this.logger.analytics('📊 Report generato', {
            viableOpportunities: viableOpportunities.length,
            bestROI: bestOpportunity.roi,
            averageROI: averageROI
        });
        
        return report;
    }

    findMinProfitableAmount(results) {
        for (const result of results) {
            for (const opportunity of result.opportunities) {
                if (opportunity.viable) {
                    return opportunity.amount;
                }
            }
        }
        return null;
    }

    generateRecommendations(results, marketConditions) {
        const recommendations = [];
        
        // Raccomandazioni basate su gas price
        if (marketConditions.gasPrice > this.config.trading.gasPrice * 2) {
            recommendations.push({
                type: 'warning',
                title: 'Gas Price Elevato',
                description: 'Gas price corrente è molto alto, considera di aspettare condizioni migliori',
                action: 'Monitora gas tracker e attendi riduzione'
            });
        }
        
        // Raccomandazioni basate su opportunità viable
        const viableCount = results.reduce((count, r) => 
            count + r.opportunities.filter(o => o.viable).length, 0
        );
        
        if (viableCount === 0) {
            recommendations.push({
                type: 'error',
                title: 'Nessuna Opportunità Profittevole',
                description: 'Non ci sono opportunità profittevoli nelle condizioni attuali',
                action: 'Rivedi configurazione slippage e gas limit'
            });
        } else if (viableCount < 5) {
            recommendations.push({
                type: 'warning',
                title: 'Poche Opportunità',
                description: `Solo ${viableCount} opportunità profittevoli trovate`,
                action: 'Considera di aumentare il capitale o ridurre i costi'
            });
        } else {
            recommendations.push({
                type: 'success',
                title: 'Buone Opportunità',
                description: `${viableCount} opportunità profittevoli disponibili`,
                action: 'Avvia il bot in modalità live'
            });
        }
        
        return recommendations;
    }

    async saveReport(report) {
        const fs = require('fs');
        const path = require('path');
        
        const reportsDir = path.join(__dirname, '..', 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        const filename = `profitability-analysis-${Date.now()}.json`;
        const filepath = path.join(reportsDir, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
        
        this.logger.info('📁 Report salvato', { 
            path: filepath,
            size: (JSON.stringify(report).length / 1024).toFixed(2) + ' KB'
        });
    }

    printSummary(report) {
        console.log('\n🎯 RIASSUNTO ANALISI PROFITTABILITÀ');
        console.log('=====================================');
        console.log(`⏰ Timestamp: ${report.timestamp}`);
        console.log(`🌐 Network: ${report.network}`);
        console.log(`⛽ Gas Price: ${report.marketConditions.gasPrice} gwei`);
        console.log(`💰 Opportunità Profittevoli: ${report.summary.viableOpportunities}`);
        console.log(`📈 ROI Medio: ${report.summary.averageROI.toFixed(2)}%`);
        
        if (report.summary.bestOpportunity.profit.net > 0) {
            console.log(`🏆 Migliore Opportunità: ${report.summary.bestOpportunity.profit.net.toFixed(4)} USD`);
        }
        
        console.log('\n💡 RACCOMANDAZIONI:');
        report.recommendations.forEach(rec => {
            const icon = rec.type === 'success' ? '✅' : rec.type === 'warning' ? '⚠️' : '❌';
            console.log(`${icon} ${rec.title}: ${rec.description}`);
        });
    }
}

async function main() {
    const analyzer = new ProfitabilityAnalyzer();
    
    try {
        console.log('🔬 Avvio Analisi Profittabilità DEX Arbitrage\n');
        
        const report = await analyzer.runFullAnalysis();
        analyzer.printSummary(report);
        
        console.log('\n✨ Analisi completata con successo!');
        console.log('📊 Report dettagliato salvato in ./reports/');
        
    } catch (error) {
        console.error('💥 Errore durante l\'analisi:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { ProfitabilityAnalyzer }; 