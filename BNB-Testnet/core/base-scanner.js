const { ethers } = require('ethers');
const config = require('./config');
const logger = require('./logger');
const connectionPool = require('./connection-pool');

class BaseScanner {
    constructor(scannerName, options = {}) {
        this.scannerName = scannerName;
        this.options = {
            enabled: true,
            scanInterval: 5000,
            maxRetries: 3,
            retryDelay: 1000,
            enableCaching: true,
            cacheTime: 30000,
            ...options
        };
        
        this.isRunning = false;
        this.scanIntervalId = null;
        this.cache = new Map();
        this.stats = {
            totalScans: 0,
            successfulScans: 0,
            errors: 0,
            opportunities: 0,
            startTime: Date.now(),
            lastScan: null
        };
        
        this.logger = logger.createChildLogger({
            component: 'scanner',
            scannerName: this.scannerName
        });
        
        this.initializeContracts();
        this.setupEventHandlers();
        
        this.logger.info('Scanner initialized', {
            options: this.options
        });
    }

    // Abstract methods that must be implemented by subclasses
    async performScan() {
        throw new Error('performScan must be implemented by subclass');
    }

    async processOpportunity(opportunity) {
        throw new Error('processOpportunity must be implemented by subclass');
    }

    // Contract initialization
    initializeContracts() {
        const dexConfig = config.getDexConfig();
        const networkType = config.isMainnet() ? 'mainnet' : 'testnet';
        
        // Router contracts
        this.routers = {};
        Object.entries(dexConfig).forEach(([dexName, dexInfo]) => {
            if (dexInfo.enabled) {
                this.routers[dexName] = {
                    address: dexInfo.router[networkType],
                    contract: null // Will be created when needed
                };
            }
        });
        
        // Common ABIs
        this.abis = {
            router: [
                'function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)',
                'function getAmountsIn(uint amountOut, address[] memory path) external view returns (uint[] memory amounts)',
                'function factory() external pure returns (address)',
                'function WETH() external pure returns (address)'
            ],
            factory: [
                'function getPair(address tokenA, address tokenB) external view returns (address pair)',
                'function allPairs(uint) external view returns (address pair)',
                'function allPairsLength() external view returns (uint)',
                'event PairCreated(address indexed token0, address indexed token1, address pair, uint)'
            ],
            pair: [
                'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
                'function token0() external view returns (address)',
                'function token1() external view returns (address)',
                'function totalSupply() external view returns (uint256)'
            ],
            token: [
                'function name() external view returns (string)',
                'function symbol() external view returns (string)',
                'function decimals() external view returns (uint8)',
                'function totalSupply() external view returns (uint256)',
                'function balanceOf(address) external view returns (uint256)'
            ]
        };
    }

