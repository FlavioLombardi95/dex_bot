#!/usr/bin/env node

console.log('🔥 SCANNER TOKEN NUOVI IN TEMPO REALE - LUGLIO 2025');
console.log('===================================================');

const { ethers } = require('ethers');

class RealtimeNewTokensScanner {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        
        // ABI per PancakeSwap Factory V2
        this.factoryABI = [
            'function allPairsLength() external view returns (uint)',
            'function allPairs(uint) external view returns (address pair)',
            'function getPair(address tokenA, address tokenB) external view returns (address pair)',
            'event PairCreated(address indexed token0, address indexed token1, address pair, uint)'
        ];
        
        // ABI per Pair
        this.pairABI = [
            'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
            'function token0() external view returns (address)',
            'function token1() external view returns (address)',
            'function totalSupply() external view returns (uint256)'
        ];
        
        // ABI per Token ERC20
        this.tokenABI = [
            'function name() external view returns (string)',
            'function symbol() external view returns (string)',
            'function decimals() external view returns (uint8)',
            'function totalSupply() external view returns (uint256)'
        ];
        
        // ABI per Router
        this.routerABI = [
            'function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)'
        ];
        
        // Contratti PancakeSwap
        this.factory = new ethers.Contract(
            '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', // PancakeSwap Factory V2
            this.factoryABI,
            this.provider
        );
        
        this.router = new ethers.Contract(
            '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap Router V2
            this.routerABI,
            this.provider
        );
        
        // Token stabili per arbitraggio
        this.stableTokens = {
            WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
            BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
            USDT: '0x55d398326f99059fF775485246999027B3197955',
            USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
        };
        
        this.newTokens = [];
        this.profitableOpportunities = [];
        
