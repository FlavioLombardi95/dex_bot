const { ethers } = require('ethers');
const { config } = require('../bot/config');

console.log('🧪 === TEST SIMULAZIONE BOT ARBITRAGGIO ===');

// Simula prezzi per test
const simulatedPrices = {
    'WMATIC/USDC': {
        uniswap: 0.85, // 1 WMATIC = 0.85 USDC
        sushiswap: 0.87 // 1 WMATIC = 0.87 USDC
    },
    'WMATIC/USDT': {
        uniswap: 0.84,
        sushiswap: 0.86
    },
    'USDC/USDT': {
        uniswap: 0.99,
        sushiswap: 1.01
    },
    'WMATIC/DAI': {
        uniswap: 0.83,
        sushiswap: 0.85
    },
    'USDC/DAI': {
        uniswap: 0.98,
        sushiswap: 1.02
    }
};

// Funzione per calcolare spread
function calculateSpread(pair, uniswapPrice, sushiswapPrice) {
    const spread = Math.abs(uniswapPrice - sushiswapPrice) / Math.min(uniswapPrice, sushiswapPrice);
    return spread * 100; // Converti in percentuale
}

// Funzione per simulare opportunità di arbitraggio
function findArbitrageOpportunities() {
    console.log('🔍 Cercando opportunità di arbitraggio...\n');
    
    const opportunities = [];
    
    for (const [pair, prices] of Object.entries(simulatedPrices)) {
        const spread = calculateSpread(pair, prices.uniswap, prices.sushiswap);
        
        console.log(`📊 ${pair}:`);
        console.log(`   Uniswap: ${prices.uniswap}`);
        console.log(`   SushiSwap: ${prices.sushiswap}`);
        console.log(`   Spread: ${spread.toFixed(2)}%`);
        
        if (spread > config.arbitrage.minProfitThreshold * 100) {
            console.log(`   ✅ OPPORTUNITÀ TROVATA! Spread > ${config.arbitrage.minProfitThreshold * 100}%`);
            opportunities.push({
                pair,
                uniswapPrice: prices.uniswap,
                sushiswapPrice: prices.sushiswap,
                spread: spread,
                buyFrom: prices.uniswap < prices.sushiswap ? 'uniswap' : 'sushiswap',
                sellTo: prices.uniswap < prices.sushiswap ? 'sushiswap' : 'uniswap'
            });
        } else {
            console.log(`   ❌ Spread insufficiente`);
        }
        console.log('');
    }
    
    return opportunities;
}

// Funzione per simulare esecuzione arbitraggio
function simulateArbitrageExecution(opportunity) {
    console.log(`🚀 Simulazione esecuzione arbitraggio per ${opportunity.pair}:`);
    console.log(`   Compra da: ${opportunity.buyFrom}`);
    console.log(`   Vendi a: ${opportunity.sellTo}`);
    console.log(`   Spread: ${opportunity.spread.toFixed(2)}%`);
    
    // Calcola profitto simulato
    const amount = 1000; // 1000 token
    const buyPrice = opportunity.buyFrom === 'uniswap' ? opportunity.uniswapPrice : opportunity.sushiswapPrice;
    const sellPrice = opportunity.sellTo === 'uniswap' ? opportunity.uniswapPrice : opportunity.sushiswapPrice;
    
    const buyCost = amount * buyPrice;
    const sellRevenue = amount * sellPrice;
    const profit = sellRevenue - buyCost;
    const profitPercentage = (profit / buyCost) * 100;
    
    console.log(`   Profitto stimato: ${profit.toFixed(4)} USDC (${profitPercentage.toFixed(2)}%)`);
    console.log(`   Gas stimato: ${config.arbitrage.gasLimit} * ${config.arbitrage.gasPrice / 1e9} gwei = ${(config.arbitrage.gasLimit * config.arbitrage.gasPrice / 1e18).toFixed(6)} ETH`);
    
    return {
        profitable: profit > 0,
        profit: profit,
        profitPercentage: profitPercentage
    };
}

// Test principale
function runSimulation() {
    console.log('✅ Configurazione caricata');
    console.log(`📊 Soglia profitto minimo: ${config.arbitrage.minProfitThreshold * 100}%`);
    console.log(`⏱️  Intervallo monitoraggio: ${config.arbitrage.monitoringInterval}ms`);
    console.log(`💰 Importo flash loan: ${ethers.utils.formatEther(config.arbitrage.flashLoanAmount)} MATIC\n`);
    
    // Trova opportunità
    const opportunities = findArbitrageOpportunities();
    
    if (opportunities.length === 0) {
        console.log('❌ Nessuna opportunità di arbitraggio trovata');
        return;
    }
    
    console.log(`🎯 Trovate ${opportunities.length} opportunità di arbitraggio!\n`);
    
    // Simula esecuzione per ogni opportunità
    let totalProfit = 0;
    let profitableTrades = 0;
    
    for (const opportunity of opportunities) {
        const result = simulateArbitrageExecution(opportunity);
        
        if (result.profitable) {
            profitableTrades++;
            totalProfit += result.profit;
        }
        
        console.log('');
    }
    
    console.log('📈 === RISULTATI SIMULAZIONE ===');
    console.log(`💰 Trades profittevoli: ${profitableTrades}/${opportunities.length}`);
    console.log(`💵 Profitto totale: ${totalProfit.toFixed(4)} USDC`);
    console.log(`📊 Profitto medio: ${profitableTrades > 0 ? (totalProfit / profitableTrades).toFixed(4) : 0} USDC`);
}

// Esegui simulazione
try {
    runSimulation();
} catch (error) {
    console.error('❌ Errore durante simulazione:', error.message);
} 