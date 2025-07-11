console.log('🪙 TEST ARBITRAGGIO TOKEN PICCOLI - BSC MAINNET');
console.log('===============================================');

const { ethers } = require('ethers');

setTimeout(() => process.exit(0), 60000); // Timeout più lungo per mainnet

async function testSmallTokensMainnet() {
    try {
        // Connessione a BSC Mainnet
        const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        
        // Verifica rete
        const network = await provider.getNetwork();
        console.log(`🌐 Rete: BSC Mainnet (Chain ID: ${network.chainId})`);
        
        if (network.chainId !== 56) {
            throw new Error('❌ Errore: Deve essere eseguito su BSC Mainnet (Chain ID 56)');
        }
        
        const routerABI = [
            'function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)',
            'function factory() external pure returns (address)',
            'function WETH() external pure returns (address)'
        ];
        
        // PancakeSwap Router su BSC Mainnet
        const router = new ethers.Contract('0x10ED43C718714eb63d5aA57B78B54704E256024E', routerABI, provider);
        
        // Token PICCOLI/MICRO-CAP su BSC (questi cambiano frequentemente)
        const tokens = {
            // Base tokens (sempre disponibili)
            WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
            BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
            USDT: '0x55d398326f99059fF775485246999027B3197955',
            USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
            
            // Token DeFi più piccoli (ma con liquidità)
            CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',  // PancakeSwap
            ALPACA: '0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F', // Alpaca Finance
            XVS: '0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63',   // Venus
            VAI: '0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7',   // VAI Stablecoin
            
            // Gaming/NFT tokens (più piccoli)
            MBOX: '0x3203c9E46cA618C8C1cE5dC67e7e9D75f5da2377', // Mobox
            TLM: '0x2222227E22102Fe3322098e4CBfE18cFebD57c95',  // Alien Worlds
            
            // DeFi emergenti/piccoli
            BIFI: '0xCa3F508B8e4Dd382eE878A314789373D80A5190A', // Beefy Finance
            AUTO: '0xa184088a740c695E156F91f5cC086a06bb78b827', // AutoFarm
            
            // Meme tokens (ATTENZIONE: molto volatili)
            SAFEMOON: '0x8076C74C5e3F5852037F31Ff0093Eeb8c8ADd8D3', // SafeMoon V2
            BABYDOGE: '0xc748673057861a797275CD8A068AbB95A902e8de'  // Baby Doge Coin
        };
        
        // Percorsi triangolari con token piccoli (più rischiosi ma potenzialmente profittevoli)
        const paths = [
            // Percorsi con CAKE (token PancakeSwap - buona liquidità)
            { name: 'BNB-CAKE-BUSD-BNB', tokens: ['WBNB', 'CAKE', 'BUSD', 'WBNB'], risk: 'Basso' },
            { name: 'BNB-CAKE-USDT-BNB', tokens: ['WBNB', 'CAKE', 'USDT', 'WBNB'], risk: 'Basso' },
            
            // Percorsi con token DeFi
            { name: 'BNB-ALPACA-BUSD-BNB', tokens: ['WBNB', 'ALPACA', 'BUSD', 'WBNB'], risk: 'Medio' },
            { name: 'BNB-XVS-USDT-BNB', tokens: ['WBNB', 'XVS', 'USDT', 'WBNB'], risk: 'Medio' },
            { name: 'BNB-BIFI-BUSD-BNB', tokens: ['WBNB', 'BIFI', 'BUSD', 'WBNB'], risk: 'Medio' },
            
            // Percorsi con gaming tokens
            { name: 'BNB-MBOX-BUSD-BNB', tokens: ['WBNB', 'MBOX', 'BUSD', 'WBNB'], risk: 'Alto' },
            { name: 'BNB-TLM-USDT-BNB', tokens: ['WBNB', 'TLM', 'USDT', 'WBNB'], risk: 'Alto' },
            
            // Percorsi tra token piccoli (molto rischiosi)
            { name: 'CAKE-ALPACA-XVS-CAKE', tokens: ['CAKE', 'ALPACA', 'XVS', 'CAKE'], risk: 'Estremo' },
            { name: 'ALPACA-BIFI-AUTO-ALPACA', tokens: ['ALPACA', 'BIFI', 'AUTO', 'ALPACA'], risk: 'Estremo' },
            
            // Percorsi con meme tokens (MASSIMO RISCHIO)
            { name: 'BNB-SAFEMOON-BUSD-BNB', tokens: ['WBNB', 'SAFEMOON', 'BUSD', 'WBNB'], risk: 'MASSIMO' },
            { name: 'BNB-BABYDOGE-USDT-BNB', tokens: ['WBNB', 'BABYDOGE', 'USDT', 'WBNB'], risk: 'MASSIMO' }
        ];
        
        // Importi molto piccoli per minimizzare rischi e slippage
        const testAmounts = [
            { amount: '0.0001', label: '0.0001 (nano)', gas: 'bassissimo' },
            { amount: '0.001', label: '0.001 (micro)', gas: 'basso' },
            { amount: '0.01', label: '0.01 (piccolo)', gas: 'medio' },
            { amount: '0.05', label: '0.05 (test)', gas: 'alto' }
        ];
        
        console.log('💰 Testando token micro-cap con importi minimi\n');
        console.log('⚠️  ATTENZIONE: Questi sono MERCATI REALI con rischi reali!\n');
        
        let totalOpportunities = 0;
        let profitableOpportunities = [];
        
        for (const testAmount of testAmounts) {
            console.log(`💵 IMPORTO: ${testAmount.label} BNB (gas: ${testAmount.gas})`);
            console.log('═'.repeat(60));
            
            const inputAmount = ethers.utils.parseEther(testAmount.amount);
            let bestOpportunity = null;
            let bestProfit = -Infinity;
            
            for (const path of paths) {
                console.log(`🔺 ${path.name} [${path.risk} RISCHIO]:`);
                
                try {
                    // Verifica che tutti i token esistano nell'oggetto tokens
                    const missingTokens = path.tokens.filter(token => !tokens[token]);
                    if (missingTokens.length > 0) {
                        console.log(`   ⚠️  Token non trovati: ${missingTokens.join(', ')}`);
                        continue;
                    }
                    
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
                    
                    totalOpportunities++;
                    
                    // Tracking migliore opportunità
                    if (profitPercentage > bestProfit) {
                        bestProfit = profitPercentage;
                        bestOpportunity = {
                            path: path.name,
                            profit: profit,
                            percentage: profitPercentage,
                            input: input,
                            output: finalAmount,
                            risk: path.risk,
                            amount: testAmount.label
                        };
                    }
                    
                    if (profit > 0) {
                        console.log('   🎯 ✨ OPPORTUNITÀ PROFITTEVOLE REALE! ✨');
                        profitableOpportunities.push({
                            path: path.name,
                            profit: profit,
                            percentage: profitPercentage,
                            amount: testAmount.label,
                            risk: path.risk
                        });
                    } else if (profitPercentage > -0.5) {
                        console.log('   📊 Quasi profittevole! (Considera gas)');
                    } else if (profitPercentage > -2.0) {
                        console.log('   📈 Potenziale interessante');
                    } else if (profitPercentage > -10.0) {
                        console.log('   📉 Perdita accettabile');
                    } else {
                        console.log('   💀 Perdita elevata');
                    }
                    
                    console.log('');
                    
                } catch (error) {
                    if (error.message.includes('INSUFFICIENT_LIQUIDITY')) {
                        console.log(`   ❌ Liquidità insufficiente`);
                        console.log(`   💡 Pool troppo piccolo per ${path.tokens[1]}`);
                    } else if (error.message.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
                        console.log(`   ⚠️  Output insufficiente (slippage alto)`);
                    } else if (error.message.includes('TRANSFER_FROM_FAILED')) {
                        console.log(`   ❌ Transfer fallito (token potrebbero avere tasse)`);
                    } else if (error.message.includes('execution reverted')) {
                        console.log(`   ❌ Esecuzione fallita (possibili tasse o pause)`);
                    } else {
                        console.log(`   ❌ Errore: ${error.message.substring(0, 40)}...`);
                    }
                    console.log('');
                }
                
                // Piccola pausa per non saturare RPC
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Riepilogo migliore opportunità per questo importo
            if (bestOpportunity) {
                console.log('🏆 MIGLIORE OPPORTUNITÀ PER QUESTO IMPORTO:');
                console.log(`   🎯 Percorso: ${bestOpportunity.path}`);
                console.log(`   💰 Profitto: ${bestOpportunity.profit.toFixed(8)} (${bestOpportunity.percentage.toFixed(4)}%)`);
                console.log(`   ⚠️  Rischio: ${bestOpportunity.risk}`);
                if (bestOpportunity.percentage > 0) {
                    console.log('   ✨ PROFITTEVOLE SU MAINNET REALE! ✨');
                }
            }
            console.log('\n' + '═'.repeat(60) + '\n');
        }
        
        // Riepilogo finale
        console.log('📊 RIEPILOGO ANALISI MAINNET:');
        console.log('============================');
        console.log(`🔍 Opportunità testate: ${totalOpportunities}`);
        console.log(`🎯 Opportunità profittevoli: ${profitableOpportunities.length}`);
        
        if (profitableOpportunities.length > 0) {
            console.log('\n🏆 OPPORTUNITÀ PROFITTEVOLI TROVATE:');
            profitableOpportunities.forEach((opp, index) => {
                console.log(`${index + 1}. ${opp.path}`);
                console.log(`   💰 ${opp.profit.toFixed(8)} (${opp.percentage.toFixed(4)}%)`);
                console.log(`   📊 Importo: ${opp.amount} BNB`);
                console.log(`   ⚠️  Rischio: ${opp.risk}`);
                console.log('');
            });
        } else {
            console.log('\n❌ Nessuna opportunità profittevole trovata al momento');
            console.log('💡 Questo è normale su mainnet - riprova in momenti diversi');
        }
        
        console.log('📋 RACCOMANDAZIONI:');
        console.log('===================');
        console.log('✅ Token piccoli offrono più opportunità');
        console.log('✅ Usa importi molto piccoli per minimizzare rischi');
        console.log('⚠️  Considera sempre i costi del gas');
        console.log('⚠️  Token meme hanno rischi estremi');
        console.log('🔄 Le opportunità cambiano continuamente');
        console.log('🤖 Considera automation per catturare opportunità veloci');
        
    } catch (error) {
        console.log('❌ Errore generale:', error.message);
    }
}

testSmallTokensMainnet(); 