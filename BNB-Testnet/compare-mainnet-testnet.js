console.log('🔍 CONFRONTO PREZZI: BSC MAINNET vs TESTNET');
console.log('============================================');

const { ethers } = require('ethers');

setTimeout(() => process.exit(0), 15000);

async function comparePrices() {
    try {
        // Provider per BSC Mainnet e Testnet
        const mainnetProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        const testnetProvider = new ethers.providers.JsonRpcProvider('https://bsc-testnet.publicnode.com');
        
        const routerABI = ['function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)'];
        
        // Router addresses
        const mainnetRouter = new ethers.Contract('0x10ED43C718714eb63d5aA57B78B54704E256024E', routerABI, mainnetProvider);
        const testnetRouter = new ethers.Contract('0xD99D1c33F9fC3444f8101754aBC46c52416550D1', routerABI, testnetProvider);
        
        // Token addresses
        const mainnetTokens = {
            WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
            BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
            USDT: '0x55d398326f99059fF775485246999027B3197955',
            USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
        };
        
        const testnetTokens = {
            WBNB: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
            BUSD: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
            USDT: '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684',
            USDC: '0x64544969ed7EBf5f083679233325356EbE738930'
        };
        
        const inputAmount = ethers.utils.parseEther('0.001'); // 0.001 BNB
        const path = ['WBNB', 'USDC', 'BUSD', 'WBNB']; // Il percorso più profittevole su testnet
        
        console.log('🧪 Testando percorso: BNB → USDC → BUSD → BNB');
        console.log('💰 Importo: 0.001 BNB\n');
        
        // Test su MAINNET
        console.log('🌐 BSC MAINNET (prezzi reali di mercato):');
        console.log('─'.repeat(45));
        
        try {
            const amounts1_main = await mainnetRouter.getAmountsOut(inputAmount, 
                [mainnetTokens[path[0]], mainnetTokens[path[1]]]);
            const amounts2_main = await mainnetRouter.getAmountsOut(amounts1_main[1],
                [mainnetTokens[path[1]], mainnetTokens[path[2]]]);
            const amounts3_main = await mainnetRouter.getAmountsOut(amounts2_main[1],
                [mainnetTokens[path[2]], mainnetTokens[path[3]]]);
            
            const finalAmount_main = Number(ethers.utils.formatEther(amounts3_main[1]));
            const profit_main = finalAmount_main - 0.001;
            const profitPercentage_main = (profit_main / 0.001) * 100;
            
            console.log(`   Input:   0.001 WBNB`);
            console.log(`   Step 1:  ${Number(ethers.utils.formatEther(amounts1_main[1])).toFixed(8)} USDC`);
            console.log(`   Step 2:  ${Number(ethers.utils.formatEther(amounts2_main[1])).toFixed(8)} BUSD`);
            console.log(`   Step 3:  ${finalAmount_main.toFixed(8)} WBNB`);
            console.log(`   Profitto: ${profit_main.toFixed(8)} (${profitPercentage_main.toFixed(4)}%)`);
            
            if (profit_main > 0) {
                console.log('   ✅ PROFITTEVOLE su mainnet!');
            } else {
                console.log('   ❌ Non profittevole su mainnet');
            }
            
        } catch (error) {
            console.log(`   ❌ Errore mainnet: ${error.message.substring(0, 50)}...`);
        }
        
        console.log('\n');
        
        // Test su TESTNET
        console.log('🧪 BSC TESTNET (liquidità limitata):');
        console.log('─'.repeat(45));
        
        try {
            const amounts1_test = await testnetRouter.getAmountsOut(inputAmount, 
                [testnetTokens[path[0]], testnetTokens[path[1]]]);
            const amounts2_test = await testnetRouter.getAmountsOut(amounts1_test[1],
                [testnetTokens[path[1]], testnetTokens[path[2]]]);
            const amounts3_test = await testnetRouter.getAmountsOut(amounts2_test[1],
                [testnetTokens[path[2]], testnetTokens[path[3]]]);
            
            const finalAmount_test = Number(ethers.utils.formatEther(amounts3_test[1]));
            const profit_test = finalAmount_test - 0.001;
            const profitPercentage_test = (profit_test / 0.001) * 100;
            
            console.log(`   Input:   0.001 WBNB`);
            console.log(`   Step 1:  ${Number(ethers.utils.formatEther(amounts1_test[1])).toFixed(8)} USDC`);
            console.log(`   Step 2:  ${Number(ethers.utils.formatEther(amounts2_test[1])).toFixed(8)} BUSD`);
            console.log(`   Step 3:  ${finalAmount_test.toFixed(8)} WBNB`);
            console.log(`   Profitto: ${profit_test.toFixed(8)} (${profitPercentage_test.toFixed(4)}%)`);
            
            if (profit_test > 0) {
                console.log('   ✅ PROFITTEVOLE su testnet!');
            } else {
                console.log('   ❌ Non profittevole su testnet');
            }
            
        } catch (error) {
            console.log(`   ❌ Errore testnet: ${error.message.substring(0, 50)}...`);
        }
        
        console.log('\n📊 ANALISI COMPARATIVA:');
        console.log('========================');
        console.log('🌐 MAINNET:');
        console.log('  ✅ Liquidità elevata');
        console.log('  ✅ Prezzi efficienti');
        console.log('  ❌ Molti bot arbitrageurs');
        console.log('  ❌ Opportunità rare e brevi');
        console.log('');
        console.log('🧪 TESTNET:');
        console.log('  ✅ Pochi competitors');
        console.log('  ✅ Spread elevati');
        console.log('  ❌ Liquidità limitata');
        console.log('  ❌ Non rappresentativo del mercato reale');
        console.log('');
        console.log('💡 CONCLUSIONE:');
        console.log('  🎯 Testnet = Ottimo per sviluppo e test');
        console.log('  🚀 Mainnet = Profitti reali ma competizione alta');
        
    } catch (error) {
        console.log('❌ Errore generale:', error.message);
    }
}

comparePrices(); 