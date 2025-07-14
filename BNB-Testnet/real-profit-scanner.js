#!/usr/bin/env node

console.log('🎯 SCANNER PROFITTABILITÀ REALE - SOLO DATI REALI');
console.log('=================================================');

const { ethers } = require('ethers');

class RealProfitScanner {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        this.routerABI = [
            'function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)',
            'function factory() external pure returns (address)',
            'function WETH() external pure returns (address)'
        ];
        this.router = new ethers.Contract(
            '0x10ED43C718714eb63d5aA57B78B54704E256024E',
            this.routerABI,
            this.provider
        );
        
        // Token con buoni spread basati sui test
        this.tokens = {
            WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
            BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
            USDT: '0x55d398326f99059fF775485246999027B3197955',
            CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
            ADA: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
            DOT: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
            LINK: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
            UNI: '0xBf5140A22578168FD562DCcF235E5D43A02ce9B1',
            XRP: '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE',
            ALPACA: '0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F',
            XVS: '0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63'
        };
        
        // Percorsi promettenti basati sui test precedenti
        this.promisingPaths = [
            { name: 'BNB-CAKE-BUSD-BNB', tokens: ['WBNB', 'CAKE', 'BUSD', 'WBNB'], lastLoss: 0.99 },
            { name: 'CAKE-BUSD-USDT-CAKE', tokens: ['CAKE', 'BUSD', 'USDT', 'CAKE'], lastLoss: 0.68 },
            { name: 'BNB-ADA-USDT-BNB', tokens: ['WBNB', 'ADA', 'USDT', 'WBNB'], lastLoss: 2.55 },
            { name: 'BNB-LINK-USDT-BNB', tokens: ['WBNB', 'LINK', 'USDT', 'WBNB'], lastLoss: 4.09 },
            { name: 'ADA-BUSD-DOT-ADA', tokens: ['ADA', 'BUSD', 'DOT', 'ADA'], lastLoss: 1.49 },
            { name: 'LINK-USDT-CAKE-LINK', tokens: ['LINK', 'USDT', 'CAKE', 'LINK'], lastLoss: 3.82 },
            { name: 'BNB-ALPACA-BUSD-BNB', tokens: ['WBNB', 'ALPACA', 'BUSD', 'WBNB'], lastLoss: 0.0 },
            { name: 'BNB-XVS-USDT-BNB', tokens: ['WBNB', 'XVS', 'USDT', 'WBNB'], lastLoss: 0.0 }
        ];
        
