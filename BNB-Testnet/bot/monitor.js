const { ethers } = require('ethers');
const winston = require('winston');
const config = require('./config');

// Configurazione logger
const logger = winston.createLogger({
    level: config.logging.level,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: config.logging.logFile }),
        new winston.transports.File({ 
            filename: config.logging.opportunityLogFile,
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    return JSON.stringify({ timestamp, level, message, ...meta });
                })
            )
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// ABI minimale per PancakeSwap Router
const PANCAKE_ROUTER_ABI = [
    'function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)',
    'function factory() external pure returns (address)',
    'function WETH() external pure returns (address)'
];

// ABI minimale per factory PancakeSwap
const PANCAKE_FACTORY_ABI = [
    'function getPair(address tokenA, address tokenB) external view returns (address pair)'
];

// ABI minimale per pair PancakeSwap
const PAIR_ABI = [
    'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)'
];

class TriangularArbitrageMonitor {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(config.networks.bscTestnet.rpcUrl);
        this.pancakeRouter = new ethers.Contract(
            config.dexes.pancakeswap.router, 
            PANCAKE_ROUTER_ABI, 
            this.provider
        );
        this.pancakeFactory = new ethers.Contract(
            config.dexes.pancakeswap.factory, 
            PANCAKE_FACTORY_ABI, 
            this.provider
        );
        
        this.isMonitoring = false;
        this.lastOpportunityCheck = 0;
        this.priceCache = new Map();
        this.opportunityHistory = [];
        
