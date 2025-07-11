const axios = require('axios');
const { config } = require('../bot/config');
const fs = require('fs');
const path = require('path');

console.log('📊 === ANALIZZATORE DATI REALI ===\n');

// Configurazione API
const API_ENDPOINTS = {
    // Esempi di API per prezzi (da implementare con API reali)
    coingecko: 'https://api.coingecko.com/api/v3',
    binance: 'https://api.binance.com/api/v3',
    polygon: 'https://api.polygonscan.com/api'
};

// Funzione per ottenere prezzi reali (simulata per ora)
async function getRealPrices(pair) {
    try {
        // Simula chiamata API reale
        const basePrice = {
            'WMATIC/USDC': 0.85,
            'WMATIC/USDT': 0.84,
            'USDC/USDT': 1.00,
            'WMATIC/DAI': 0.83,
            'USDC/DAI': 1.00
        };
        
        // Aggiungi variazione realistica
        const variation = (Math.random() - 0.5) * 0.002; // ±0.1%
        const price = basePrice[pair] * (1 + variation);
        
        return {
            uniswap: price,
            sushiswap: price * (1 + (Math.random() - 0.5) * 0.001) // ±0.05% differenza
        };
    } catch (error) {
        console.error(`❌ Errore ottenimento prezzi per ${pair}:`, error.message);
        return null;
    }
}

