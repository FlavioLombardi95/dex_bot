console.log('🪙 TEST ARBITRAGGIO CON TOKEN PICCOLI');
console.log('====================================');

const { ethers } = require('ethers');

setTimeout(() => process.exit(0), 30000);

async function testSmallTokens() {
    try {
        const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        const routerABI = ['function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)'];
        const router = new ethers.Contract('0x10ED43C718714eb63d5aA57B78B54704E256024E', routerABI, provider);
        
        // Token più piccoli su BSC
        const tokens = {
            WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
            BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
            USDT: '0x55d398326f99059fF775485246999027B3197955',
            CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // PancakeSwap
            ADA: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',  // Cardano
            DOT: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',  // Polkadot  
            LINK: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD', // Chainlink
            UNI: '0xBf5140A22578168FD562DCcF235E5D43A02ce9B1',  // Uniswap
            XRP: '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE'   // Ripple
        };
        
        // Percorsi triangolari con token piccoli
        const paths = [
            { name: 'BNB-CAKE-BUSD-BNB', tokens: ['WBNB', 'CAKE', 'BUSD', 'WBNB'] },
            { name: 'BNB-ADA-USDT-BNB', tokens: ['WBNB', 'ADA', 'USDT', 'WBNB'] },
            { name: 'BNB-DOT-BUSD-BNB', tokens: ['WBNB', 'DOT', 'BUSD', 'WBNB'] },
            { name: 'BNB-LINK-USDT-BNB', tokens: ['WBNB', 'LINK', 'USDT', 'WBNB'] },
            { name: 'CAKE-BUSD-USDT-CAKE', tokens: ['CAKE', 'BUSD', 'USDT', 'CAKE'] },
            { name: 'ADA-BUSD-DOT-ADA', tokens: ['ADA', 'BUSD', 'DOT', 'ADA'] },
            { name: 'LINK-USDT-CAKE-LINK', tokens: ['LINK', 'USDT', 'CAKE', 'LINK'] },
            { name: 'UNI-BUSD-XRP-UNI', tokens: ['UNI', 'BUSD', 'XRP', 'UNI'] }
        ];
        
        const inputAmount = ethers.utils.parseEther('0.05'); // Importo più piccolo
        
        console.log('💰 Testing con 0.05 token di input\n');
        
        for (const path of paths) {
            console.log(`🔺 ${path.name}:`);
            console.log('─'.repeat(45));
            
            try {
                // Step 1
                const amounts1 = await router.getAmountsOut(inputAmount, 
                    [tokens[path.tokens[0]], tokens[path.tokens[1]]]);
                
                // Step 2
                const amounts2 = await router.getAmountsOut(amounts1[1],
                    [tokens[path.tokens[1]], tokens[path.tokens[2]]]);
                
                // Step 3
                const amounts3 = await router.getAmountsOut(amounts2[1],
                    [tokens[path.tokens[2]], tokens[path.tokens[3]]]);
                
                const input = 0.05;
                const finalAmount = Number(ethers.utils.formatEther(amounts3[1]));
                const profit = finalAmount - input;
                const profitPercentage = (profit / input) * 100;
                
                console.log(`   Input:   ${input} ${path.tokens[0]}`);
                console.log(`   Step 1:  ${Number(ethers.utils.formatEther(amounts1[1])).toFixed(6)} ${path.tokens[1]}`);
                console.log(`   Step 2:  ${Number(ethers.utils.formatEther(amounts2[1])).toFixed(6)} ${path.tokens[2]}`);
                console.log(`   Step 3:  ${finalAmount.toFixed(6)} ${path.tokens[3]}`);
                console.log(`   Profitto: ${profit.toFixed(6)} (${profitPercentage.toFixed(4)}%)`);
                
                if (profit > 0) {
                    console.log('   🎯 OPPORTUNITÀ TROVATA! ✨✨✨');
                } else if (profit > -0.0025) { // Meno di 5% perdita
                    console.log('   📊 Quasi profittevole!');
                } else if (profit > -0.005) { // Meno di 10% perdita  
                    console.log('   📈 Buon potenziale');
                } else {
                    console.log('   📉 Non profittevole');
                }
                
                console.log('');
                
            } catch (error) {
                console.log(`   ❌ Errore: ${error.message.includes('INSUFFICIENT_LIQUIDITY') ? 'Liquidità insufficiente' : error.message.substring(0, 30)}`);
                if (error.message.includes('INSUFFICIENT_LIQUIDITY')) {
                    console.log('   💡 Pool troppo piccolo per questo token');
                }
                console.log('');
            }
        }
        
        console.log('🔍 ANALISI TOKEN PICCOLI:');
        console.log('==========================');
        console.log('✅ Token minori spesso hanno spread maggiori');
        console.log('✅ Meno liquidità = più opportunità di arbitraggio');
        console.log('✅ Meno competizione dai bot professionali');
        console.log('⚠️  Anche più rischi di slippage elevato');
        
    } catch (error) {
        console.log('❌ Errore generale:', error.message);
    }
}

testSmallTokens();
