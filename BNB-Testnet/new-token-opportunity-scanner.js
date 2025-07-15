#!/usr/bin/env node

console.log('🆕 SCANNER NUOVI TOKEN E OPPORTUNITÀ LIQUIDITÀ');
console.log('==============================================');

const { ethers } = require('ethers');
const TelegramNotifier = require('./telegram-notifier');

class NewTokenOpportunityScanner {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider('https://bsc-testnet.public.blastapi.io');
        
        // Factory PancakeSwap V2 Testnet
        this.factoryAddress = '0x6725F303b657a9451d8BA641348b6761A6CC7a17';
        this.routerAddress = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1';
        
        this.factoryABI = [
            'function getPair(address tokenA, address tokenB) external view returns (address pair)',
            'function allPairs(uint) external view returns (address pair)',
            'function allPairsLength() external view returns (uint)',
            'event PairCreated(address indexed token0, address indexed token1, address pair, uint)'
        ];
        
        this.pairABI = [
            'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
            'function token0() external view returns (address)',
            'function token1() external view returns (address)',
            'function totalSupply() external view returns (uint)'
        ];
        
        this.tokenABI = [
            'function name() external view returns (string)',
            'function symbol() external view returns (string)',
            'function decimals() external view returns (uint8)',
            'function totalSupply() external view returns (uint)'
        ];
        
        this.factory = new ethers.Contract(this.factoryAddress, this.factoryABI, this.provider);
        this.router = new ethers.Contract(this.routerAddress, [
            'function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)'
        ], this.provider);
        
        // Token base per confronti
        this.baseTokens = {
            WBNB: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
            BUSD: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
            USDT: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'
        };
        
        // Configurazione
        this.config = {
            minLiquidityBNB: 0.01,        // Liquidità minima in BNB
            maxLiquidityBNB: 10,          // Liquidità massima per opportunità
            minPriceImpact: 0.5,          // Impatto prezzo minimo 0.5%
            maxPriceImpact: 5,            // Impatto prezzo massimo 5%
            scanInterval: 5000,           // 5 secondi
            maxPairsToScan: 100,          // Max coppie da scansionare
            enableArbitrage: true,        // Cerca arbitraggi
            enableLiquidity: true         // Cerca opportunità liquidità
        };
        
        // Cache per evitare duplicati
        this.scannedPairs = new Set();
        this.opportunityCache = new Map();
        this.cacheTimeout = 60000; // 1 minuto
        
        // Statistiche
        this.stats = {
            totalScans: 0,
            newPairsFound: 0,
            opportunitiesFound: 0,
            startTime: Date.now()
        };
        
