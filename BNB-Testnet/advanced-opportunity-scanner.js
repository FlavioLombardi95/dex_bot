#!/usr/bin/env node

console.log('🚀 SCANNER OPPORTUNITÀ AVANZATO - RICERCA REALE');
console.log('================================================');

const { ethers } = require('ethers');
const TelegramNotifier = require('./telegram-notifier');

class AdvancedOpportunityScanner {
    constructor() {
        // Provider multipli per ridondanza
        this.providers = [
            new ethers.providers.JsonRpcProvider('https://bsc-testnet.public.blastapi.io'),
            new ethers.providers.JsonRpcProvider('https://bsc-testnet.publicnode.com'),
            new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545')
        ];
        this.currentProviderIndex = 0;
        this.provider = this.providers[this.currentProviderIndex];
        
        // Router PancakeSwap V2
        this.routerAddress = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1'; // Testnet
        this.factoryAddress = '0x6725F303b657a9451d8BA641348b6761A6CC7a17'; // Testnet
        
        this.routerABI = [
            'function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)',
            'function factory() external pure returns (address)',
            'function WETH() external pure returns (address)'
        ];
        
        this.factoryABI = [
            'function getPair(address tokenA, address tokenB) external view returns (address pair)',
            'function allPairs(uint) external view returns (address pair)',
            'function allPairsLength() external view returns (uint)'
        ];
        
        this.pairABI = [
            'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
            'function token0() external view returns (address)',
            'function token1() external view returns (address)'
        ];
        
        this.router = new ethers.Contract(this.routerAddress, this.routerABI, this.provider);
        this.factory = new ethers.Contract(this.factoryAddress, this.factoryABI, this.provider);
        
        // Token principali BSC Testnet
        this.tokens = {
            WBNB: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
            BUSD: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
            USDT: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
            CAKE: '0xF9f93cF501BFaB6499F2A3C8C5C2C3C8C5C2C3C8',
            ADA: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
            DOT: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
            LINK: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
            UNI: '0xBf5140A22578168FD562DCcF235E5D43A02ce9B1',
            XRP: '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE',
            ALPACA: '0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F',
            XVS: '0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63'
        };
        
        // Configurazione scanner
        this.config = {
            minProfitPercent: 0.1,        // Profitto minimo 0.1%
            maxSlippage: 0.5,             // Slippage massimo 0.5%
            gasPrice: 5,                  // Gas price in gwei
            gasLimit: 300000,             // Gas limit per transazione
            scanInterval: 2000,           // Intervallo scansione 2 secondi
            maxConcurrent: 5,             // Max scansioni concorrenti
            enableRealTime: true,         // Scansione tempo reale
            enableNewTokens: true,        // Cerca nuovi token
            enableLiquidityScan: true     // Scansione liquidità
        };
        
        // Statistiche
        this.stats = {
            totalScans: 0,
            opportunitiesFound: 0,
            profitableFound: 0,
            lastScanTime: null,
            startTime: Date.now()
        };
        
        // Notifiche Telegram
        this.telegramNotifier = new TelegramNotifier();
        
        // Cache per evitare scansioni duplicate
        this.opportunityCache = new Map();
        this.cacheTimeout = 30000; // 30 secondi
    }
    
    /**
     * Cambia provider se quello attuale non risponde
     */
    async switchProvider() {
        this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
        this.provider = this.providers[this.currentProviderIndex];
        this.router = new ethers.Contract(this.routerAddress, this.routerABI, this.provider);
        this.factory = new ethers.Contract(this.factoryAddress, this.factoryABI, this.provider);
        console.log(`🔄 Provider cambiato a: ${this.currentProviderIndex + 1}`);
    }
    