// Funzione per analizzare opportunità in tempo reale
async function analyzeRealTimeOpportunities() {
    console.log('🔍 Analisi opportunità in tempo reale...\n');
    
    const pairs = ['WMATIC/USDC', 'WMATIC/USDT', 'USDC/USDT', 'WMATIC/DAI', 'USDC/DAI'];
    const opportunities = [];
    
    for (const pair of pairs) {
        console.log(`📊 Analizzando ${pair}...`);
        
        const prices = await getRealPrices(pair);
        if (!prices) continue;
        
        const spread = Math.abs(prices.uniswap - prices.sushiswap) / Math.min(prices.uniswap, prices.sushiswap) * 100;
        
        console.log(`   Uniswap: ${prices.uniswap.toFixed(6)}`);
        console.log(`   SushiSwap: ${prices.sushiswap.toFixed(6)}`);
        console.log(`   Spread: ${spread.toFixed(3)}%`);
        
        if (spread > config.arbitrage.minProfitThreshold * 100) {
            console.log(`   ✅ OPPORTUNITÀ TROVATA!`);
            opportunities.push({
                pair,
                uniswapPrice: prices.uniswap,
                sushiswapPrice: prices.sushiswap,
                spread,
                timestamp: Date.now(),
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

// Funzione per monitoraggio continuo
async function continuousMonitoring(duration = 3600000) { // 1 ora di default
    console.log(`⏱️  Avvio monitoraggio continuo per ${duration / 60000} minuti...\n`);
    
    const startTime = Date.now();
    const endTime = startTime + duration;
    const allOpportunities = [];
    let cycle = 0;
    
    while (Date.now() < endTime) {
        cycle++;
        console.log(`\n📊 Ciclo ${cycle} - ${new Date().toLocaleTimeString()}`);
        
        const opportunities = await analyzeRealTimeOpportunities();
        allOpportunities.push(...opportunities);
        
        // Mostra statistiche
        if (allOpportunities.length > 0) {
            const totalSpread = allOpportunities.reduce((sum, opp) => sum + opp.spread, 0);
            const avgSpread = totalSpread / allOpportunities.length;
            console.log(`📈 Statistiche: ${allOpportunities.length} opportunità, spread medio: ${avgSpread.toFixed(3)}%`);
        }
        
        // Attendi prima del prossimo ciclo
        await new Promise(resolve => setTimeout(resolve, config.arbitrage.monitoringInterval));
    }
    
    return allOpportunities;
}

// Funzione per salvare dati storici
function saveHistoricalData(opportunities) {
    const dataPath = path.join(__dirname, '../data/historical-opportunities.json');
    const dataDir = path.dirname(dataPath);
    
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const historicalData = {
        timestamp: new Date().toISOString(),
        totalOpportunities: opportunities.length,
        opportunities: opportunities.map(opp => ({
            ...opp,
            timestamp: new Date(opp.timestamp).toISOString()
        }))
    };
    
    fs.writeFileSync(dataPath, JSON.stringify(historicalData, null, 2));
    console.log(`💾 Dati storici salvati in: ${dataPath}`);
}

// Funzione per analizzare dati storici salvati
function analyzeHistoricalData() {
    const dataPath = path.join(__dirname, '../data/historical-opportunities.json');
    
    if (!fs.existsSync(dataPath)) {
        console.log('❌ Nessun dato storico trovato. Esegui prima il monitoraggio.');
        return;
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const opportunities = data.opportunities;
    
    console.log('📊 === ANALISI DATI STORICI ===\n');
    console.log(`📅 Periodo: ${new Date(data.timestamp).toLocaleString()}`);
    console.log(`🎯 Opportunità totali: ${opportunities.length}\n`);
    
    if (opportunities.length === 0) {
        console.log('❌ Nessuna opportunità nei dati storici');
        return;
    }
    
    // Analisi per coppia
    const pairStats = {};
    for (const opp of opportunities) {
        if (!pairStats[opp.pair]) {
            pairStats[opp.pair] = {
                count: 0,
                totalSpread: 0,
                maxSpread: 0,
                minSpread: Infinity
            };
        }
        
        pairStats[opp.pair].count++;
        pairStats[opp.pair].totalSpread += opp.spread;
        pairStats[opp.pair].maxSpread = Math.max(pairStats[opp.pair].maxSpread, opp.spread);
        pairStats[opp.pair].minSpread = Math.min(pairStats[opp.pair].minSpread, opp.spread);
    }
    
    console.log('📊 STATISTICHE PER COPPIA:');
    for (const [pair, stats] of Object.entries(pairStats)) {
        const avgSpread = stats.totalSpread / stats.count;
        console.log(`\n🎯 ${pair}:`);
        console.log(`   📊 Opportunità: ${stats.count}`);
        console.log(`   📈 Spread medio: ${avgSpread.toFixed(3)}%`);
        console.log(`   📈 Spread max: ${stats.maxSpread.toFixed(3)}%`);
        console.log(`   📉 Spread min: ${stats.minSpread.toFixed(3)}%`);
    }
    
    // Top opportunità
    const sortedOpportunities = opportunities.sort((a, b) => b.spread - a.spread);
    console.log('\n🏆 TOP 5 OPPORTUNITÀ:');
    for (let i = 0; i < Math.min(5, sortedOpportunities.length); i++) {
        const opp = sortedOpportunities[i];
        const time = new Date(opp.timestamp).toLocaleString();
        console.log(`   ${i + 1}. ${opp.pair} - ${opp.spread.toFixed(3)}% (${time})`);
    }
}

// Menu principale
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'realtime':
            console.log('🔍 Modalità tempo reale');
            const opportunities = await analyzeRealTimeOpportunities();
            console.log(`\n✅ Trovate ${opportunities.length} opportunità`);
            break;
            
        case 'monitor':
            const duration = args[1] ? parseInt(args[1]) * 60000 : 3600000; // minuti
            console.log(`⏱️  Modalità monitoraggio (${duration / 60000} minuti)`);
            const monitoredOpportunities = await continuousMonitoring(duration);
            saveHistoricalData(monitoredOpportunities);
            console.log(`\n✅ Monitoraggio completato. Trovate ${monitoredOpportunities.length} opportunità`);
            break;
            
        case 'analyze':
            console.log('📊 Modalità analisi dati storici');
            analyzeHistoricalData();
            break;
            
        default:
            console.log('📊 === ANALIZZATORE DATI REALI ===');
            console.log('Comandi disponibili:');
            console.log('  npm run real-data:realtime    - Analisi tempo reale');
            console.log('  npm run real-data:monitor     - Monitoraggio continuo (1 ora)');
            console.log('  npm run real-data:monitor 30  - Monitoraggio continuo (30 min)');
            console.log('  npm run real-data:analyze     - Analisi dati storici');
            break;
    }
}

// Esegui
main().catch(console.error); 