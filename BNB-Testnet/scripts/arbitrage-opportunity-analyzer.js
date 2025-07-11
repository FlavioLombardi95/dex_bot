const { ethers } = require('ethers');
const { config } = require('../bot/config');
const fs = require('fs');
const path = require('path');

console.log('📊 === ANALIZZATORE OPPORTUNITÀ ARBITRAGGIO ===\n');

// Configurazione analisi
const ANALYSIS_PERIOD = 72; // ore
const MONITORING_INTERVAL = 5000; // ms
const CYCLES_PER_HOUR = 3600000 / MONITORING_INTERVAL; // 3600000ms = 1 ora
const TOTAL_CYCLES = ANALYSIS_PERIOD * CYCLES_PER_HOUR;

// Simula dati storici di prezzi (in un sistema reale verrebbero da API)
function generateHistoricalPriceData() {
    const opportunities = [];
    const pairs = ['WMATIC/USDC', 'WMATIC/USDT', 'USDC/USDT', 'WMATIC/DAI', 'USDC/DAI'];
    
    console.log(`🔍 Simulazione monitoraggio ${ANALYSIS_PERIOD} ore...`);
    console.log(`📊 Cicli totali: ${TOTAL_CYCLES.toLocaleString()}`);
    console.log(`⏱️  Intervallo: ${MONITORING_INTERVAL}ms\n`);
    
    for (let cycle = 1; cycle <= TOTAL_CYCLES; cycle++) {
        const timestamp = Date.now() - (TOTAL_CYCLES - cycle) * MONITORING_INTERVAL;
        
        // Simula variazione di prezzi nel tempo
        const basePrices = {
            'WMATIC/USDC': { uniswap: 0.85, sushiswap: 0.851 },
            'WMATIC/USDT': { uniswap: 0.84, sushiswap: 0.841 },
            'USDC/USDT': { uniswap: 0.9995, sushiswap: 1.0005 },
            'WMATIC/DAI': { uniswap: 0.83, sushiswap: 0.831 },
            'USDC/DAI': { uniswap: 0.999, sushiswap: 1.001 }
        };
        
        // Aggiungi variazione casuale
        for (const [pair, prices] of Object.entries(basePrices)) {
            const variation = (Math.random() - 0.5) * 0.01; // ±0.5%
            const uniswapPrice = prices.uniswap * (1 + variation);
            const sushiswapPrice = prices.sushiswap * (1 + variation);
            
            const spread = Math.abs(uniswapPrice - sushiswapPrice) / Math.min(uniswapPrice, sushiswapPrice) * 100;
            
            // Registra solo opportunità sopra la soglia (usiamo 0.1% per il test)
            if (spread > 0.1) {
                opportunities.push({
                    timestamp,
                    cycle,
                    pair,
                    uniswapPrice,
                    sushiswapPrice,
                    spread,
                    buyFrom: uniswapPrice < sushiswapPrice ? 'uniswap' : 'sushiswap',
                    sellTo: uniswapPrice < sushiswapPrice ? 'sushiswap' : 'uniswap'
                });
            }
        }
        
        // Mostra progresso ogni 1000 cicli
        if (cycle % 1000 === 0) {
            console.log(`📊 Ciclo ${cycle.toLocaleString()}/${TOTAL_CYCLES.toLocaleString()} - Opportunità trovate: ${opportunities.length}`);
        }
    }
    
    return opportunities;
}