    /**
     * Ottiene il prezzo corrente di un token
     */
    async getTokenPrice(tokenAddress, baseToken = 'WBNB') {
        try {
            const amountIn = ethers.utils.parseEther('1');
            const amounts = await this.router.getAmountsOut(amountIn, [tokenAddress, this.tokens[baseToken]]);
            return parseFloat(ethers.utils.formatEther(amounts[1]));
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Calcola arbitraggio triangolare con costi reali
     */
    async calculateTriangularArbitrage(path, amountIn) {
        try {
            const startTime = Date.now();
            const amount = ethers.utils.parseEther(amountIn.toString());
            
            // Step 1: Token1 -> Token2
            const amounts1 = await this.router.getAmountsOut(amount, [
                this.tokens[path[0]], 
                this.tokens[path[1]]
            ]);
            
            // Step 2: Token2 -> Token3
            const amounts2 = await this.router.getAmountsOut(amounts1[1], [
                this.tokens[path[1]], 
                this.tokens[path[2]]
            ]);
            
            // Step 3: Token3 -> Token1 (ritorno)
            const amounts3 = await this.router.getAmountsOut(amounts2[1], [
                this.tokens[path[2]], 
                this.tokens[path[3]]
            ]);
            
            const finalAmount = parseFloat(ethers.utils.formatEther(amounts3[1]));
            const inputAmount = parseFloat(amountIn);
            
            // Calcolo profitto
            const grossProfit = finalAmount - inputAmount;
            const grossProfitPercent = (grossProfit / inputAmount) * 100;
            
            // Calcolo costi gas
            const gasCostBNB = (this.config.gasPrice * this.config.gasLimit) / 1e9;
            let gasCostInToken = gasCostBNB;
            
            // Converti gas cost nel token di partenza
            if (path[0] !== 'WBNB') {
                const tokenPrice = await this.getTokenPrice(this.tokens[path[0]]);
                if (tokenPrice) {
                    gasCostInToken = gasCostBNB / tokenPrice;
                }
            }
            
            const netProfit = grossProfit - gasCostInToken;
            const netProfitPercent = (netProfit / inputAmount) * 100;
            
            const executionTime = Date.now() - startTime;
            
            return {
                path: path.join('-'),
                inputAmount,
                finalAmount,
                grossProfit,
                grossProfitPercent,
                gasCostInToken,
                netProfit,
                netProfitPercent,
                profitable: netProfit > 0 && netProfitPercent >= this.config.minProfitPercent,
                executionTime,
                amounts: {
                    step1: parseFloat(ethers.utils.formatEther(amounts1[1])),
                    step2: parseFloat(ethers.utils.formatEther(amounts2[1])),
                    step3: finalAmount
                }
            };
        } catch (error) {
            throw new Error(`Calcolo fallito: ${error.message}`);
        }
    }
    
    /**
     * Genera percorsi di arbitraggio dinamici
     */
    generateArbitragePaths() {
        const paths = [];
        const tokenList = Object.keys(this.tokens);
        
        // Percorsi classici
        const classicPaths = [
            ['WBNB', 'BUSD', 'USDT', 'WBNB'],
            ['WBNB', 'CAKE', 'BUSD', 'WBNB'],
            ['WBNB', 'ADA', 'USDT', 'WBNB'],
            ['WBNB', 'LINK', 'USDT', 'WBNB'],
            ['CAKE', 'BUSD', 'USDT', 'CAKE'],
            ['ADA', 'BUSD', 'DOT', 'ADA'],
            ['LINK', 'USDT', 'CAKE', 'LINK']
        ];
        
        paths.push(...classicPaths);
        
        // Percorsi dinamici con token casuali
        for (let i = 0; i < 10; i++) {
            const path = [];
            for (let j = 0; j < 4; j++) {
                const randomToken = tokenList[Math.floor(Math.random() * tokenList.length)];
                path.push(randomToken);
            }
            paths.push(path);
        }
        
        return paths;
    }
    
    /**
     * Scansione opportunità con importi ottimizzati
     */
    async scanOpportunities() {
        this.stats.totalScans++;
        this.stats.lastScanTime = Date.now();
        
        const paths = this.generateArbitragePaths();
        const opportunities = [];
        
        console.log(`\n🔍 Scansione ${this.stats.totalScans} - ${paths.length} percorsi...`);
        
        // Importi da testare (ottimizzati per testnet)
        const amounts = [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0];
        
        for (const path of paths) {
            for (const amount of amounts) {
                try {
                    const result = await this.calculateTriangularArbitrage(path, amount);
                    
                    if (result.profitable) {
                        const cacheKey = `${result.path}-${amount}`;
                        const cached = this.opportunityCache.get(cacheKey);
                        
                        if (!cached || (Date.now() - cached.timestamp) > this.cacheTimeout) {
                            this.opportunityCache.set(cacheKey, {
                                ...result,
                                timestamp: Date.now()
                            });
                            
                            opportunities.push(result);
                            this.stats.opportunitiesFound++;
                            this.stats.profitableFound++;
                            
                            console.log(`💰 OPPORTUNITÀ TROVATA!`);
                            console.log(`   🔺 Percorso: ${result.path}`);
                            console.log(`   💵 Importo: ${amount} ${path[0]}`);
                            console.log(`   📈 Profitto: ${result.netProfitPercent.toFixed(4)}%`);
                            console.log(`   💰 Netto: ${result.netProfit.toFixed(6)} ${path[0]}`);
                            console.log(`   ⏱️  Tempo: ${result.executionTime}ms`);
                            
                            // Notifica Telegram
                            await this.telegramNotifier.sendOpportunityAlert({
                                path: result.path,
                                profitPercent: result.netProfitPercent,
                                amount: amount,
                                token: path[0],
                                initialPrice: result.inputAmount,
                                finalPrice: result.finalAmount,
                                priceDifference: `${result.netProfitPercent.toFixed(4)}%`
                            });
                        }
                    }
                    
                    // Rate limiting
                    await new Promise(resolve => setTimeout(resolve, 50));
                    
                } catch (error) {
                    // Cambia provider se errore di rete
                    if (error.message.includes('network') || error.message.includes('timeout')) {
                        await this.switchProvider();
                    }
                }
            }
        }
        
        return opportunities;
    }
    
    /**
     * Avvia scansione continua
     */
    async startContinuousScan() {
        console.log('🚀 Avvio scansione continua...');
        console.log(`📊 Configurazione:`);
        console.log(`   Profitto minimo: ${this.config.minProfitPercent}%`);
        console.log(`   Intervallo: ${this.config.scanInterval}ms`);
        console.log(`   Gas price: ${this.config.gasPrice} gwei`);
        console.log(`   Gas limit: ${this.config.gasLimit}`);
        
        // Notifica avvio
        await this.telegramNotifier.sendSystemAlert('🚀 Scanner avanzato avviato - Ricerca opportunità reali');
        
        while (true) {
            try {
                await this.scanOpportunities();
                
                // Report periodico
                if (this.stats.totalScans % 10 === 0) {
                    this.displayStats();
                }
                
                await new Promise(resolve => setTimeout(resolve, this.config.scanInterval));
                
            } catch (error) {
                console.error(`❌ Errore scansione: ${error.message}`);
                await this.switchProvider();
                await new Promise(resolve => setTimeout(resolve, 5000));
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
        console.log(`   💰 Opportunità trovate: ${this.stats.opportunitiesFound}`);
        console.log(`   ✅ Profittevoli: ${this.stats.profitableFound}`);
        console.log(`   📈 Tasso successo: ${((this.stats.profitableFound / this.stats.totalScans) * 100).toFixed(2)}%`);
        console.log(`   ⏰ Ultima scansione: ${this.stats.lastScanTime ? new Date(this.stats.lastScanTime).toLocaleTimeString() : 'N/A'}`);
    }
}

// Gestione segnali
process.on('SIGINT', async () => {
    console.log('\n🛑 Arresto scanner...');
    process.exit(0);
});

// Avvio
if (require.main === module) {
    const scanner = new AdvancedOpportunityScanner();
    scanner.startContinuousScan().catch(console.error);
}

module.exports = AdvancedOpportunityScanner; 