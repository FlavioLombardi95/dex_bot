console.log('🚀 MONITOR ARBITRAGGIO OTTIMIZZATO - BSC MAINNET');
console.log('==============================================');

const { ethers } = require('ethers');

class OptimizedArbitrageMonitor {
    constructor() {
        // Configurazione ottimizzata
        this.config = {
            // RPC multipli per resilienza
            rpcUrls: [
                'https://bsc-dataseed.binance.org/',
                'https://bsc-dataseed1.defibit.io/',
                'https://bsc-dataseed1.ninicoin.io/',
                'https://bsc-dataseed2.defibit.io/'
            ],
            currentRpcIndex: 0,
            
            // Soglie ottimizzate basate sui test reali
            minProfitPercentage: 0.15, // Soglia minima per coprire gas
            maxSlippage: 2.0,
            
            // Gas ottimizzato
            gasLimit: 250000,
            maxGasPrice: 10, // gwei
            
            // Timing ottimizzato
            scanInterval: 2000, // 2 secondi
            quickScanInterval: 500, // 500ms per opportunità calde
            
            // Risk management
            maxPositionSize: 0.1, // BNB massimi per trade
            minPositionSize: 0.001, // BNB minimi
            
            // Performance tracking
            consecutiveFails: 0,
            maxConsecutiveFails: 5
        };
        
        this.provider = null;
        this.router = null;
        this.isMonitoring = false;
        this.opportunities = [];
        this.stats = {
            totalScans: 0,
            opportunitiesFound: 0,
            profitableFound: 0,
            avgScanTime: 0
        };
        
        this.setupProvider();
        this.setupContracts();
        
        // Token ottimizzati basati sui test
        this.tokens = {
            WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
            BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
            USDT: '0x55d398326f99059fF775485246999027B3197955',
            USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
            CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
            ALPACA: '0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F',
            XVS: '0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63'
        };
        
        // Percorsi ottimizzati (solo quelli con perdite minime dai test)
        this.optimalPaths = [
            { name: 'BNB-CAKE-BUSD', tokens: ['WBNB', 'CAKE', 'BUSD', 'WBNB'], priority: 1, avgLoss: 0.87 },
            { name: 'BNB-ALPACA-BUSD', tokens: ['WBNB', 'ALPACA', 'BUSD', 'WBNB'], priority: 1, avgLoss: 0.63 },
            { name: 'BNB-CAKE-USDT', tokens: ['WBNB', 'CAKE', 'USDT', 'WBNB'], priority: 2, avgLoss: 1.00 },
            { name: 'BNB-ALPACA-USDT', tokens: ['WBNB', 'ALPACA', 'USDT', 'WBNB'], priority: 2, avgLoss: 1.20 },
            { name: 'CAKE-BUSD-USDT', tokens: ['CAKE', 'BUSD', 'USDT', 'CAKE'], priority: 3, avgLoss: 1.50 }
        ];
    }
    
    async setupProvider() {
        try {
            this.provider = new ethers.providers.JsonRpcProvider(
                this.config.rpcUrls[this.config.currentRpcIndex]
            );
            
            // Test connessione
            await this.provider.getBlockNumber();
            console.log(`✅ Connesso a RPC: ${this.config.rpcUrls[this.config.currentRpcIndex]}`);
        } catch (error) {
            console.log(`❌ RPC fallito, tentativo successivo...`);
            await this.switchRPC();
        }
    }
    
    async switchRPC() {
        this.config.currentRpcIndex = (this.config.currentRpcIndex + 1) % this.config.rpcUrls.length;
        await this.setupProvider();
    }
    
    setupContracts() {
        const routerABI = [
            'function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)',
            'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
        ];
        
        this.router = new ethers.Contract(
            '0x10ED43C718714eb63d5aA57B78B54704E256024E',
            routerABI,
            this.provider
        );
    }
    
    async getCurrentGasPrice() {
        try {
            const gasPrice = await this.provider.getGasPrice();
            const gasPriceGwei = ethers.utils.formatUnits(gasPrice, 'gwei');
            return parseFloat(gasPriceGwei);
        } catch (error) {
            return this.config.maxGasPrice; // Fallback
        }
    }
    
