#!/usr/bin/env node

const { ethers } = require('ethers');

console.log('📊 ANALISI PROFITTABILITÀ REALE ARBITRAGGIO CRYPTO');
console.log('=================================================');

// Dati di mercato realistici basati su condizioni reali
const MARKET_DATA = {
    // Prezzi tipici durante volatilità normale
    scenarios: [
        {
            name: 'Spread Basso (0.1%)',
            uniswap: 2420.50,
            sushiswap: 2418.08,
            spread: 0.1,
            likelihood: 'Molto comune'
        },
        {
            name: 'Spread Medio (0.5%)',
            uniswap: 2432.15,
            sushiswap: 2420.00,
            spread: 0.5,
            likelihood: 'Comune'
        },
        {
            name: 'Spread Alto (1.0%)',
            uniswap: 2444.20,
            sushiswap: 2420.00,
            spread: 1.0,
            likelihood: 'Raro'
        },
        {
            name: 'Spread Estremo (2.0%)',
            uniswap: 2468.40,
            sushiswap: 2420.00,
            spread: 2.0,
            likelihood: 'Molto raro'
        }
    ],
    
    // Costi reali nel 2024
    costs: {
        // Gas costs (Ethereum mainnet)
        gasPrice: {
            low: 12,    // 12 gwei
            medium: 25, // 25 gwei
            high: 50    // 50 gwei
        },
        
        // Gas utilizzato per arbitraggio complesso
        gasUsed: {
            flashLoan: 50000,
            swapA: 120000,
            swapB: 130000,
            repay: 40000,
            overhead: 20000
        },
        
        // Fee DEX (percentuali)
        dexFees: {
            uniswap: 0.003,    // 0.3%
            sushiswap: 0.003   // 0.3%
        },
        
        // Slippage tipico
        slippage: {
            lowLiquidity: 0.005,   // 0.5%
            mediumLiquidity: 0.002, // 0.2%
            highLiquidity: 0.001   // 0.1%
        },
        
        // Prezzo ETH per calcolo costi
        ethPrice: 2420
    }
};

function calculateGasCost(gasPrice, ethPrice) {
    const totalGas = Object.values(MARKET_DATA.costs.gasUsed).reduce((a, b) => a + b, 0);
    const gasCostEth = (totalGas * gasPrice) / 1e9;
    const gasCostUSD = gasCostEth * ethPrice;
    
    return {
        totalGas,
        gasCostEth,
        gasCostUSD
    };
}

function calculateArbitrageProfit(scenario, amount, gasCondition = 'medium') {
    const { uniswap, sushiswap } = scenario;
    const sellPrice = Math.max(uniswap, sushiswap);
    const buyPrice = Math.min(uniswap, sushiswap);
    
    // Direzione
    const sellDex = uniswap > sushiswap ? 'Uniswap' : 'SushiSwap';
    const buyDex = uniswap > sushiswap ? 'SushiSwap' : 'Uniswap';
    
    // Calcoli step by step
    const step1_sell = amount * sellPrice;
    const step1_fee = step1_sell * MARKET_DATA.costs.dexFees.uniswap;
    const step1_net = step1_sell - step1_fee;
    
    const step2_buy = step1_net / buyPrice;
    const step2_fee = step1_net * MARKET_DATA.costs.dexFees.sushiswap;
    const step2_net = step2_buy - (step2_fee / buyPrice);
    
    // Slippage (assume liquidità media)
    const slippageImpact = (step1_sell + step1_net) * MARKET_DATA.costs.slippage.mediumLiquidity;
    const step2_afterSlippage = step2_net - (slippageImpact / sellPrice);
    
    // Profitto lordo
    const grossProfit = step2_afterSlippage - amount;
    const grossProfitUSD = grossProfit * sellPrice;
    
    // Costi gas
    const gasCost = calculateGasCost(
        MARKET_DATA.costs.gasPrice[gasCondition],
        MARKET_DATA.costs.ethPrice
    );
    
    // Profitto netto
    const netProfitUSD = grossProfitUSD - gasCost.gasCostUSD;
    const roi = (netProfitUSD / (amount * sellPrice)) * 100;
    
    return {
        direction: `${sellDex} → ${buyDex}`,
        sellPrice,
        buyPrice,
        grossProfit,
        grossProfitUSD,
        gasCost,
        netProfitUSD,
        roi,
        profitable: netProfitUSD > 0,
        details: {
            sellValue: step1_sell,
            sellFee: step1_fee,
            buyFee: step2_fee,
            slippage: slippageImpact,
            finalAmount: step2_afterSlippage
        }
    };
}