        // Notifiche
        this.telegramNotifier = new TelegramNotifier();
    }
    
    /**
     * Ottiene informazioni su un token
     */
    async getTokenInfo(tokenAddress) {
        try {
            const token = new ethers.Contract(tokenAddress, this.tokenABI, this.provider);
            const [name, symbol, decimals, totalSupply] = await Promise.all([
                token.name(),
                token.symbol(),
                token.decimals(),
                token.totalSupply()
            ]);
            
            return {
                address: tokenAddress,
                name,
                symbol,
                decimals,
                totalSupply: parseFloat(ethers.utils.formatUnits(totalSupply, decimals))
            };
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Ottiene liquidità di una coppia
     */
    async getPairLiquidity(pairAddress) {
        try {
            const pair = new ethers.Contract(pairAddress, this.pairABI, this.provider);
            const [token0, token1, reserves, totalSupply] = await Promise.all([
                pair.token0(),
                pair.token1(),
                pair.getReserves(),
                pair.totalSupply()
            ]);
            
            const [token0Info, token1Info] = await Promise.all([
                this.getTokenInfo(token0),
                this.getTokenInfo(token1)
            ]);
            
            if (!token0Info || !token1Info) return null;
            
            const reserve0 = parseFloat(ethers.utils.formatUnits(reserves[0], token0Info.decimals));
            const reserve1 = parseFloat(ethers.utils.formatUnits(reserves[1], token1Info.decimals));
            
            // Calcola liquidità in BNB
            let liquidityInBNB = 0;
            if (token0 === this.baseTokens.WBNB) {
                liquidityInBNB = reserve0 * 2; // WBNB + equivalente in BNB
            } else if (token1 === this.baseTokens.WBNB) {
                liquidityInBNB = reserve1 * 2;
            } else {
                // Stima liquidità tramite prezzo
                try {
                    const amounts = await this.router.getAmountsOut(
                        ethers.utils.parseEther('1'),
                        [token0, this.baseTokens.WBNB]
                    );
                    const token0PriceInBNB = parseFloat(ethers.utils.formatEther(amounts[1]));
                    liquidityInBNB = (reserve0 * token0PriceInBNB) + reserve1;
                } catch (error) {
                    liquidityInBNB = reserve0 + reserve1; // Fallback
                }
            }
            
            return {
                pairAddress,
                token0: token0Info,
                token1: token1Info,
                reserve0,
                reserve1,
                liquidityInBNB,
                totalSupply: parseFloat(ethers.utils.formatEther(totalSupply))
            };
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Calcola impatto prezzo per un trade
     */
    async calculatePriceImpact(pairAddress, amountIn, isBuy = true) {
        try {
            const pair = new ethers.Contract(pairAddress, this.pairABI, this.provider);
            const [token0, reserves] = await Promise.all([
                pair.token0(),
                pair.getReserves()
            ]);
            
            const token0Info = await this.getTokenInfo(token0);
            if (!token0Info) return null;
            
            const reserve0 = parseFloat(ethers.utils.formatUnits(reserves[0], token0Info.decimals));
            const reserve1 = parseFloat(ethers.utils.formatUnits(reserves[1], token0Info.decimals));
            
            // Prezzo prima del trade
            const priceBefore = reserve1 / reserve0;
            
            // Prezzo dopo il trade (semplificato)
            let priceAfter;
            if (isBuy) {
                const newReserve0 = reserve0 + amountIn;
                const newReserve1 = reserve1 - (amountIn * priceBefore * 0.997); // 0.3% fee
                priceAfter = newReserve1 / newReserve0;
            } else {
                const newReserve0 = reserve0 - amountIn;
                const newReserve1 = reserve1 + (amountIn * priceBefore * 0.997);
                priceAfter = newReserve1 / newReserve0;
            }
            
            const priceImpact = Math.abs((priceAfter - priceBefore) / priceBefore) * 100;
            return priceImpact;
            
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Cerca opportunità di arbitraggio per nuovi token
     */
    async findArbitrageOpportunities(pairInfo) {
        const opportunities = [];
        
        try {
            // Testa percorsi di arbitraggio
            const paths = [
                [this.baseTokens.WBNB, pairInfo.token0.address, pairInfo.token1.address, this.baseTokens.WBNB],
                [this.baseTokens.WBNB, pairInfo.token1.address, pairInfo.token0.address, this.baseTokens.WBNB],
                [this.baseTokens.BUSD, pairInfo.token0.address, pairInfo.token1.address, this.baseTokens.BUSD],
                [this.baseTokens.USDT, pairInfo.token0.address, pairInfo.token1.address, this.baseTokens.USDT]
            ];
            
            for (const path of paths) {
                try {
                    const amountIn = ethers.utils.parseEther('0.1'); // 0.1 BNB/BUSD/USDT
                    const amounts = await this.router.getAmountsOut(amountIn, path);
                    
                    const inputAmount = parseFloat(ethers.utils.formatEther(amountIn));
                    const outputAmount = parseFloat(ethers.utils.formatEther(amounts[amounts.length - 1]));
                    
                    const profit = outputAmount - inputAmount;
                    const profitPercent = (profit / inputAmount) * 100;
                    
                    if (profitPercent > 0.5) { // Minimo 0.5% profitto
                        opportunities.push({
                            type: 'arbitrage',
                            path: path.map(addr => {
                                const token = Object.entries(this.baseTokens).find(([k, v]) => v === addr);
                                return token ? token[0] : addr.substring(0, 8) + '...';
                            }).join('-'),
                            profitPercent,
                            inputAmount,
                            outputAmount,
                            pair: `${pairInfo.token0.symbol}/${pairInfo.token1.symbol}`
                        });
                    }
                } catch (error) {
                    // Ignora errori per percorsi non validi
                }
            }
        } catch (error) {
            console.error('Errore ricerca arbitraggio:', error.message);
        }
        
        return opportunities;
    }
    
    /**
     * Scansione nuove coppie e opportunità
     */
    async scanNewPairs() {
        try {
            const totalPairs = await this.factory.allPairsLength();
            console.log(`🔍 Scansione ${totalPairs} coppie totali...`);
            
            const startIndex = Math.max(0, totalPairs - this.config.maxPairsToScan);
            const opportunities = [];
            
            for (let i = startIndex; i < totalPairs; i++) {
                try {
                    const pairAddress = await this.factory.allPairs(i);
                    
                    if (this.scannedPairs.has(pairAddress)) {
                        continue;
                    }
                    
                    this.scannedPairs.add(pairAddress);
                    const pairInfo = await this.getPairLiquidity(pairAddress);
                    
                    if (!pairInfo) continue;
                    
                    // Filtra per liquidità
                    if (pairInfo.liquidityInBNB < this.config.minLiquidityBNB || 
                        pairInfo.liquidityInBNB > this.config.maxLiquidityBNB) {
                        continue;
                    }
                    
                    this.stats.newPairsFound++;
                    console.log(`🆕 Nuova coppia: ${pairInfo.token0.symbol}/${pairInfo.token1.symbol}`);
                    console.log(`   💰 Liquidità: ${pairInfo.liquidityInBNB.toFixed(4)} BNB`);
                    console.log(`   📍 Address: ${pairAddress}`);
                    
                    // Cerca opportunità
                    if (this.config.enableArbitrage) {
                        const arbitrageOpps = await this.findArbitrageOpportunities(pairInfo);
                        opportunities.push(...arbitrageOpps);
                    }
                    
                    if (this.config.enableLiquidity) {
                        // Cerca opportunità di liquidità
                        const priceImpact = await this.calculatePriceImpact(pairAddress, 0.1);
                        if (priceImpact && priceImpact >= this.config.minPriceImpact && priceImpact <= this.config.maxPriceImpact) {
                            opportunities.push({
                                type: 'liquidity',
                                pair: `${pairInfo.token0.symbol}/${pairInfo.token1.symbol}`,
                                liquidityInBNB: pairInfo.liquidityInBNB,
                                priceImpact,
                                pairAddress
                            });
                        }
                    }
                    
                    // Rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                } catch (error) {
                    // Ignora errori per coppie problematiche
                }
            }
            
            return opportunities;
            
        } catch (error) {
            console.error('Errore scansione coppie:', error.message);
            return [];
        }
    }
    
    /**
     * Avvia scansione continua
     */
    async startContinuousScan() {
        console.log('🚀 Avvio scansione continua nuovi token...');
        console.log(`📊 Configurazione:`);
        console.log(`   Liquidità min: ${this.config.minLiquidityBNB} BNB`);
        console.log(`   Liquidità max: ${this.config.maxLiquidityBNB} BNB`);
        console.log(`   Impatto prezzo: ${this.config.minPriceImpact}-${this.config.maxPriceImpact}%`);
        console.log(`   Intervallo: ${this.config.scanInterval}ms`);
        
        // Notifica avvio
        await this.telegramNotifier.sendSystemAlert('🆕 Scanner nuovi token avviato');
        
        while (true) {
            try {
                this.stats.totalScans++;
                console.log(`\n🔍 Scansione ${this.stats.totalScans} - ${new Date().toLocaleTimeString()}`);
                
                const opportunities = await this.scanNewPairs();
                
                for (const opp of opportunities) {
                    const cacheKey = `${opp.type}-${opp.pair}`;
                    const cached = this.opportunityCache.get(cacheKey);
                    
                    if (!cached || (Date.now() - cached.timestamp) > this.cacheTimeout) {
                        this.opportunityCache.set(cacheKey, {
                            ...opp,
                            timestamp: Date.now()
                        });
                        
                        this.stats.opportunitiesFound++;
                        
                        console.log(`💰 OPPORTUNITÀ TROVATA!`);
                        console.log(`   📊 Tipo: ${opp.type}`);
                        console.log(`   🔺 Coppia: ${opp.pair}`);
                        
                        if (opp.type === 'arbitrage') {
                            console.log(`   📈 Profitto: ${opp.profitPercent.toFixed(4)}%`);
                            console.log(`   💰 Input: ${opp.inputAmount} ${opp.path.split('-')[0]}`);
                        } else if (opp.type === 'liquidity') {
                            console.log(`   💧 Liquidità: ${opp.liquidityInBNB.toFixed(4)} BNB`);
                            console.log(`   📊 Impatto: ${opp.priceImpact.toFixed(2)}%`);
                        }
                        
                        // Notifica Telegram
                        await this.telegramNotifier.sendOpportunityAlert({
                            path: opp.pair,
                            profitPercent: opp.type === 'arbitrage' ? opp.profitPercent : opp.priceImpact,
                            amount: opp.type === 'arbitrage' ? opp.inputAmount : opp.liquidityInBNB,
                            token: opp.type === 'arbitrage' ? opp.path.split('-')[0] : 'BNB',
                            initialPrice: opp.type === 'arbitrage' ? opp.inputAmount : opp.liquidityInBNB,
                            finalPrice: opp.type === 'arbitrage' ? opp.outputAmount : opp.priceImpact,
                            priceDifference: opp.type === 'arbitrage' ? `${opp.profitPercent.toFixed(4)}%` : `${opp.priceImpact.toFixed(2)}%`
                        });
                    }
                }
                
                // Report periodico
                if (this.stats.totalScans % 10 === 0) {
                    this.displayStats();
                }
                
                await new Promise(resolve => setTimeout(resolve, this.config.scanInterval));
                
            } catch (error) {
                console.error(`❌ Errore scansione: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }
    }
    
    /**
     * Mostra statistiche
     */
    displayStats() {
        const uptime = Date.now() - this.stats.startTime;
        const uptimeMinutes = Math.round(uptime / 60000);
        
        console.log(`\n📊 STATISTICHE (${uptimeMinutes} min)`);
        console.log(`   🔍 Scansioni totali: ${this.stats.totalScans}`);
        console.log(`   🆕 Nuove coppie: ${this.stats.newPairsFound}`);
        console.log(`   💰 Opportunità: ${this.stats.opportunitiesFound}`);
        console.log(`   📈 Coppie scansionate: ${this.scannedPairs.size}`);
    }
}

// Gestione segnali
process.on('SIGINT', async () => {
    console.log('\n🛑 Arresto scanner nuovi token...');
    process.exit(0);
});

// Avvio
if (require.main === module) {
    const scanner = new NewTokenOpportunityScanner();
    scanner.startContinuousScan().catch(console.error);
}

module.exports = NewTokenOpportunityScanner; 