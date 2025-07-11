const { ethers } = require('ethers');
const winston = require('winston');
const { config } = require('./config');

// Configurazione logger
const logger = winston.createLogger({
    level: config.logging.level,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: config.logging.file }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// ABI minimale per router Uniswap
const ROUTER_ABI = [
    'function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)',
    'function factory() external pure returns (address)'
];

// ABI minimale per factory Uniswap
const FACTORY_ABI = [
    'function getPair(address tokenA, address tokenB) external view returns (address pair)'
];

// ABI minimale per pair Uniswap
const PAIR_ABI = [
    'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)'
];

class PriceMonitor {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(config.network.rpcUrl);
        this.uniswapRouter = new ethers.Contract(config.dexRouters.uniswap, ROUTER_ABI, this.provider);
        this.sushiswapRouter = new ethers.Contract(config.dexRouters.sushiswap, ROUTER_ABI, this.provider);
        this.uniswapFactory = new ethers.Contract(config.dexFactories.uniswap, FACTORY_ABI, this.provider);
        this.sushiswapFactory = new ethers.Contract(config.dexFactories.sushiswap, FACTORY_ABI, this.provider);
        
        logger.info('PriceMonitor inizializzato con successo');
    }
    
    /**
     * Ottiene il prezzo su un DEX specifico
     */
    async getPrice(dexRouter, tokenA, tokenB, amountIn) {
        try {
            const path = [tokenA, tokenB];
            const amounts = await dexRouter.getAmountsOut(amountIn, path);
            
            if (amounts.length < 2) {
                throw new Error('Risposta invalida dal router');
            }
            
            return amounts[1];
        } catch (error) {
            logger.error('Errore nel recupero prezzo:', {
                error: error.message,
                tokenA,
                tokenB,
                amountIn: amountIn.toString()
            });
            throw error;
        }
    }
    
    /**
     * Verifica se una coppia di token esiste su un DEX
     */
    async checkPairExists(factory, tokenA, tokenB) {
        try {
            const pairAddress = await factory.getPair(tokenA, tokenB);
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
    async getLiquidity(factory, tokenA, tokenB) {
        try {
            const pairAddress = await factory.getPair(tokenA, tokenB);
            if (pairAddress === ethers.constants.AddressZero) {
                return { reserve0: 0, reserve1: 0 };
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
            return { reserve0: 0, reserve1: 0 };
        }
    }
    
    /**
     * Monitora una coppia di token per opportunità di arbitraggio
     */
    async monitorPair(tokenASymbol, tokenBSymbol) {
        try {
            const tokenA = config.tokens[tokenASymbol];
            const tokenB = config.tokens[tokenBSymbol];
            
            if (!tokenA || !tokenB) {
                logger.warn('Token non supportato:', { tokenASymbol, tokenBSymbol });
                return null;
            }
            
            // Verifica esistenza coppie
            const [uniswapExists, sushiExists] = await Promise.all([
                this.checkPairExists(this.uniswapFactory, tokenA.address, tokenB.address),
                this.checkPairExists(this.sushiswapFactory, tokenA.address, tokenB.address)
            ]);
            
            if (!uniswapExists || !sushiExists) {
                logger.debug('Coppia non esiste su tutti i DEX:', {
                    pair: `${tokenASymbol}/${tokenBSymbol}`,
                    uniswapExists,
                    sushiExists
                });
                return null;
            }
            
            // Calcola importo di test (esempio: 1 unità del token A)
            const testAmount = ethers.utils.parseUnits('1', tokenA.decimals);
            
            // Ottieni prezzi da entrambi i DEX
            const [uniswapPrice, sushiPrice] = await Promise.all([
                this.getPrice(this.uniswapRouter, tokenA.address, tokenB.address, testAmount),
                this.getPrice(this.sushiswapRouter, tokenA.address, tokenB.address, testAmount)
            ]);
            
            // Calcola differenza percentuale
            const priceDiff = uniswapPrice.sub(sushiPrice);
            const avgPrice = uniswapPrice.add(sushiPrice).div(2);
            const priceDiffPercent = priceDiff.mul(100).div(avgPrice);
            
            const opportunity = {
                pair: `${tokenASymbol}/${tokenBSymbol}`,
                uniswapPrice: ethers.utils.formatUnits(uniswapPrice, tokenB.decimals),
                sushiPrice: ethers.utils.formatUnits(sushiPrice, tokenB.decimals),
                priceDiffPercent: priceDiffPercent.toNumber(),
                timestamp: new Date().toISOString(),
                profitable: Math.abs(priceDiffPercent.toNumber()) > (config.arbitrage.minProfitThreshold * 100)
            };
            
            if (opportunity.profitable) {
                logger.info('Opportunità di arbitraggio rilevata:', opportunity);
                
                // Aggiungi informazioni su liquidità
                const [uniLiquidity, sushiLiquidity] = await Promise.all([
                    this.getLiquidity(this.uniswapFactory, tokenA.address, tokenB.address),
                    this.getLiquidity(this.sushiswapFactory, tokenA.address, tokenB.address)
                ]);
                
                opportunity.liquidity = {
                    uniswap: uniLiquidity,
                    sushi: sushiLiquidity
                };
            }
            
            return opportunity;
            
        } catch (error) {
            logger.error('Errore nel monitoraggio coppia:', {
                error: error.message,
                stack: error.stack,
                pair: `${tokenASymbol}/${tokenBSymbol}`
            });
            return null;
        }
    }
    
    /**
     * Monitora tutte le coppie configurate
     */
    async monitorAllPairs() {
        logger.info('Avvio monitoraggio di tutte le coppie...');
        
        const opportunities = [];
        
        for (const pair of config.tradingPairs) {
            try {
                const opportunity = await this.monitorPair(pair.tokenA, pair.tokenB);
                if (opportunity) {
                    opportunities.push(opportunity);
                }
                
                // Piccola pausa per evitare rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                logger.error('Errore nel monitoraggio coppia:', {
                    error: error.message,
                    pair: `${pair.tokenA}/${pair.tokenB}`
                });
            }
        }
        
        // Filtra solo le opportunità profittevoli
        const profitableOpportunities = opportunities.filter(opp => opp.profitable);
        
        if (profitableOpportunities.length > 0) {
            logger.info(`Trovate ${profitableOpportunities.length} opportunità profittevoli`);
        }
        
        return profitableOpportunities;
    }
    
    /**
     * Controlla la connessione alla blockchain
     */
    async checkConnection() {
        try {
            const blockNumber = await this.provider.getBlockNumber();
            logger.info('Connessione blockchain OK:', { blockNumber });
            return true;
        } catch (error) {
            logger.error('Errore connessione blockchain:', {
                error: error.message,
                rpcUrl: config.network.rpcUrl
            });
            return false;
        }
    }
}

module.exports = { PriceMonitor }; 