    async calculateProfitability(path, amountIn) {
        try {
            const startTime = Date.now();
            
            // Calcola il percorso triangolare
            const amounts1 = await this.router.getAmountsOut(amountIn, 
                [this.tokens[path.tokens[0]], this.tokens[path.tokens[1]]]);
            const amounts2 = await this.router.getAmountsOut(amounts1[1],
                [this.tokens[path.tokens[1]], this.tokens[path.tokens[2]]]);
            const amounts3 = await this.router.getAmountsOut(amounts2[1],
                [this.tokens[path.tokens[2]], this.tokens[path.tokens[3]]]);
            
            const inputAmount = parseFloat(ethers.utils.formatEther(amountIn));
            const outputAmount = parseFloat(ethers.utils.formatEther(amounts3[1]));
            const profit = outputAmount - inputAmount;
            const profitPercentage = (profit / inputAmount) * 100;
            
            // Calcola costo gas stimato
            const gasPrice = await this.getCurrentGasPrice();
            const estimatedGasCost = (this.config.gasLimit * gasPrice) / 1e9; // in BNB
            const netProfit = profit - estimatedGasCost;
            const netProfitPercentage = (netProfit / inputAmount) * 100;
            
            const scanTime = Date.now() - startTime;
            
            return {
                path: path.name,
                inputAmount,
                outputAmount,
                profit,
                profitPercentage,
                gasPrice,
                estimatedGasCost,
                netProfit,
                netProfitPercentage,
                scanTime,
                timestamp: new Date().toISOString(),
                amounts: {
                    step1: parseFloat(ethers.utils.formatEther(amounts1[1])),
                    step2: parseFloat(ethers.utils.formatEther(amounts2[1])),
                    step3: outputAmount
                }
            };
        } catch (error) {
            throw new Error(`Calcolo fallito per ${path.name}: ${error.message}`);
        }
    }
    
    async scanForOpportunities() {
        console.log(`\n🔍 Scan #${this.stats.totalScans + 1} - ${new Date().toLocaleTimeString()}`);
        
        const scanStartTime = Date.now();
        const opportunities = [];
        
        // Test amount dinamico basato sulla volatilità
        const testAmounts = [
            ethers.utils.parseEther('0.001'),
            ethers.utils.parseEther('0.005'),
            ethers.utils.parseEther('0.01')
        ];
        
        for (const path of this.optimalPaths) {
            for (const amountIn of testAmounts) {
                try {
                    const result = await this.calculateProfitability(path, amountIn);
                    
                    if (result.netProfitPercentage > this.config.minProfitPercentage) {
                        console.log(`🎯 OPPORTUNITÀ TROVATA!`);
                        console.log(`   Percorso: ${result.path}`);
                        console.log(`   Profitto netto: ${result.netProfit.toFixed(6)} BNB (${result.netProfitPercentage.toFixed(2)}%)`);
                        console.log(`   Gas: ${result.gasPrice.toFixed(1)} gwei`);
                        
                        opportunities.push(result);
                        this.stats.profitableFound++;
                    } else if (result.netProfitPercentage > -0.5) {
                        console.log(`📊 Quasi profittevole: ${result.path} (${result.netProfitPercentage.toFixed(2)}%)`);
                    }
                    
                    this.stats.opportunitiesFound++;
                    
                } catch (error) {
                    console.log(`⚠️  ${path.name}: ${error.message.substring(0, 50)}...`);
                }
            }
        }
        
        const scanTime = Date.now() - scanStartTime;
        this.stats.totalScans++;
        this.stats.avgScanTime = (this.stats.avgScanTime + scanTime) / this.stats.totalScans;
        
        console.log(`⏱️  Scan completato in ${scanTime}ms`);
        
        return opportunities;
    }
    