    // Get contract instance
    async getContract(type, address, dexName = null) {
        const cacheKey = `${type}_${address}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const contract = await connectionPool.createContract(address, this.abis[type]);
        
        if (this.options.enableCaching) {
            this.cache.set(cacheKey, contract);
            setTimeout(() => this.cache.delete(cacheKey), this.options.cacheTime);
        }
        
        return contract;
    }

    // Get router contract
    async getRouterContract(dexName) {
        const routerInfo = this.routers[dexName];
        if (!routerInfo) {
            throw new Error(`Router not found for DEX: ${dexName}`);
        }
        
        if (!routerInfo.contract) {
            routerInfo.contract = await this.getContract('router', routerInfo.address);
        }
        
        return routerInfo.contract;
    }

    // Price calculation utilities
    async getTokenPrice(tokenA, tokenB, amountIn, dexName = 'pancakeswap') {
        const cacheKey = `price_${tokenA}_${tokenB}_${amountIn}_${dexName}`;
        
        if (this.options.enableCaching && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            const router = await this.getRouterContract(dexName);
            const path = [tokenA, tokenB];
            const amounts = await router.getAmountsOut(amountIn, path);
            
            const price = {
                input: amountIn,
                output: amounts[amounts.length - 1],
                path,
                dex: dexName,
                timestamp: Date.now()
            };
            
            if (this.options.enableCaching) {
                this.cache.set(cacheKey, price);
                setTimeout(() => this.cache.delete(cacheKey), this.options.cacheTime);
            }
            
            return price;
        } catch (error) {
            this.logger.warn('Price calculation failed', {
                tokenA,
                tokenB,
                amountIn,
                dexName,
                error: error.message
            });
            throw error;
        }
    }

    // Multi-hop price calculation
    async getMultiHopPrice(path, amountIn, dexName = 'pancakeswap') {
        const cacheKey = `multihop_${path.join('_')}_${amountIn}_${dexName}`;
        
        if (this.options.enableCaching && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            const router = await this.getRouterContract(dexName);
            const amounts = await router.getAmountsOut(amountIn, path);
            
            const price = {
                input: amountIn,
                output: amounts[amounts.length - 1],
                path,
                amounts,
                dex: dexName,
                timestamp: Date.now()
            };
            
            if (this.options.enableCaching) {
                this.cache.set(cacheKey, price);
                setTimeout(() => this.cache.delete(cacheKey), this.options.cacheTime);
            }
            
            return price;
        } catch (error) {
            this.logger.warn('Multi-hop price calculation failed', {
                path,
                amountIn,
                dexName,
                error: error.message
            });
            throw error;
        }
    }

    // Utility methods
    async getCurrentGasPrice() {
        try {
            const gasPrice = await connectionPool.getGasPrice();
            return parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
        } catch (error) {
            this.logger.warn('Gas price fetch failed', { error: error.message });
            return 5.0; // Default fallback
        }
    }

    getTokenConfig(symbol) {
        const tokenConfig = config.getTokenConfig()[symbol];
        if (!tokenConfig) {
            throw new Error(`Token configuration not found for: ${symbol}`);
        }
        return tokenConfig;
    }

    getTokenAddress(symbol) {
        return config.getTokenAddress(symbol);
    }

    // Event handlers
    setupEventHandlers() {
        process.on('SIGINT', () => this.stop());
        process.on('SIGTERM', () => this.stop());
    }

    // Scanner lifecycle methods
    async start() {
        if (this.isRunning) {
            this.logger.warn('Scanner already running');
            return;
        }
        
        if (!this.options.enabled) {
            this.logger.warn('Scanner is disabled');
            return;
        }
        
        this.isRunning = true;
        this.stats.startTime = Date.now();
        
        this.logger.info('Scanner starting', {
            scanInterval: this.options.scanInterval
        });
        
        // Start scanning loop
        this.scanIntervalId = setInterval(async () => {
            await this.executeScan();
        }, this.options.scanInterval);
        
        // Perform first scan immediately
        await this.executeScan();
    }

    async stop() {
        if (!this.isRunning) {
            return;
        }
        
        this.isRunning = false;
        
        if (this.scanIntervalId) {
            clearInterval(this.scanIntervalId);
            this.scanIntervalId = null;
        }
        
        this.logger.info('Scanner stopped', {
            totalScans: this.stats.totalScans,
            successfulScans: this.stats.successfulScans,
            errors: this.stats.errors,
            opportunities: this.stats.opportunities,
            uptime: Date.now() - this.stats.startTime
        });
    }

    async executeScan() {
        if (!this.isRunning) {
            return;
        }
        
        const scanStartTime = Date.now();
        this.stats.totalScans++;
        
        try {
            this.logger.debug('Starting scan');
            
            const result = await this.performScan();
            
            if (result && result.opportunities) {
                this.stats.opportunities += result.opportunities.length;
                
                // Process each opportunity
                for (const opportunity of result.opportunities) {
                    await this.processOpportunity(opportunity);
                }
            }
            
            this.stats.successfulScans++;
            this.stats.lastScan = Date.now();
            
            const scanTime = Date.now() - scanStartTime;
            this.logger.debug('Scan completed', {
                scanTime,
                opportunities: result?.opportunities?.length || 0
            });
            
        } catch (error) {
            this.stats.errors++;
            this.logger.errorWithContext(error, {
                operation: 'scan',
                scanNumber: this.stats.totalScans
            });
        }
    }

    // Performance monitoring
    getStats() {
        const uptime = Date.now() - this.stats.startTime;
        const avgScanTime = this.stats.successfulScans > 0 ? 
            uptime / this.stats.successfulScans : 0;
        
        return {
            ...this.stats,
            uptime,
            avgScanTime,
            successRate: this.stats.totalScans > 0 ? 
                (this.stats.successfulScans / this.stats.totalScans) * 100 : 0,
            cacheSize: this.cache.size,
            isRunning: this.isRunning
        };
    }

    // Health check
    async healthCheck() {
        try {
            const blockNumber = await connectionPool.getBlockNumber();
            const gasPrice = await this.getCurrentGasPrice();
            
            const health = {
                status: 'healthy',
                blockNumber,
                gasPrice,
                cacheSize: this.cache.size,
                isRunning: this.isRunning,
                lastScan: this.stats.lastScan
            };
            
            this.logger.healthCheck(this.scannerName, 'healthy', health);
            return health;
        } catch (error) {
            const health = {
                status: 'unhealthy',
                error: error.message,
                isRunning: this.isRunning
            };
            
            this.logger.healthCheck(this.scannerName, 'unhealthy', health);
            return health;
        }
    }

    // Cache management
    clearCache() {
        this.cache.clear();
        this.logger.info('Cache cleared');
    }

    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.options.cacheTime,
            enabled: this.options.enableCaching
        };
    }

    // Utility sleep method
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = BaseScanner; 