        this.stats = {
            totalTests: 0,
            profitableFound: 0,
            bestProfit: -Infinity,
            bestConfig: null
        };
    }
    
    async getCurrentGasPrice() {
        try {
            const gasPrice = await this.provider.getGasPrice();
            return parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
        } catch (error) {
            return 5.0; // Fallback BNB testnet typical
        }
    }
    
    async calculateArbitrageProfit(path, amountIn, decimals = 18) {
        try {
            const amount = ethers.utils.parseUnits(amountIn.toString(), decimals);
            
            // Esegui i 3 passi dell'arbitraggio triangolare
            const amounts1 = await this.router.getAmountsOut(amount, [
                this.tokens[path.tokens[0]], 
                this.tokens[path.tokens[1]]
            ]);
            
            const amounts2 = await this.router.getAmountsOut(amounts1[1], [
                this.tokens[path.tokens[1]], 
                this.tokens[path.tokens[2]]
            ]);
            
            const amounts3 = await this.router.getAmountsOut(amounts2[1], [
                this.tokens[path.tokens[2]], 
                this.tokens[path.tokens[3]]
            ]);
            
            // Calcola profitto
            const finalAmount = parseFloat(ethers.utils.formatUnits(amounts3[1], decimals));
            const inputAmount = parseFloat(amountIn);
            const grossProfit = finalAmount - inputAmount;
            const grossProfitPercentage = (grossProfit / inputAmount) * 100;
            
            // Calcola costi gas stimati
            const gasPrice = await this.getCurrentGasPrice();
            const gasEstimate = 300000; // Gas per arbitraggio triangolare
            const gasCostBNB = (gasEstimate * gasPrice) / 1e9;
            
            // Converti gas cost nel token di partenza se necessario
            let gasCostInToken = gasCostBNB;
            if (path.tokens[0] !== 'WBNB') {
                // Ottieni prezzo del token vs BNB
                const priceQuery = await this.router.getAmountsOut(
                    ethers.utils.parseEther('1'),
                    [this.tokens['WBNB'], this.tokens[path.tokens[0]]]
                );
                const tokenPriceInBNB = parseFloat(ethers.utils.formatEther(priceQuery[1]));
                gasCostInToken = gasCostBNB / tokenPriceInBNB;
            }
            
            const netProfit = grossProfit - gasCostInToken;
            const netProfitPercentage = (netProfit / inputAmount) * 100;
            
            return {
                path: path.name,
                inputAmount,
                finalAmount,
                grossProfit,
                grossProfitPercentage,
                gasPrice,
                gasCostInToken,
                netProfit,
                netProfitPercentage,
                profitable: netProfit > 0,
                timestamp: new Date().toISOString(),
                amounts: {
                    step1: parseFloat(ethers.utils.formatUnits(amounts1[1], decimals)),
                    step2: parseFloat(ethers.utils.formatUnits(amounts2[1], decimals)),
                    step3: finalAmount
                }
            };
        } catch (error) {
            throw new Error(`Calcolo fallito per ${path.name}: ${error.message}`);
        }
    }
    
    async findOptimalAmount(path, startAmount = 0.001, maxAmount = 1.0, steps = 20) {
        console.log(`🔍 Ricerca importo ottimale per ${path.name}...`);
        
        const stepSize = (maxAmount - startAmount) / steps;
        let bestResult = null;
        let bestAmount = startAmount;
        
        for (let i = 0; i <= steps; i++) {
            const amount = startAmount + (stepSize * i);
            
            try {
                const result = await this.calculateArbitrageProfit(path, amount);
                this.stats.totalTests++;
                
                if (result.profitable) {
                    console.log(`   ✅ ${amount.toFixed(4)} ${path.tokens[0]}: +${result.netProfitPercentage.toFixed(4)}%`);
                    this.stats.profitableFound++;
                    
                    if (!bestResult || result.netProfit > bestResult.netProfit) {
                        bestResult = result;
                        bestAmount = amount;
                    }
                } else if (result.netProfitPercentage > -1.0) {
                    console.log(`   📊 ${amount.toFixed(4)} ${path.tokens[0]}: ${result.netProfitPercentage.toFixed(4)}%`);
                } else {
                    console.log(`   📉 ${amount.toFixed(4)} ${path.tokens[0]}: ${result.netProfitPercentage.toFixed(4)}%`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
                
            } catch (error) {
                console.log(`   ❌ ${amount.toFixed(4)} ${path.tokens[0]}: ${error.message.substring(0, 40)}...`);
            }
        }
        
        return bestResult ? { amount: bestAmount, result: bestResult } : null;
    }
    
    async scanForProfitableOpportunities() {
        console.log('\n🚀 SCANSIONE COMPLETA PER OPPORTUNITÀ PROFITTEVOLI');
        console.log('=' .repeat(55));
        
        const results = [];
        
        // Ordina i percorsi per promettenti (perdite minori)
        this.promisingPaths.sort((a, b) => a.lastLoss - b.lastLoss);
        
        for (const path of this.promisingPaths) {
            console.log(`\n🔺 ${path.name}:`);
            console.log('─'.repeat(50));
            
            try {
                const optimal = await this.findOptimalAmount(path);
                
                if (optimal) {
                    console.log(`🎯 OPPORTUNITÀ PROFITTEVOLE TROVATA!`);
                    console.log(`   💰 Importo ottimale: ${optimal.amount} ${path.tokens[0]}`);
                    console.log(`   📈 Profitto netto: ${optimal.result.netProfit.toFixed(6)} ${path.tokens[0]}`);
                    console.log(`   📊 Percentuale: ${optimal.result.netProfitPercentage.toFixed(4)}%`);
                    console.log(`   ⛽ Gas: ${optimal.result.gasPrice.toFixed(1)} gwei`);
                    
                    results.push(optimal);
                    
                    if (optimal.result.netProfit > this.stats.bestProfit) {
                        this.stats.bestProfit = optimal.result.netProfit;
                        this.stats.bestConfig = optimal;
                    }
                } else {
                    console.log(`❌ Nessuna opportunità profittevole trovata`);
                }
                
            } catch (error) {
                console.log(`❌ Errore nell'analisi: ${error.message}`);
            }
        }
        
        return results;
    }
    
    async continuousMonitor(intervalMs = 10000) {
        console.log(`\n🔄 MONITORAGGIO CONTINUO (ogni ${intervalMs/1000}s)`);
        console.log('=' .repeat(45));
        console.log('Premi CTRL+C per terminare...\n');
        
        let scanCount = 0;
        
        const monitor = setInterval(async () => {
            scanCount++;
            console.log(`\n📊 Scansione #${scanCount} - ${new Date().toLocaleTimeString()}`);
            
            try {
                const opportunities = await this.scanForProfitableOpportunities();
                
                if (opportunities.length > 0) {
                    console.log(`\n🎉 TROVATE ${opportunities.length} OPPORTUNITÀ PROFITTEVOLI!`);
                    
                    // Ordina per profittabilità
                    opportunities.sort((a, b) => b.result.netProfitPercentage - a.result.netProfitPercentage);
                    
                    console.log('\n🏆 TOP 3 OPPORTUNITÀ:');
                    opportunities.slice(0, 3).forEach((opp, i) => {
                        console.log(`   ${i+1}. ${opp.result.path}: ${opp.result.netProfitPercentage.toFixed(4)}%`);
                    });
                    
                    // Qui potresti aggiungere l'esecuzione automatica
                    // await this.executeArbitrage(opportunities[0]);
                    
                } else {
                    console.log('📉 Nessuna opportunità profittevole al momento');
                }
                
            } catch (error) {
                console.log(`❌ Errore durante monitoraggio: ${error.message}`);
            }
            
        }, intervalMs);
        
        // Gestione terminazione
        process.on('SIGINT', () => {
            console.log('\n🛑 Terminazione monitoraggio...');
            clearInterval(monitor);
            this.displayFinalStats();
            process.exit(0);
        });
    }
    
    displayFinalStats() {
        console.log('\n📊 STATISTICHE FINALI:');
        console.log('=' .repeat(25));
        console.log(`🔍 Test totali: ${this.stats.totalTests}`);
        console.log(`✅ Opportunità profittevoli: ${this.stats.profitableFound}`);
        console.log(`📈 Tasso successo: ${((this.stats.profitableFound / this.stats.totalTests) * 100).toFixed(2)}%`);
        
        if (this.stats.bestConfig) {
            console.log(`\n🏆 MIGLIORE OPPORTUNITÀ TROVATA:`);
            console.log(`   Percorso: ${this.stats.bestConfig.result.path}`);
            console.log(`   Importo: ${this.stats.bestConfig.amount} ${this.stats.bestConfig.result.path.split('-')[0]}`);
            console.log(`   Profitto: ${this.stats.bestConfig.result.netProfit.toFixed(6)}`);
            console.log(`   Percentuale: ${this.stats.bestConfig.result.netProfitPercentage.toFixed(4)}%`);
        }
    }
}

// Esecuzione
async function main() {
    const scanner = new RealProfitScanner();
    
    console.log('🎯 Modalità scansione:');
    console.log('  1. Scansione singola');
    console.log('  2. Monitoraggio continuo');
    
    const args = process.argv.slice(2);
    const mode = args[0] || '1';
    
    if (mode === '2' || mode === 'monitor') {
        await scanner.continuousMonitor();
    } else {
        const opportunities = await scanner.scanForProfitableOpportunities();
        scanner.displayFinalStats();
        
        if (opportunities.length > 0) {
            console.log('\n🚀 PRONTO PER IMPLEMENTAZIONE!');
            console.log('Usa: node real-profit-scanner.js monitor');
        } else {
            console.log('\n⏳ Nessuna opportunità ora. Riprova più tardi o usa il monitoraggio continuo.');
        }
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = RealProfitScanner; 