    async volatilityBasedScanning() {
        // Scansione adattiva basata sulla volatilità del mercato
        let interval = this.config.scanInterval;
        
        while (this.isMonitoring) {
            try {
                const opportunities = await this.scanForOpportunities();
                
                if (opportunities.length > 0) {
                    // Opportunità trovate - scansione rapida
                    interval = this.config.quickScanInterval;
                    this.config.consecutiveFails = 0;
                    
                    // Ordina per profittabilità e esegui la migliore
                    opportunities.sort((a, b) => b.netProfitPercentage - a.netProfitPercentage);
                    await this.executeOpportunity(opportunities[0]);
                    
                } else {
                    // Nessuna opportunità - rallenta scansioni
                    interval = this.config.scanInterval;
                    this.config.consecutiveFails++;
                    
                    if (this.config.consecutiveFails > this.config.maxConsecutiveFails) {
                        console.log('⚠️  Troppe scansioni fallite, switching RPC...');
                        await this.switchRPC();
                        this.config.consecutiveFails = 0;
                    }
                }
                
                await this.sleep(interval);
                
            } catch (error) {
                console.log(`❌ Errore durante scansione: ${error.message}`);
                await this.sleep(interval * 2); // Pausa più lunga in caso di errore
            }
        }
    }
    
    async executeOpportunity(opportunity) {
        console.log(`\n🚀 ESECUZIONE OPPORTUNITÀ:`);
        console.log(`   Percorso: ${opportunity.path}`);
        console.log(`   Profitto atteso: ${opportunity.netProfit.toFixed(6)} BNB`);
        console.log(`   Gas: ${opportunity.gasPrice.toFixed(1)} gwei`);
        
        // TODO: Implementare esecuzione reale del trade
        // Per ora solo log per sicurezza
        console.log(`⚠️  MODALITÀ DEMO - Trade non eseguito per sicurezza`);
        console.log(`   Per trading reale, implementare logica di esecuzione con wallet`);
    }
    
    displayStats() {
        console.log(`\n📊 STATISTICHE MONITOR:`);
        console.log(`   Scansioni totali: ${this.stats.totalScans}`);
        console.log(`   Opportunità trovate: ${this.stats.opportunitiesFound}`);
        console.log(`   Profittevoli: ${this.stats.profitableFound}`);
        console.log(`   Tempo medio scan: ${this.stats.avgScanTime.toFixed(0)}ms`);
        console.log(`   Tasso successo: ${((this.stats.profitableFound / this.stats.totalScans) * 100).toFixed(2)}%`);
    }
    
    async startMonitoring() {
        console.log(`🚀 Avvio monitoraggio ottimizzato...`);
        console.log(`   Soglia profitto: ${this.config.minProfitPercentage}%`);
        console.log(`   Intervallo scan: ${this.config.scanInterval}ms`);
        console.log(`   Gas massimo: ${this.config.maxGasPrice} gwei`);
        
        this.isMonitoring = true;
        
        // Avvia scansione adattiva
        this.volatilityBasedScanning();
        
        // Display stats ogni 30 secondi
        setInterval(() => {
            this.displayStats();
        }, 30000);
    }
    
    stopMonitoring() {
        this.isMonitoring = false;
        console.log(`🛑 Monitoraggio fermato`);
        this.displayStats();
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Test delle ottimizzazioni
async function testOptimizations() {
    console.log('🧪 Test delle ottimizzazioni...\n');
    
    const monitor = new OptimizedArbitrageMonitor();
    
    // Test singola scansione
    const opportunities = await monitor.scanForOpportunities();
    
    console.log(`\n📊 Risultati test:`);
    console.log(`   Opportunità testate: ${monitor.stats.opportunitiesFound}`);
    console.log(`   Profittevoli: ${monitor.stats.profitableFound}`);
    console.log(`   Tempo scan: ${monitor.stats.avgScanTime.toFixed(0)}ms`);
    
    if (opportunities.length > 0) {
        console.log(`\n🎯 Migliore opportunità:`);
        const best = opportunities.sort((a, b) => b.netProfitPercentage - a.netProfitPercentage)[0];
        console.log(`   ${best.path}: ${best.netProfitPercentage.toFixed(4)}% netto`);
    }
    
    console.log(`\n💡 Per avviare monitoraggio continuo:`);
    console.log(`   monitor.startMonitoring()`);
    console.log(`   monitor.stopMonitoring()`);
}

// Avvia test
testOptimizations();

// Esporta per uso come modulo
module.exports = OptimizedArbitrageMonitor; 