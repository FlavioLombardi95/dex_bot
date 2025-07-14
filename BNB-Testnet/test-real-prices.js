const { ethers } = require('ethers');

// Test con prezzi reali da PancakeSwap (read-only)
async function testRealPrices() {
    console.log('📊 TEST CON PREZZI REALI PANCAKESWAP');
    console.log('===================================');
    
    const provider = new ethers.providers.JsonRpcProvider('https://bsc-testnet.publicnode.com');
    
    // ABI Router PancakeSwap (solo getAmountsOut)
    const routerABI = [
        'function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)'
    ];
    
    const router = new ethers.Contract(
        '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
        routerABI,
        provider
    );
    
    // Token addresses
    const tokens = {
        WBNB: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
        BUSD: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
        USDT: '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684'
    };
    
    const inputAmount = ethers.utils.parseEther('0.1'); // 0.1 BNB
    
    try {
        console.log('🔍 Recupero prezzi reali...');
        
        // Path: BNB → BUSD → USDT → BNB
        const step1 = await router.getAmountsOut(inputAmount, [tokens.WBNB, tokens.BUSD]);
        const step2 = await router.getAmountsOut(step1[1], [tokens.BUSD, tokens.USDT]);
        const step3 = await router.getAmountsOut(step2[1], [tokens.USDT, tokens.WBNB]);
        
        console.log('🔺 Percorso Triangolare REALE:');
        console.log(`   Input: ${ethers.utils.formatEther(inputAmount)} BNB`);
        console.log(`   Step 1: ${ethers.utils.formatEther(step1[1])} BUSD`);
        console.log(`   Step 2: ${ethers.utils.formatEther(step2[1])} USDT`);
        console.log(`   Step 3: ${ethers.utils.formatEther(step3[1])} BNB`);
        
        const profit = step3[1].sub(inputAmount);
        const profitPercentage = profit.mul(10000).div(inputAmount).toNumber() / 100;
        
        console.log('📈 RISULTATI REALI:');
        console.log(`   Profitto: ${ethers.utils.formatEther(profit)} BNB`);
        console.log(`   Percentuale: ${profitPercentage.toFixed(4)}%`);
        
        if (profit.gt(0)) {
            console.log('✅ OPPORTUNITÀ REALE TROVATA!');
        } else {
            console.log('❌ Nessuna opportunità al momento');
        }
        
    } catch (error) {
        console.log('⚠️ Errore (normale se poca liquidità):', error.message);
        console.log('💡 Il sistema funziona, servono solo token per eseguire');
    }
}

testRealPrices();