function analyzeScenario(scenario) {
    console.log(`\n🎯 SCENARIO: ${scenario.name}`);
    console.log('='.repeat(scenario.name.length + 12));
    console.log(`📊 Spread: ${scenario.spread}% (${scenario.likelihood})`);
    console.log(`💰 Prezzo Uniswap: $${scenario.uniswap.toFixed(2)}`);
    console.log(`💰 Prezzo SushiSwap: $${scenario.sushiswap.toFixed(2)}`);
    console.log(`📈 Differenza: $${(scenario.uniswap - scenario.sushiswap).toFixed(2)}`);
    
    // Testa diversi importi
    const amounts = [0.5, 1.0, 2.0, 5.0];
    const gasConditions = ['low', 'medium', 'high'];
    
    console.log('\n💡 ANALISI PROFITTABILITÀ:');
    console.log('==========================');
    
    let bestProfit = -Infinity;
    let bestConfig = null;
    
    for (const amount of amounts) {
        console.log(`\n💎 Importo: ${amount} WETH`);
        
        for (const gasCondition of gasConditions) {
            const result = calculateArbitrageProfit(scenario, amount, gasCondition);
            
            console.log(`   ⛽ Gas ${gasCondition} (${MARKET_DATA.costs.gasPrice[gasCondition]} gwei):`);
            console.log(`      Profitto lordo: $${result.grossProfitUSD.toFixed(2)}`);
            console.log(`      Costo gas: $${result.gasCost.gasCostUSD.toFixed(2)}`);
            console.log(`      Profitto netto: $${result.netProfitUSD.toFixed(2)}`);
            console.log(`      ROI: ${result.roi.toFixed(3)}%`);
            console.log(`      Status: ${result.profitable ? '✅ PROFITTEVOLE' : '❌ PERDITA'}`);
            
            if (result.netProfitUSD > bestProfit) {
                bestProfit = result.netProfitUSD;
                bestConfig = { amount, gasCondition, result };
            }
        }
    }
    
    return { bestProfit, bestConfig };
}

function generateRecommendations(results) {
    console.log('\n🎯 RACCOMANDAZIONI STRATEGICHE:');
    console.log('==============================');
    
    const profitableScenarios = results.filter(r => r.bestProfit > 0);
    const minProfitThreshold = 20; // $20 minimo
    
    if (profitableScenarios.length === 0) {
        console.log('❌ NESSUNO SCENARIO PROFITTEVOLE');
        console.log('📋 Motivi principali:');
        console.log('   • Spread troppo bassi per coprire i costi');
        console.log('   • Costi gas elevati');
        console.log('   • Fee DEX del 0.6% totale');
        console.log('   • Slippage impact');
        
        console.log('\n💡 SUGGERIMENTI:');
        console.log('   1. Attendi spread > 1.0%');
        console.log('   2. Usa gas price < 20 gwei');
        console.log('   3. Cerca momenti di alta volatilità');
        console.log('   4. Considera L2 (Arbitrum, Polygon)');
        return;
    }
    
    const viableScenarios = profitableScenarios.filter(r => r.bestProfit > minProfitThreshold);
    
    console.log(`✅ ${profitableScenarios.length}/4 scenari profittevoli`);
    console.log(`🎯 ${viableScenarios.length}/4 scenari con profitto > $${minProfitThreshold}`);
    
    if (viableScenarios.length > 0) {
        console.log('\n🏆 CONFIGURAZIONI OTTIMALI:');
        console.log('===========================');
        
        viableScenarios.forEach((scenario, index) => {
            const { bestConfig } = scenario;
            console.log(`${index + 1}. ${scenario.scenario.name}:`);
            console.log(`   💰 Importo: ${bestConfig.amount} WETH`);
            console.log(`   ⛽ Gas: ${bestConfig.gasCondition} (${MARKET_DATA.costs.gasPrice[bestConfig.gasCondition]} gwei)`);
            console.log(`   💵 Profitto: $${bestConfig.result.netProfitUSD.toFixed(2)}`);
            console.log(`   📈 ROI: ${bestConfig.result.roi.toFixed(3)}%`);
            console.log(`   🎯 Direzione: ${bestConfig.result.direction}`);
        });
    }
    
    console.log('\n📊 CONCLUSIONI FINALI:');
    console.log('======================');
    
    if (viableScenarios.length === 0) {
        console.log('❌ ARBITRAGGIO NON PROFITTEVOLE nelle condizioni attuali');
        console.log('⚠️  Spread minimi richiesti: > 1.0%');
        console.log('⚠️  Gas massimo consigliato: < 20 gwei');
        console.log('💡 Monitora continuamente per opportunità');
    } else {
        console.log('✅ ARBITRAGGIO PROFITTEVOLE in condizioni specifiche');
        console.log(`🎯 Migliore opportunità: ${viableScenarios[0].scenario.name}`);
        console.log(`💰 Profitto massimo: $${Math.max(...viableScenarios.map(s => s.bestProfit)).toFixed(2)}`);
        console.log('⚡ Pronto per implementazione automatica');
    }
}

async function runRealProfitabilityAnalysis() {
    console.log('🚀 AVVIO ANALISI PROFITTABILITÀ REALE...\n');
    
    console.log('📋 PARAMETRI ANALISI:');
    console.log('=====================');
    console.log('• Fee DEX: 0.3% per swap (0.6% totale)');
    console.log('• Slippage: 0.1-0.5% (dipende dalla liquidità)');
    console.log('• Gas: 360,000 units (operazione complessa)');
    console.log('• Flash loan: Gratuito (Balancer V2)');
    console.log('• Importi testati: 0.5, 1.0, 2.0, 5.0 WETH');
    console.log('• Condizioni gas: 12, 25, 50 gwei');
    
    const results = [];
    
    // Analizza ogni scenario
    for (const scenario of MARKET_DATA.scenarios) {
        const result = analyzeScenario(scenario);
        results.push({ scenario, ...result });
    }
    
    // Genera raccomandazioni
    generateRecommendations(results);
    
    console.log('\n🏁 ANALISI COMPLETATA!');
    console.log('======================');
    console.log('📊 Hai visto una valutazione completa della profittabilità');
    console.log('💰 Considerando tutti i costi reali del 2024');
    console.log('⚡ Con dati di mercato realistici');
}

// Avvia l'analisi
runRealProfitabilityAnalysis().catch(console.error); 