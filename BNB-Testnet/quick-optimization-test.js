console.log('⚡ TEST RAPIDO OTTIMIZZAZIONI');
console.log('=============================');

const { ethers } = require('ethers');

class QuickOptimizationDemo {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        this.router = new ethers.Contract(
            '0x10ED43C718714eb63d5aA57B78B54704E256024E',
            ['function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)'],
            this.provider
        );
        
        // Token ottimizzati dai nostri test
        this.tokens = {
            WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
            BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
            USDT: '0x55d398326f99059fF775485246999027B3197955',
            CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
            ALPACA: '0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F'
        };
        
        // Solo i percorsi TOP dai test
        this.bestPaths = [
            { name: 'BNB-CAKE-BUSD-BNB', tokens: ['WBNB', 'CAKE', 'BUSD', 'WBNB'], avgLoss: 0.87 },
            { name: 'BNB-ALPACA-BUSD-BNB', tokens: ['WBNB', 'ALPACA', 'BUSD', 'WBNB'], avgLoss: 0.63 }
        ];
        
        this.stats = {
            scans: 0,
            totalTime: 0,
            bestResult: null,
            opportunities: []
        };
    }
    
    async fastScan() {
        const startTime = Date.now();
        const results = [];
        
        // Test importi ottimizzati
        const amounts = [
            ethers.utils.parseEther('0.001'),
            ethers.utils.parseEther('0.005')
        ];
        
        for (const path of this.bestPaths) {
            for (const amountIn of amounts) {
                try {
                    // Parallel execution per velocità
                    const [amounts1, gasPrice] = await Promise.all([
                        this.router.getAmountsOut(amountIn, [this.tokens[path.tokens[0]], this.tokens[path.tokens[1]]]),
                        this.provider.getGasPrice()
                    ]);
                    
                    const [amounts2] = await Promise.all([
                        this.router.getAmountsOut(amounts1[1], [this.tokens[path.tokens[1]], this.tokens[path.tokens[2]]])
                    ]);
                    
                    const [amounts3] = await Promise.all([
                        this.router.getAmountsOut(amounts2[1], [this.tokens[path.tokens[2]], this.tokens[path.tokens[3]]])
                    ]);
                    
                    const inputBNB = parseFloat(ethers.utils.formatEther(amountIn));
                    const outputBNB = parseFloat(ethers.utils.formatEther(amounts3[1]));
                    const grossProfit = outputBNB - inputBNB;
                    const grossProfitPct = (grossProfit / inputBNB) * 100;
                    
                    // Calcolo gas dinamico
                    const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
                    const estimatedGasCost = (250000 * gasPriceGwei) / 1e9; // BNB
                    const netProfit = grossProfit - estimatedGasCost;
                    const netProfitPct = (netProfit / inputBNB) * 100;
                    
                    const result = {
                        path: path.name,
                        inputBNB,
                        outputBNB,
                        grossProfit,
                        grossProfitPct,
                        gasPriceGwei,
                        estimatedGasCost,
                        netProfit,
                        netProfitPct,
                        timestamp: new Date().toLocaleTimeString()
                    };
                    
                    results.push(result);
                    
                    // Track migliore risultato
                    if (!this.stats.bestResult || netProfitPct > this.stats.bestResult.netProfitPct) {
                        this.stats.bestResult = result;
                    }
                    
                } catch (error) {
                    // Silent fail per velocità
                }
            }
        }
        
        const scanTime = Date.now() - startTime;
        this.stats.scans++;
        this.stats.totalTime += scanTime;
        
        return { results, scanTime };
    }
    
    displayResults(scanData) {
        console.log(`\n⚡ Scan #${this.stats.scans} - ${scanData.scanTime}ms`);
        
        const profitable = scanData.results.filter(r => r.netProfitPct > 0.1);
        const almostProfitable = scanData.results.filter(r => r.netProfitPct > -0.5 && r.netProfitPct <= 0.1);
        
        if (profitable.length > 0) {
            console.log(`🎯 ${profitable.length} OPPORTUNITÀ PROFITTEVOLI!`);
            profitable.forEach(r => {
                console.log(`   ${r.path}: ${r.netProfitPct.toFixed(4)}% netto (${r.inputBNB} BNB)`);
            });
        } else if (almostProfitable.length > 0) {
            console.log(`📊 ${almostProfitable.length} quasi profittevoli:`);
            almostProfitable.forEach(r => {
                console.log(`   ${r.path}: ${r.netProfitPct.toFixed(4)}% (gas: ${r.gasPriceGwei.toFixed(1)} gwei)`);
            });
        } else {
            console.log(`🔍 Migliore: ${scanData.results[0]?.path} ${scanData.results[0]?.netProfitPct.toFixed(2)}%`);
        }
    }
    
    displayStats() {
        const avgScanTime = this.stats.totalTime / this.stats.scans;
        console.log(`\n📊 STATISTICHE OTTIMIZZAZIONE:`);
        console.log(`   Scansioni: ${this.stats.scans}`);
        console.log(`   Tempo medio: ${avgScanTime.toFixed(0)}ms`);
        console.log(`   Velocità: ${(1000/avgScanTime).toFixed(1)} scan/sec`);
        
        if (this.stats.bestResult) {
            console.log(`\n🏆 MIGLIOR RISULTATO TROVATO:`);
            console.log(`   Percorso: ${this.stats.bestResult.path}`);
            console.log(`   Profitto netto: ${this.stats.bestResult.netProfitPct.toFixed(4)}%`);
            console.log(`   Timestamp: ${this.stats.bestResult.timestamp}`);
            console.log(`   Gas: ${this.stats.bestResult.gasPriceGwei.toFixed(1)} gwei`);
        }
    }
}

async function runOptimizationDemo() {
    console.log('🚀 Avvio demo ottimizzazioni...\n');
    
    const demo = new QuickOptimizationDemo();
    const maxScans = 10;
    
    console.log(`🎯 Target: ${maxScans} scansioni ultra-rapide`);
    console.log(`📊 Monitoraggio: CAKE e ALPACA (migliori dai test)`);
    console.log(`⚡ Ottimizzazioni: Parallel execution + gas dinamico\n`);
    
    for (let i = 0; i < maxScans; i++) {
        try {
            const scanData = await demo.fastScan();
            demo.displayResults(scanData);
            
            // Pausa adattiva
            const pauseTime = scanData.results.some(r => r.netProfitPct > -0.5) ? 1000 : 2000;
            await new Promise(resolve => setTimeout(resolve, pauseTime));
            
        } catch (error) {
            console.log(`❌ Errore scan ${i + 1}: ${error.message}`);
        }
    }
    
    demo.displayStats();
    
    console.log(`\n💡 INSIGHTS:`);
    console.log(`✅ Scansioni ottimizzate completate`);
    console.log(`✅ Gas tracking dinamico implementato`); 
    console.log(`✅ Focus sui token più promettenti`);
    console.log(`🎯 Pronto per monitoraggio continuo!`);
}

runOptimizationDemo(); 