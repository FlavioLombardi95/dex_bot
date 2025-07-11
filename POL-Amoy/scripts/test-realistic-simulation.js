const { ethers } = require('ethers');
const { config } = require('../bot/config');

console.log('🧪 === TEST SIMULAZIONE REALISTICA ===');

// Simula prezzi più realistici (spread più piccoli)
const realisticPrices = {
    'WMATIC/USDC': {
        uniswap: 0.8500,
        sushiswap: 0.8515 // Spread: 0.18%
    },
    'WMATIC/USDT': {
        uniswap: 0.8400,
        sushiswap: 0.8412 // Spread: 0.14%
    },
    'USDC/USDT': {
        uniswap: 0.9995,
        sushiswap: 1.0005 // Spread: 0.10%
    },
    'WMATIC/DAI': {
        uniswap: 0.8300,
        sushiswap: 0.8310 // Spread: 0.12%
    },
    'USDC/DAI': {
        uniswap: 0.9990,
        sushiswap: 1.0010 // Spread: 0.20%
    }
};

// Funzione per calcolare spread
function calculateSpread(pair, uniswapPrice, sushiswapPrice) {
    const spread = Math.abs(uniswapPrice - sushiswapPrice) / Math.min(uniswapPrice, sushiswapPrice);
    return spread * 100; // Converti in percentuale
}

// Funzione per simulare monitoraggio continuo
function simulateContinuousMonitoring() {
    console.log('🔍 Simulazione monitoraggio continuo...\n');
    
    let totalOpportunities = 0;
    let profitableOpportunities = 0;
    let totalProfit = 0;
    
    // Simula 10 cicli di monitoraggio
    for (let cycle = 1; cycle <= 10; cycle++) {
        console.log(`📊 Ciclo ${cycle}/10:`);
        
        let cycleOpportunities = 0;
        
        for (const [pair, prices] of Object.entries(realisticPrices)) {
            // Aggiungi variazione casuale ai prezzi
            const variation = (Math.random() - 0.5) * 0.002; // ±0.1%
            const uniswapPrice = prices.uniswap * (1 + variation);
            const sushiswapPrice = prices.sushiswap * (1 + variation);
            
            const spread = calculateSpread(pair, uniswapPrice, sushiswapPrice);
            
            if (spread > config.arbitrage.minProfitThreshold * 100) {
                cycleOpportunities++;
                totalOpportunities++;
                
                console.log(`   ✅ ${pair}: Spread ${spread.toFixed(3)}%`);
                
                // Simula esecuzione
                const amount = 1000;
                const buyPrice = Math.min(uniswapPrice, sushiswapPrice);
                const sellPrice = Math.max(uniswapPrice, sushiswapPrice);
                
                const buyCost = amount * buyPrice;
                const sellRevenue = amount * sellPrice;
                const profit = sellRevenue - buyCost;
                
                if (profit > 0) {
                    profitableOpportunities++;
                    totalProfit += profit;
                    console.log(`      💰 Profitto: ${profit.toFixed(4)} USDC`);
                }
            }
        }
        
        if (cycleOpportunities === 0) {
            console.log(`   ❌ Nessuna opportunità in questo ciclo`);
        }
        
        console.log('');
        
        // Simula intervallo di monitoraggio
        if (cycle < 10) {
            console.log(`⏱️  Attendo ${config.arbitrage.monitoringInterval}ms...`);
        }
    }
    
    return {
        totalOpportunities,
        profitableOpportunities,
        totalProfit,
        successRate: totalOpportunities > 0 ? (profitableOpportunities / totalOpportunities) * 100 : 0
    };
}

// Funzione per testare diverse soglie di profitto
function testDifferentThresholds() {
    console.log('📊 === TEST DIVERSE SOGLIE DI PROFITTO ===\n');
    
    const thresholds = [0.1, 0.2, 0.5, 1.0, 2.0]; // Percentuali
    
    for (const threshold of thresholds) {
        console.log(`🎯 Soglia: ${threshold}%`);
        
        let opportunities = 0;
        let profitable = 0;
        let totalProfit = 0;
        
        for (const [pair, prices] of Object.entries(realisticPrices)) {
            const spread = calculateSpread(pair, prices.uniswap, prices.sushiswap);
            
            if (spread > threshold) {
                opportunities++;
                
                const amount = 1000;
                const buyPrice = Math.min(prices.uniswap, prices.sushiswap);
                const sellPrice = Math.max(prices.uniswap, prices.sushiswap);
                
                const buyCost = amount * buyPrice;
                const sellRevenue = amount * sellPrice;
                const profit = sellRevenue - buyCost;
                
                if (profit > 0) {
                    profitable++;
                    totalProfit += profit;
                }
            }
        }
        
        console.log(`   Opportunità trovate: ${opportunities}`);
        console.log(`   Profittevoli: ${profitable}`);
        console.log(`   Profitto totale: ${totalProfit.toFixed(4)} USDC`);
        console.log(`   Tasso successo: ${opportunities > 0 ? (profitable / opportunities * 100).toFixed(1) : 0}%\n`);
    }
}

// Test principale
function runRealisticSimulation() {
    console.log('✅ Configurazione caricata');
    console.log(`📊 Soglia profitto minimo: ${config.arbitrage.minProfitThreshold * 100}%`);
    console.log(`⏱️  Intervallo monitoraggio: ${config.arbitrage.monitoringInterval}ms`);
    console.log(`💰 Importo flash loan: ${ethers.utils.formatEther(config.arbitrage.flashLoanAmount)} MATIC\n`);
    
    // Test monitoraggio continuo
    const monitoringResults = simulateContinuousMonitoring();
    
    console.log('📈 === RISULTATI MONITORAGGIO ===');
    console.log(`🔍 Opportunità totali: ${monitoringResults.totalOpportunities}`);
    console.log(`💰 Opportunità profittevoli: ${monitoringResults.profitableOpportunities}`);
    console.log(`💵 Profitto totale: ${monitoringResults.totalProfit.toFixed(4)} USDC`);
    console.log(`📊 Tasso di successo: ${monitoringResults.successRate.toFixed(1)}%\n`);
    
    // Test diverse soglie
    testDifferentThresholds();
    
    console.log('💡 === RACCOMANDAZIONI ===');
    console.log('• Per spread < 0.5%: Opportunità rare, ma più sicure');
    console.log('• Per spread 0.5-1%: Bilanciamento ottimale');
    console.log('• Per spread > 1%: Opportunità frequenti, ma rischio slippage');
    console.log('• Considera sempre i costi di gas nel calcolo del profitto');
}

// Esegui simulazione
try {
    runRealisticSimulation();
} catch (error) {
    console.error('❌ Errore durante simulazione:', error.message);
} 