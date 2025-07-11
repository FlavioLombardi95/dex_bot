console.log('🪙 TEST ARBITRAGGIO TRIANGOLARE - BSC TESTNET');
console.log('============================================');

const { ethers } = require('ethers');

setTimeout(() => process.exit(0), 30000);

async function testSmallTokensTestnet() {
    try {
        // Connessione a BSC Testnet
        const provider = new ethers.providers.JsonRpcProvider('https://bsc-testnet.publicnode.com');
        
        // Verifica rete
        const network = await provider.getNetwork();
        console.log(`🌐 Rete: BSC Testnet (Chain ID: ${network.chainId})`);
        
        if (network.chainId !== 97) {
            throw new Error('❌ Errore: Deve essere eseguito su BSC Testnet (Chain ID 97)');
        }
        
        const routerABI = [
            'function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)',
            'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'
        ];
        
        // PancakeSwap Router su BSC Testnet
        const router = new ethers.Contract('0xD99D1c33F9fC3444f8101754aBC46c52416550D1', routerABI, provider);
        
        // Token disponibili su BSC Testnet (quelli con più liquidità)
        const tokens = {
            WBNB: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
            BUSD: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
            USDT: '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684',
            USDC: '0x64544969ed7EBf5f083679233325356EbE738930',
            // Token testnet aggiuntivi (se disponibili)
            DAI: '0x8a9424745056Eb399FD19a0EC26A14316684e274',  // DAI testnet
            BETH: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8'   // Binance ETH testnet
        };
        
        // Percorsi triangolari per testnet (più conservativi)
        const paths = [
            { name: 'BNB-BUSD-USDT-BNB', tokens: ['WBNB', 'BUSD', 'USDT', 'WBNB'] },
            { name: 'BNB-USDT-BUSD-BNB', tokens: ['WBNB', 'USDT', 'BUSD', 'WBNB'] },
            { name: 'BNB-USDC-BUSD-BNB', tokens: ['WBNB', 'USDC', 'BUSD', 'WBNB'] },
            { name: 'BUSD-USDT-USDC-BUSD', tokens: ['BUSD', 'USDT', 'USDC', 'BUSD'] },
            { name: 'BNB-BUSD-USDC-BNB', tokens: ['WBNB', 'BUSD', 'USDC', 'WBNB'] },
            { name: 'USDT-BUSD-USDC-USDT', tokens: ['USDT', 'BUSD', 'USDC', 'USDT'] }
        ];
        
        // Importi variabili per test
        const testAmounts = [
            { amount: '0.001', label: '0.001 (micro)' },
            { amount: '0.01', label: '0.01 (piccolo)' },
            { amount: '0.1', label: '0.1 (medio)' }
        ];
        
        console.log('💰 Testando con importi variabili\n');
        
        for (const testAmount of testAmounts) {
            console.log(`💵 IMPORTO: ${testAmount.label}`);
            console.log('═'.repeat(50));
            
            const inputAmount = ethers.utils.parseEther(testAmount.amount);
            let bestOpportunity = null;
            let bestProfit = -Infinity;
            
            for (const path of paths) {
                console.log(`🔺 ${path.name}:`);
                
                try {
                    // Step 1: Token A -> Token B
                    const amounts1 = await router.getAmountsOut(inputAmount, 
                        [tokens[path.tokens[0]], tokens[path.tokens[1]]]);
                    
                    // Step 2: Token B -> Token C
                    const amounts2 = await router.getAmountsOut(amounts1[1],
                        [tokens[path.tokens[1]], tokens[path.tokens[2]]]);
                    
                    // Step 3: Token C -> Token A
                    const amounts3 = await router.getAmountsOut(amounts2[1],
                        [tokens[path.tokens[2]], tokens[path.tokens[3]]]);
                    
                    const input = Number(testAmount.amount);
                    const finalAmount = Number(ethers.utils.formatEther(amounts3[1]));
                    const profit = finalAmount - input;
                    const profitPercentage = (profit / input) * 100;
                    
                    console.log(`   📥 Input:   ${input} ${path.tokens[0]}`);
                    console.log(`   🔄 Step 1:  ${Number(ethers.utils.formatEther(amounts1[1])).toFixed(8)} ${path.tokens[1]}`);
                    console.log(`   🔄 Step 2:  ${Number(ethers.utils.formatEther(amounts2[1])).toFixed(8)} ${path.tokens[2]}`);
                    console.log(`   📤 Step 3:  ${finalAmount.toFixed(8)} ${path.tokens[3]}`);
                    console.log(`   💰 Profitto: ${profit.toFixed(8)} (${profitPercentage.toFixed(4)}%)`);
                    
                    // Tracking migliore opportunità
                    if (profitPercentage > bestProfit) {
                        bestProfit = profitPercentage;
                        bestOpportunity = {
                            path: path.name,
                            profit: profit,
                            percentage: profitPercentage,
                            input: input,
                            output: finalAmount
                        };
                    }
                    
                    if (profit > 0) {
                        console.log('   🎯 ✨ OPPORTUNITÀ PROFITTEVOLE! ✨');
                    } else if (profitPercentage > -0.5) {
                        console.log('   📊 Quasi profittevole!');
                    } else if (profitPercentage > -2.0) {
                        console.log('   📈 Potenziale interessante');
                    } else {
                        console.log('   📉 Non profittevole');
                    }
                    
                    console.log('');
                    
                } catch (error) {
                    if (error.message.includes('INSUFFICIENT_LIQUIDITY')) {
                        console.log(`   ❌ Liquidità insufficiente per ${path.name}`);
                        console.log('   💡 Pool troppo piccolo su testnet');
                    } else if (error.message.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
                        console.log(`   ⚠️  Output insufficiente per ${path.name}`);
                    } else {
                        console.log(`   ❌ Errore: ${error.message.substring(0, 40)}...`);
                    }
                    console.log('');
                }
            }
            
            // Riepilogo migliore opportunità per questo importo
            if (bestOpportunity) {
                console.log('🏆 MIGLIORE OPPORTUNITÀ PER QUESTO IMPORTO:');
                console.log(`   🎯 Percorso: ${bestOpportunity.path}`);
                console.log(`   💰 Profitto: ${bestOpportunity.profit.toFixed(8)} (${bestOpportunity.percentage.toFixed(4)}%)`);
                if (bestOpportunity.percentage > 0) {
                    console.log('   ✨ PROFITTEVOLE! ✨');
                }
            }
            console.log('\n' + '═'.repeat(50) + '\n');
        }
        
        console.log('🔍 ANALISI TESTNET BSC:');
        console.log('=======================');
        console.log('✅ Testnet ha liquidità limitata');
        console.log('✅ Spread maggiori possibili');
        console.log('✅ Meno competizione dai bot');
        console.log('⚠️  Pool piccoli = alta volatilità');
        console.log('💡 Usare importi molto piccoli per test');
        console.log('🎯 Migliorare opportunità con token minori');
        
    } catch (error) {
        console.log('❌ Errore generale:', error.message);
    }
}

testSmallTokensTestnet(); 