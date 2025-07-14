console.log('🔄 TEST PERCORSI TRIANGOLARI ALTERNATIVI');
console.log('========================================');

const { ethers } = require('ethers');

setTimeout(() => process.exit(0), 20000);

async function testAlternativePaths() {
    try {
        const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        const routerABI = ['function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)'];
        const router = new ethers.Contract('0x10ED43C718714eb63d5aA57B78B54704E256024E', routerABI, provider);
        
        const tokens = {
            WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
            BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
            USDT: '0x55d398326f99059fF775485246999027B3197955',
            USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
            ETH: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8'
        };
        
        const paths = [
            { name: 'BNB-USDT-BUSD-BNB', tokens: ['WBNB', 'USDT', 'BUSD', 'WBNB'] },
            { name: 'BNB-ETH-USDT-BNB', tokens: ['WBNB', 'ETH', 'USDT', 'WBNB'] },
            { name: 'BNB-USDC-BUSD-BNB', tokens: ['WBNB', 'USDC', 'BUSD', 'WBNB'] },
            { name: 'BUSD-USDT-USDC-BUSD', tokens: ['BUSD', 'USDT', 'USDC', 'BUSD'] }
        ];
        
        const inputAmount = ethers.utils.parseEther('0.1');
        
        for (const path of paths) {
            console.log(`\n🔺 Percorso: ${path.name}`);
            console.log('─'.repeat(50));
            
            try {
                let currentAmount = inputAmount;
                
                console.log(`   💰 Start: 0.1 ${path.tokens[0]}`);
                
                // Step 1
                const amounts1 = await router.getAmountsOut(currentAmount, 
                    [tokens[path.tokens[0]], tokens[path.tokens[1]]]);
                console.log(`   Step 1: → ${Number(ethers.utils.formatEther(amounts1[1])).toFixed(6)} ${path.tokens[1]}`);
                
                // Step 2
                const amounts2 = await router.getAmountsOut(amounts1[1],
                    [tokens[path.tokens[1]], tokens[path.tokens[2]]]);
                console.log(`   Step 2: → ${Number(ethers.utils.formatEther(amounts2[1])).toFixed(6)} ${path.tokens[2]}`);
                
                // Step 3
                const amounts3 = await router.getAmountsOut(amounts2[1],
                    [tokens[path.tokens[2]], tokens[path.tokens[3]]]);
                console.log(`   Step 3: → ${Number(ethers.utils.formatEther(amounts3[1])).toFixed(6)} ${path.tokens[3]}`);
                
                const finalAmount = Number(ethers.utils.formatEther(amounts3[1]));
                const profit = finalAmount - 0.1;
                const profitPercentage = (profit / 0.1) * 100;
                
                console.log(`   📊 Finale: ${finalAmount.toFixed(6)}`);
                console.log(`   💰 Profitto: ${profit.toFixed(6)} (${profitPercentage.toFixed(4)}%)`);
                
                if (profit > 0) {
                    console.log('   🎯 OPPORTUNITÀ TROVATA! ✨');
                } else if (profit > -0.001) {
                    console.log('   📊 Quasi break-even');
                } else {
                    console.log('   📉 Non profittevole');
                }
                
            } catch (error) {
                console.log(`   ❌ Errore: ${error.message.substring(0, 30)}...`);
            }
        }
        
        console.log('\n🏆 Sistema pronto per arbitraggio reale!');
        
    } catch (error) {
        console.log('❌ Errore:', error.message);
    }
}

testAlternativePaths();