// Analizza le opportunità trovate
function analyzeOpportunities(opportunities) {
    console.log('\n📈 === ANALISI OPPORTUNITÀ TROVATE ===\n');
    
    if (opportunities.length === 0) {
        console.log('❌ Nessuna opportunità trovata nel periodo analizzato');
        return;
    }
    
    console.log(`🎯 Opportunità totali: ${opportunities.length}`);
    console.log(`📊 Frequenza: ${(opportunities.length / ANALYSIS_PERIOD).toFixed(2)} opportunità/ora`);
    console.log(`⏱️  Periodo analizzato: ${ANALYSIS_PERIOD} ore\n`);
    
    // Analisi per coppia
    const pairAnalysis = {};
    for (const opp of opportunities) {
        if (!pairAnalysis[opp.pair]) {
            pairAnalysis[opp.pair] = {
                count: 0,
                totalSpread: 0,
                maxSpread: 0,
                minSpread: Infinity,
                spreads: []
            };
        }
        
        pairAnalysis[opp.pair].count++;
        pairAnalysis[opp.pair].totalSpread += opp.spread;
        pairAnalysis[opp.pair].maxSpread = Math.max(pairAnalysis[opp.pair].maxSpread, opp.spread);
        pairAnalysis[opp.pair].minSpread = Math.min(pairAnalysis[opp.pair].minSpread, opp.spread);
        pairAnalysis[opp.pair].spreads.push(opp.spread);
    }
    
    console.log('📊 === ANALISI PER COPPIA ===\n');
    
    for (const [pair, analysis] of Object.entries(pairAnalysis)) {
        const avgSpread = analysis.totalSpread / analysis.count;
        const frequency = analysis.count / ANALYSIS_PERIOD;
        
        console.log(`🎯 ${pair}:`);
        console.log(`   📊 Opportunità: ${analysis.count}`);
        console.log(`   📈 Frequenza: ${frequency.toFixed(2)}/ora`);
        console.log(`   📊 Spread medio: ${avgSpread.toFixed(3)}%`);
        console.log(`   📈 Spread max: ${analysis.maxSpread.toFixed(3)}%`);
        console.log(`   📉 Spread min: ${analysis.minSpread.toFixed(3)}%`);
        console.log('');
    }
    
    // Analisi temporale
    console.log('⏰ === ANALISI TEMPORALE ===\n');
    
    const hourlyAnalysis = {};
    for (const opp of opportunities) {
        const hour = new Date(opp.timestamp).getHours();
        if (!hourlyAnalysis[hour]) {
            hourlyAnalysis[hour] = 0;
        }
        hourlyAnalysis[hour]++;
    }
    
    console.log('📊 Opportunità per ora del giorno:');
    for (let hour = 0; hour < 24; hour++) {
        const count = hourlyAnalysis[hour] || 0;
        const percentage = (count / opportunities.length * 100).toFixed(1);
        const bar = '█'.repeat(Math.floor(percentage / 5));
        console.log(`   ${hour.toString().padStart(2, '0')}:00 - ${count} (${percentage}%) ${bar}`);
    }
    console.log('');
    
    // Analisi profittabilità
    console.log('💰 === ANALISI PROFITTABILITÀ ===\n');
    
    const profitableOpportunities = opportunities.filter(opp => {
        // Calcola profitto simulato per trade di $10k
        const tradeAmount = 10000;
        const profit = tradeAmount * (opp.spread / 100);
        const costs = 0.68; // Costi infrastruttura + gas Polygon
        return profit > costs;
    });
    
    console.log(`✅ Opportunità profittevoli: ${profitableOpportunities.length}/${opportunities.length} (${(profitableOpportunities.length / opportunities.length * 100).toFixed(1)}%)`);
    
    if (profitableOpportunities.length > 0) {
        const totalProfit = profitableOpportunities.reduce((sum, opp) => {
            const tradeAmount = 10000;
            const profit = tradeAmount * (opp.spread / 100);
            const costs = 0.68;
            return sum + (profit - costs);
        }, 0);
        
        console.log(`💵 Profitto totale stimato: $${totalProfit.toFixed(2)}`);
        console.log(`📊 Profitto medio per opportunità: $${(totalProfit / profitableOpportunities.length).toFixed(2)}`);
    }
    
    return {
        totalOpportunities: opportunities.length,
        profitableOpportunities: profitableOpportunities.length,
        pairAnalysis,
        hourlyAnalysis
    };
}

// Genera report dettagliato
function generateDetailedReport(analysis, opportunities) {
    console.log('\n📋 === REPORT DETTAGLIATO ===\n');
    
    // Trova le migliori opportunità
    const sortedOpportunities = opportunities.sort((a, b) => b.spread - a.spread);
    const topOpportunities = sortedOpportunities.slice(0, 10);
    
    console.log('🏆 TOP 10 OPPORTUNITÀ:');
    for (let i = 0; i < topOpportunities.length; i++) {
        const opp = topOpportunities[i];
        const time = new Date(opp.timestamp).toLocaleString();
        console.log(`   ${i + 1}. ${opp.pair} - ${opp.spread.toFixed(3)}% (${time})`);
    }
    console.log('');
    
    // Statistiche generali
    console.log('📊 STATISTICHE GENERALI:');
    console.log(`   • Periodo analizzato: ${ANALYSIS_PERIOD} ore`);
    console.log(`   • Cicli di monitoraggio: ${TOTAL_CYCLES.toLocaleString()}`);
    console.log(`   • Opportunità trovate: ${analysis.totalOpportunities}`);
    console.log(`   • Opportunità profittevoli: ${analysis.profitableOpportunities}`);
    console.log(`   • Tasso di successo: ${(analysis.profitableOpportunities / analysis.totalOpportunities * 100).toFixed(1)}%`);
    console.log(`   • Frequenza media: ${(analysis.totalOpportunities / ANALYSIS_PERIOD).toFixed(2)} opportunità/ora`);
    
    // Salva report su file
    const reportData = {
        timestamp: new Date().toISOString(),
        analysisPeriod: ANALYSIS_PERIOD,
        totalCycles: TOTAL_CYCLES,
        opportunities: analysis.totalOpportunities,
        profitableOpportunities: analysis.profitableOpportunities,
        successRate: (analysis.profitableOpportunities / analysis.totalOpportunities * 100).toFixed(1),
        averageFrequency: (analysis.totalOpportunities / ANALYSIS_PERIOD).toFixed(2),
        pairAnalysis: analysis.pairAnalysis,
        hourlyAnalysis: analysis.hourlyAnalysis,
        topOpportunities: topOpportunities.slice(0, 5)
    };
    
    const reportPath = path.join(__dirname, '../reports/arbitrage-analysis.json');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Report salvato in: ${reportPath}`);
}

// Funzione principale
function runAnalysis() {
    console.log('🚀 Avvio analisi opportunità arbitraggio...\n');
    
    // Genera dati storici
    const opportunities = generateHistoricalPriceData();
    
    // Analizza opportunità
    const analysis = analyzeOpportunities(opportunities);
    
    // Genera report solo se ci sono opportunità
    if (analysis) {
        generateDetailedReport(analysis, opportunities);
    }
    
    console.log('\n✅ Analisi completata!');
}

// Esegui analisi
try {
    runAnalysis();
} catch (error) {
    console.error('❌ Errore durante analisi:', error.message);
} 