        logger.info('TriangularArbitrageMonitor inizializzato con successo', {
            network: config.networks.bscTestnet.name,
            router: config.dexes.pancakeswap.router,
            paths: config.triangularArbitrage.paths.length
        });
    }
    
    /**
     * Ottiene il prezzo per un pair specifico
     */
    async getPrice(tokenA, tokenB, amountIn) {
        try {
            const cacheKey = `${tokenA}-${tokenB}-${amountIn}`;
            const cached = this.priceCache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < config.monitoring.cacheTTL * 1000) {
                return cached.price;
            }
            
            const path = [tokenA, tokenB];
            const amounts = await this.pancakeRouter.getAmountsOut(amountIn, path);
            
            if (amounts.length < 2) {
                throw new Error('Risposta invalida dal router');
            }
            
            const price = amounts[1];
            
            // Cache del prezzo
            if (config.monitoring.enableCaching) {
                this.priceCache.set(cacheKey, {
                    price,
                    timestamp: Date.now()
                });
            }
            
            return price;
        } catch (error) {
            logger.error('Errore nel recupero prezzo:', {
                error: error.message,
                tokenA,
                tokenB,
                amountIn: amountIn.toString()
            });
            return ethers.BigNumber.from(0);
        }
    }
    
    /**
     * Verifica se una coppia di token esiste
     */
    async checkPairExists(tokenA, tokenB) {
        try {
            const pairAddress = await this.pancakeFactory.getPair(tokenA, tokenB);
            return pairAddress !== ethers.constants.AddressZero;
        } catch (error) {
            logger.error('Errore nel controllo esistenza coppia:', {
                error: error.message,
                tokenA,
                tokenB
            });
            return false;
        }
    }
    
    /**
     * Ottiene le riserve di liquidità per una coppia
     */
    async getLiquidity(tokenA, tokenB) {
        try {
            const pairAddress = await this.pancakeFactory.getPair(tokenA, tokenB);
            if (pairAddress === ethers.constants.AddressZero) {
                return { reserve0: ethers.BigNumber.from(0), reserve1: ethers.BigNumber.from(0) };
            }
            
            const pair = new ethers.Contract(pairAddress, PAIR_ABI, this.provider);
            const reserves = await pair.getReserves();
            
            return {
                reserve0: reserves.reserve0,
                reserve1: reserves.reserve1,
                pairAddress
            };
        } catch (error) {
            logger.error('Errore nel recupero liquidità:', {
                error: error.message,
                tokenA,
                tokenB
            });
            return { reserve0: ethers.BigNumber.from(0), reserve1: ethers.BigNumber.from(0) };
        }
    }
    
    /**
     * Calcola opportunità di arbitraggio triangolare per un percorso
     */
    async calculateTriangularOpportunity(path, amountIn) {
        try {
            const tokenA = config.getTokenBySymbol(path.tokenA);
            const tokenB = config.getTokenBySymbol(path.tokenB);
            const tokenC = config.getTokenBySymbol(path.tokenC);
            
            if (!tokenA || !tokenB || !tokenC) {
                logger.warn('Token non supportato nel percorso:', path);
                return null;
            }
            
            // Verifica esistenza di tutte le coppie
            const [pairAB, pairBC, pairCA] = await Promise.all([
                this.checkPairExists(tokenA.address, tokenB.address),
                this.checkPairExists(tokenB.address, tokenC.address),
                this.checkPairExists(tokenC.address, tokenA.address)
            ]);
            
            if (!pairAB || !pairBC || !pairCA) {
                logger.debug('Alcune coppie non esistono per il percorso:', {
                    path: path.name,
                    pairAB,
                    pairBC,
                    pairCA
                });
                return null;
            }
            
            // Calcola l'importo di test
            const testAmount = ethers.utils.parseUnits(
                amountIn.toString(), 
                tokenA.decimals
            );
            
            // Esegui il percorso triangolare: A -> B -> C -> A
            const amountB = await this.getPrice(tokenA.address, tokenB.address, testAmount);
            if (amountB.isZero()) return null;
            
            const amountC = await this.getPrice(tokenB.address, tokenC.address, amountB);
            if (amountC.isZero()) return null;
            
            const finalAmount = await this.getPrice(tokenC.address, tokenA.address, amountC);
            if (finalAmount.isZero()) return null;
            
            // Calcola profitto
            const profit = finalAmount.sub(testAmount);
            const profitPercentage = profit.mul(10000).div(testAmount).toNumber() / 100; // Percentuale con 2 decimali
            
            const opportunity = {
                path: path.name,
                description: path.description,
                pathIndex: path.id,
                tokenSymbols: [path.tokenA, path.tokenB, path.tokenC],
                amountIn: ethers.utils.formatUnits(testAmount, tokenA.decimals),
                amountB: ethers.utils.formatUnits(amountB, tokenB.decimals),
                amountC: ethers.utils.formatUnits(amountC, tokenC.decimals),
                finalAmount: ethers.utils.formatUnits(finalAmount, tokenA.decimals),
                profit: ethers.utils.formatUnits(profit, tokenA.decimals),
                profitPercentage: profitPercentage,
                profitable: profitPercentage > config.triangularArbitrage.minProfitPercentage,
                timestamp: new Date().toISOString(),
                gasEstimate: null // Sarà calcolato se necessario
            };
            
            // Aggiungi informazioni sulla liquidità se profittevole
            if (opportunity.profitable) {
                const [liquidityAB, liquidityBC, liquidityCA] = await Promise.all([
                    this.getLiquidity(tokenA.address, tokenB.address),
                    this.getLiquidity(tokenB.address, tokenC.address),
                    this.getLiquidity(tokenC.address, tokenA.address)
                ]);
                
                opportunity.liquidity = {
                    AB: liquidityAB,
                    BC: liquidityBC,
                    CA: liquidityCA
                };
                
                logger.info('🎯 Opportunità triangolare rilevata!', {
                    path: opportunity.path,
                    profit: opportunity.profit,
                    profitPercentage: opportunity.profitPercentage.toFixed(4) + '%',
                    amountIn: opportunity.amountIn
                });
            }
            
            return opportunity;
            
        } catch (error) {
            logger.error('Errore nel calcolo opportunità triangolare:', {
                error: error.message,
                stack: error.stack,
                path: path.name
            });
            return null;
        }
    }
    
    /**
     * Scansiona tutti i percorsi triangolari
     */
    async scanAllTriangularPaths() {
        try {
            const paths = config.getAllTriangularPaths();
            const opportunities = [];
            
            logger.debug(`Scansionando ${paths.length} percorsi triangolari...`);
            
            // Scansiona tutti i percorsi in parallelo
            const results = await Promise.all(
                paths.map(path => 
                    this.calculateTriangularOpportunity(path, config.triangularArbitrage.minAmount)
                )
            );
            
            // Filtra i risultati validi
            for (const result of results) {
                if (result) {
                    opportunities.push(result);
                    
                    // Salva nella cronologia
                    this.opportunityHistory.push(result);
                    
                    // Mantieni solo gli ultimi 1000 record
                    if (this.opportunityHistory.length > 1000) {
                        this.opportunityHistory = this.opportunityHistory.slice(-1000);
                    }
                }
            }
            
            // Log delle opportunità profittevoli
            const profitableOpportunities = opportunities.filter(o => o.profitable);
            if (profitableOpportunities.length > 0) {
                logger.info(`📊 Trovate ${profitableOpportunities.length} opportunità profittevoli:`, {
                    opportunities: profitableOpportunities.map(o => ({
                        path: o.path,
                        profit: o.profit,
                        profitPercentage: o.profitPercentage.toFixed(4) + '%'
                    }))
                });
            }
            
            return opportunities;
            
        } catch (error) {
            logger.error('Errore nella scansione percorsi triangolari:', {
                error: error.message,
                stack: error.stack
            });
            return [];
        }
    }
    
    /**
     * Trova la migliore opportunità
     */
    async findBestOpportunity() {
        const opportunities = await this.scanAllTriangularPaths();
        const profitable = opportunities.filter(o => o.profitable);
        
        if (profitable.length === 0) {
            return null;
        }
        
        // Ordina per profitto percentuale decrescente
        profitable.sort((a, b) => b.profitPercentage - a.profitPercentage);
        
        return profitable[0];
    }
    
    /**
     * Avvia il monitoraggio continuo
     */
    async startMonitoring() {
        if (this.isMonitoring) {
            logger.warn('Il monitoraggio è già attivo');
            return;
        }
        
        this.isMonitoring = true;
        logger.info('🚀 Avvio monitoraggio arbitraggio triangolare...', {
            interval: config.monitoring.triangularScanInterval + 'ms',
            minProfit: config.triangularArbitrage.minProfitPercentage + '%',
            paths: config.triangularArbitrage.paths.length
        });
        
        // Loop principale di monitoraggio
        const monitoringLoop = async () => {
            while (this.isMonitoring) {
                try {
                    const startTime = Date.now();
                    
                    // Scansiona per opportunità
                    const opportunities = await this.scanAllTriangularPaths();
                    const profitable = opportunities.filter(o => o.profitable);
                    
                    const scanTime = Date.now() - startTime;
                    
                    logger.debug(`Scansione completata in ${scanTime}ms`, {
                        totalOpportunities: opportunities.length,
                        profitableOpportunities: profitable.length,
                        scanTime
                    });
                    
                    // Attendi prima della prossima scansione
                    await new Promise(resolve => 
                        setTimeout(resolve, config.monitoring.triangularScanInterval)
                    );
                    
                } catch (error) {
                    logger.error('Errore nel loop di monitoraggio:', {
                        error: error.message,
                        stack: error.stack
                    });
                    
                    // Attendi un po' prima di riprovare
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        };
        
        // Avvia il loop di monitoraggio
        monitoringLoop();
    }
    
    /**
     * Ferma il monitoraggio
     */
    stopMonitoring() {
        if (!this.isMonitoring) {
            logger.warn('Il monitoraggio non è attivo');
            return;
        }
        
        this.isMonitoring = false;
        logger.info('🛑 Monitoraggio fermato');
    }
    
    /**
     * Ottieni statistiche delle opportunità
     */
    getOpportunityStats() {
        const profitable = this.opportunityHistory.filter(o => o.profitable);
        const totalOpportunities = this.opportunityHistory.length;
        
        if (totalOpportunities === 0) {
            return {
                totalScans: 0,
                profitableOpportunities: 0,
                profitabilityRate: 0,
                avgProfit: 0,
                bestOpportunity: null
            };
        }
        
        const avgProfit = profitable.reduce((sum, o) => sum + o.profitPercentage, 0) / profitable.length;
        const bestOpportunity = profitable.reduce((best, current) => 
            current.profitPercentage > best.profitPercentage ? current : best, 
            profitable[0]
        );
        
        return {
            totalScans: totalOpportunities,
            profitableOpportunities: profitable.length,
            profitabilityRate: ((profitable.length / totalOpportunities) * 100).toFixed(2),
            avgProfit: avgProfit.toFixed(4),
            bestOpportunity: bestOpportunity ? {
                path: bestOpportunity.path,
                profit: bestOpportunity.profit,
                profitPercentage: bestOpportunity.profitPercentage.toFixed(4) + '%',
                timestamp: bestOpportunity.timestamp
            } : null
        };
    }
    
    /**
     * Verifica la connessione alla rete
     */
    async checkConnection() {
        try {
            const blockNumber = await this.provider.getBlockNumber();
            const network = await this.provider.getNetwork();
            
            logger.info('Connessione alla rete verificata:', {
                network: network.name,
                chainId: network.chainId,
                blockNumber
            });
            
            return true;
        } catch (error) {
            logger.error('Errore nella connessione alla rete:', {
                error: error.message,
                rpcUrl: config.networks.bscTestnet.rpcUrl
            });
            return false;
        }
    }
    
    /**
     * Pulisce la cache dei prezzi
     */
    clearPriceCache() {
        this.priceCache.clear();
        logger.info('Cache dei prezzi pulita');
    }
    
    /**
     * Ottieni statistiche della cache
     */
    getCacheStats() {
        return {
            cacheSize: this.priceCache.size,
            cacheEnabled: config.monitoring.enableCaching,
            cacheTTL: config.monitoring.cacheTTL
        };
    }
}

module.exports = TriangularArbitrageMonitor; 