        // Statistiche
        this.stats = {
            pairsScanned: 0,
            newTokensFound: 0,
            profitableFound: 0,
            bestProfit: -Infinity,
            startTime: Date.now()
        };
    }
    
    async getLatestBlockNumber() {
        return await this.provider.getBlockNumber();
    }
    
    async getBlockTimestamp(blockNumber) {
        const block = await this.provider.getBlock(blockNumber);
        return block.timestamp;
    }
    
    async scanRecentPairs(hoursBack = 72) {
        console.log(`\n🔍 Scansione pair creati nelle ultime ${hoursBack} ore...`);
        
        const currentBlock = await this.getLatestBlockNumber();
        const currentTime = await this.getBlockTimestamp(currentBlock);
        const cutoffTime = currentTime - (hoursBack * 60 * 60); // 72 ore fa
        
        console.log(`📊 Block corrente: ${currentBlock}`);
        console.log(`⏰ Cutoff time: ${new Date(cutoffTime * 1000).toLocaleString()}`);
        
        // Ottieni il numero totale di pair
        const totalPairs = await this.factory.allPairsLength();
        console.log(`📈 Pair totali su PancakeSwap: ${totalPairs}`);
        
        // Scansiona gli ultimi 1000 pair (più recenti)
        const startIndex = Math.max(0, totalPairs - 1000);
        const newPairs = [];
        
        console.log(`🔍 Scansionando pair da ${startIndex} a ${totalPairs}...`);
        
        for (let i = startIndex; i < totalPairs; i++) {
            try {
                const pairAddress = await this.factory.allPairs(i);
                const pairContract = new ethers.Contract(pairAddress, this.pairABI, this.provider);
                
                // Ottieni informazioni del pair
                const [token0Address, token1Address, reserves] = await Promise.all([
                    pairContract.token0(),
                    pairContract.token1(),
                    pairContract.getReserves()
                ]);
                
                // Verifica se il pair è stato creato nelle ultime 72 ore
                // (usando blockTimestampLast come proxy)
                if (reserves.blockTimestampLast > cutoffTime) {
                    // Ottieni info sui token
                    const [token0Info, token1Info] = await Promise.all([
                        this.getTokenInfo(token0Address),
                        this.getTokenInfo(token1Address)
                    ]);
                    
                    const pairInfo = {
                        address: pairAddress,
                        token0: { address: token0Address, ...token0Info },
                        token1: { address: token1Address, ...token1Info },
                        reserves: {
                            reserve0: reserves.reserve0,
                            reserve1: reserves.reserve1,
                            timestamp: reserves.blockTimestampLast
                        },
                        createdAt: new Date(reserves.blockTimestampLast * 1000)
                    };
                    
                    newPairs.push(pairInfo);
                    
                    console.log(`🆕 Nuovo pair trovato: ${token0Info.symbol}/${token1Info.symbol}`);
                    console.log(`   📍 Address: ${pairAddress}`);
                    console.log(`   📅 Creato: ${pairInfo.createdAt.toLocaleString()}`);
                    console.log(`   💰 Liquidità: ${ethers.utils.formatEther(reserves.reserve0)} ${token0Info.symbol} / ${ethers.utils.formatEther(reserves.reserve1)} ${token1Info.symbol}`);
                }
                
                this.stats.pairsScanned++;
                
                // Progress indicator
                if (i % 100 === 0) {
                    console.log(`   📊 Progresso: ${i}/${totalPairs} (${((i/totalPairs)*100).toFixed(1)}%)`);
                }
                
            } catch (error) {
                console.log(`   ⚠️ Errore pair ${i}: ${error.message.substring(0, 50)}...`);
                continue;
            }
        }
        
        console.log(`\n✅ Scansione completata!`);
        console.log(`🆕 Trovati ${newPairs.length} pair nuovi nelle ultime ${hoursBack} ore`);
        
        return newPairs;
    }
    
    async getTokenInfo(tokenAddress) {
        try {
            const tokenContract = new ethers.Contract(tokenAddress, this.tokenABI, this.provider);
            
            const [name, symbol, decimals, totalSupply] = await Promise.all([
                tokenContract.name(),
                tokenContract.symbol(),
                tokenContract.decimals(),
                tokenContract.totalSupply()
            ]);
            
            return {
                name,
                symbol,
                decimals,
                totalSupply: totalSupply.toString()
            };
        } catch (error) {
            return {
                name: 'Unknown',
                symbol: 'UNK',
                decimals: 18,
                totalSupply: '0'
            };
        }
    }
    
    async findTriangularOpportunities(newPairs) {
        console.log(`\n🔺 Ricerca opportunità arbitraggio triangolare...`);
        
        const opportunities = [];
        
        for (const pair of newPairs) {
            try {
                // Prova triangoli con token stabili
                for (const [stableSymbol, stableAddress] of Object.entries(this.stableTokens)) {
                    // Triangolo: Token0 → Stable → Token1 → Token0
                    const triangle1 = await this.testTriangle(
                        pair.token0.address,
                        stableAddress,
                        pair.token1.address,
                        `${pair.token0.symbol}-${stableSymbol}-${pair.token1.symbol}`
                    );
                    
                    if (triangle1 && triangle1.profitable) {
                        opportunities.push(triangle1);
                        console.log(`🎯 OPPORTUNITÀ TROVATA: ${triangle1.path}`);
                        console.log(`   💰 Profitto: ${triangle1.netProfitPercentage.toFixed(4)}%`);
                    }
                    
                    // Triangolo: Token1 → Stable → Token0 → Token1
                    const triangle2 = await this.testTriangle(
                        pair.token1.address,
                        stableAddress,
                        pair.token0.address,
                        `${pair.token1.symbol}-${stableSymbol}-${pair.token0.symbol}`
                    );
                    
                    if (triangle2 && triangle2.profitable) {
                        opportunities.push(triangle2);
                        console.log(`🎯 OPPORTUNITÀ TROVATA: ${triangle2.path}`);
                        console.log(`   💰 Profitto: ${triangle2.netProfitPercentage.toFixed(4)}%`);
                    }
                }
                
            } catch (error) {
                console.log(`   ⚠️ Errore test triangolo per ${pair.token0.symbol}/${pair.token1.symbol}: ${error.message.substring(0, 50)}...`);
            }
        }
        
        return opportunities;
    }
    
    async testTriangle(tokenA, tokenB, tokenC, pathName) {
        try {
            const testAmount = ethers.utils.parseEther('0.01'); // Test con 0.01 token
            
            // Step 1: A → B
            const amounts1 = await this.router.getAmountsOut(testAmount, [tokenA, tokenB]);
            
            // Step 2: B → C
            const amounts2 = await this.router.getAmountsOut(amounts1[1], [tokenB, tokenC]);
            
            // Step 3: C → A
            const amounts3 = await this.router.getAmountsOut(amounts2[1], [tokenC, tokenA]);
            
            // Calcola profitto
            const inputAmount = 0.01;
            const outputAmount = parseFloat(ethers.utils.formatEther(amounts3[1]));
            const grossProfit = outputAmount - inputAmount;
            const grossProfitPercentage = (grossProfit / inputAmount) * 100;
            
            // Stima costi gas
            const gasPrice = await this.provider.getGasPrice();
            const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
            const gasEstimate = 400000; // Gas stimato per triangolo con token nuovo
            const gasCostBNB = (gasEstimate * gasPriceGwei) / 1e9;
            
            // Converti gas cost in token A
            let gasCostInTokenA = gasCostBNB;
            if (tokenA !== this.stableTokens.WBNB) {
                try {
                    const priceQuery = await this.router.getAmountsOut(
                        ethers.utils.parseEther('1'),
                        [this.stableTokens.WBNB, tokenA]
                    );
                    const tokenPrice = parseFloat(ethers.utils.formatEther(priceQuery[1]));
                    gasCostInTokenA = gasCostBNB / tokenPrice;
                } catch {
                    gasCostInTokenA = gasCostBNB * 300; // Stima conservativa
                }
            }
            
            const netProfit = grossProfit - gasCostInTokenA;
            const netProfitPercentage = (netProfit / inputAmount) * 100;
            
            return {
                path: pathName,
                tokenA,
                tokenB,
                tokenC,
                inputAmount,
                outputAmount,
                grossProfit,
                grossProfitPercentage,
                gasCostInTokenA,
                netProfit,
                netProfitPercentage,
                profitable: netProfit > 0,
                gasPrice: gasPriceGwei,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            // Probabilmente liquidità insufficiente
            return null;
        }
    }
    
    async continuousScanning() {
        console.log('\n🔄 MONITORAGGIO CONTINUO TOKEN NUOVI');
        console.log('====================================');
        console.log('Scansione ogni 30 minuti...');
        console.log('Premi CTRL+C per terminare\n');
        
        let scanCount = 0;
        
        const scan = async () => {
            scanCount++;
            console.log(`\n📊 Scansione #${scanCount} - ${new Date().toLocaleString()}`);
            
            try {
                // Scansiona pair nuovi
                const newPairs = await this.scanRecentPairs(72);
                
                if (newPairs.length > 0) {
                    // Cerca opportunità
                    const opportunities = await this.findTriangularOpportunities(newPairs);
                    
                    if (opportunities.length > 0) {
                        console.log(`\n🎉 TROVATE ${opportunities.length} OPPORTUNITÀ CON TOKEN NUOVI!`);
                        
                        // Ordina per profittabilità
                        opportunities.sort((a, b) => b.netProfitPercentage - a.netProfitPercentage);
                        
                        console.log('\n🏆 TOP OPPORTUNITÀ:');
                        opportunities.slice(0, 5).forEach((opp, i) => {
                            console.log(`   ${i+1}. ${opp.path}: ${opp.netProfitPercentage.toFixed(4)}%`);
                        });
                        
                        this.profitableOpportunities.push(...opportunities);
                        this.stats.profitableFound += opportunities.length;
                        
                        // Salva le migliori opportunità
                        await this.saveOpportunities(opportunities);
                        
                    } else {
                        console.log('📉 Nessuna opportunità profittevole con token nuovi');
                    }
                } else {
                    console.log('📊 Nessun token nuovo trovato nell\'ultima scansione');
                }
                
            } catch (error) {
                console.log(`❌ Errore durante scansione: ${error.message}`);
            }
            
            // Mostra statistiche
            this.displayStats();
        };
        
        // Prima scansione
        await scan();
        
        // Scansioni successive ogni 30 minuti
        const interval = setInterval(scan, 30 * 60 * 1000);
        
        // Gestione terminazione
        process.on('SIGINT', () => {
            console.log('\n🛑 Terminazione monitoraggio...');
            clearInterval(interval);
            this.displayFinalStats();
            process.exit(0);
        });
    }
    
    async saveOpportunities(opportunities) {
        try {
            const fs = require('fs');
            const data = {
                timestamp: new Date().toISOString(),
                opportunities: opportunities.map(opp => ({
                    path: opp.path,
                    netProfitPercentage: opp.netProfitPercentage,
                    inputAmount: opp.inputAmount,
                    gasPrice: opp.gasPrice
                }))
            };
            
            fs.writeFileSync(
                `new-tokens-opportunities-${Date.now()}.json`,
                JSON.stringify(data, null, 2)
            );
            
            console.log(`💾 Opportunità salvate in new-tokens-opportunities-${Date.now()}.json`);
        } catch (error) {
            console.log(`⚠️ Errore salvataggio: ${error.message}`);
        }
    }
    
    displayStats() {
        const runtime = (Date.now() - this.stats.startTime) / 1000 / 60; // minuti
        
        console.log('\n📊 STATISTICHE CORRENTI:');
        console.log('========================');
        console.log(`⏱️  Runtime: ${runtime.toFixed(1)} minuti`);
        console.log(`🔍 Pair scansionati: ${this.stats.pairsScanned}`);
        console.log(`🆕 Token nuovi trovati: ${this.stats.newTokensFound}`);
        console.log(`✅ Opportunità profittevoli: ${this.stats.profitableFound}`);
        
        if (this.profitableOpportunities.length > 0) {
            const best = this.profitableOpportunities.reduce((prev, curr) => 
                curr.netProfitPercentage > prev.netProfitPercentage ? curr : prev
            );
            console.log(`🏆 Migliore opportunità: ${best.path} (${best.netProfitPercentage.toFixed(4)}%)`);
        }
    }
    
    displayFinalStats() {
        console.log('\n📊 STATISTICHE FINALI:');
        console.log('======================');
        this.displayStats();
        
        if (this.profitableOpportunities.length > 0) {
            console.log('\n🚀 OPPORTUNITÀ TROVATE CON TOKEN NUOVI!');
            console.log('Controlla i file JSON salvati per i dettagli.');
        }
    }
}

// Esecuzione
async function main() {
    const scanner = new RealtimeNewTokensScanner();
    
    console.log('🎯 Modalità scanner:');
    console.log('  1. Scansione singola');
    console.log('  2. Monitoraggio continuo');
    
    const args = process.argv.slice(2);
    const mode = args[0] || '1';
    
    if (mode === '2' || mode === 'continuous') {
        await scanner.continuousScanning();
    } else {
        console.log('\n🚀 Avvio scansione singola...');
        const newPairs = await scanner.scanRecentPairs(72);
        
        if (newPairs.length > 0) {
            const opportunities = await scanner.findTriangularOpportunities(newPairs);
            
            if (opportunities.length > 0) {
                console.log('\n🎉 OPPORTUNITÀ TROVATE!');
                await scanner.saveOpportunities(opportunities);
                console.log('\n🔄 Per monitoraggio continuo: node realtime-new-tokens-scanner.js continuous');
            } else {
                console.log('\n📉 Nessuna opportunità profittevole al momento');
            }
        } else {
            console.log('\n📊 Nessun token nuovo nelle ultime 72 ore');
        }
        
        scanner.displayFinalStats();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = RealtimeNewTokensScanner; 