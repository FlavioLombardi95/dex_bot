const { ethers } = require('ethers');
const { config } = require('../bot/config');

console.log('💰 === ANALISI COMPLETA COSTI BOT ARBITRAGGIO ===\n');

// === COSTI DI TRANSACTION ===
const GAS_LIMIT = 500000;
const GAS_PRICE = 30000000000; // 30 gwei
const FLASH_LOAN_FEE = 0.0009; // 0.09% Balancer
const ETH_PRICE_USD = 2000;

const gasCostETH = (GAS_LIMIT * GAS_PRICE) / 1e18;
const gasCostUSD = gasCostETH * ETH_PRICE_USD;

console.log('📊 === COSTI DI TRANSACTION ===');
console.log(`Gas Cost: $${gasCostUSD.toFixed(2)} per transazione`);
console.log('');

// === COSTI INFRASTRUTTURA ===
const INFRASTRUCTURE_COSTS = {
    server: {
        monthly: 50, // Server cloud
        daily: 50 / 30,
        perHour: 50 / (30 * 24)
    },
    monitoring: {
        monthly: 20, // Servizi di monitoraggio
        daily: 20 / 30,
        perHour: 20 / (30 * 24)
    },
    electricity: {
        monthly: 30, // Consumo elettrico
        daily: 30 / 30,
        perHour: 30 / (30 * 24)
    },
    internet: {
        monthly: 40, // Connessione dedicata
        daily: 40 / 30,
        perHour: 40 / (30 * 24)
    }
};

const totalInfrastructureDaily = Object.values(INFRASTRUCTURE_COSTS).reduce((sum, cost) => sum + cost.daily, 0);
const totalInfrastructureHourly = Object.values(INFRASTRUCTURE_COSTS).reduce((sum, cost) => sum + cost.perHour, 0);

console.log('🏗️ === COSTI INFRASTRUTTURA (Mensili) ===');
console.log(`Server Cloud: $${INFRASTRUCTURE_COSTS.server.monthly}`);
console.log(`Monitoraggio: $${INFRASTRUCTURE_COSTS.monitoring.monthly}`);
console.log(`Elettricità: $${INFRASTRUCTURE_COSTS.electricity.monthly}`);
console.log(`Internet: $${INFRASTRUCTURE_COSTS.internet.monthly}`);
console.log(`📊 Totale mensile: $${Object.values(INFRASTRUCTURE_COSTS).reduce((sum, cost) => sum + cost.monthly, 0)}`);
console.log(`📊 Totale giornaliero: $${totalInfrastructureDaily.toFixed(2)}`);
console.log(`📊 Totale orario: $${totalInfrastructureHourly.toFixed(4)}`);
console.log('');

// === COSTI OPERATIVI ===
const OPERATIONAL_COSTS = {
    maintenance: {
        monthly: 100, // Manutenzione e aggiornamenti
        daily: 100 / 30
    },
    development: {
        monthly: 200, // Sviluppo e miglioramenti
        daily: 200 / 30
    },
    riskManagement: {
        monthly: 50, // Assicurazioni e protezioni
        daily: 50 / 30
    }
};

const totalOperationalDaily = Object.values(OPERATIONAL_COSTS).reduce((sum, cost) => sum + cost.daily, 0);

console.log('⚙️ === COSTI OPERATIVI (Mensili) ===');
console.log(`Manutenzione: $${OPERATIONAL_COSTS.maintenance.monthly}`);
console.log(`Sviluppo: $${OPERATIONAL_COSTS.development.monthly}`);
console.log(`Gestione Rischi: $${OPERATIONAL_COSTS.riskManagement.monthly}`);
console.log(`📊 Totale giornaliero: $${totalOperationalDaily.toFixed(2)}`);
console.log('');

// === COSTI TOTALI GIORNALIERI ===
const totalDailyCosts = totalInfrastructureDaily + totalOperationalDaily;
const totalHourlyCosts = totalInfrastructureHourly;

console.log('💸 === COSTI TOTALI GIORNALIERI ===');
console.log(`Infrastruttura: $${totalInfrastructureDaily.toFixed(2)}`);
console.log(`Operativi: $${totalOperationalDaily.toFixed(2)}`);
console.log(`📊 TOTALE GIORNALIERO: $${totalDailyCosts.toFixed(2)}`);
console.log(`📊 TOTALE ORARIO: $${totalHourlyCosts.toFixed(4)}`);
console.log('');

// === ANALISI PROFITTABILITÀ CON COSTI COMPLETI ===
console.log('📈 === ANALISI PROFITTABILITÀ CON COSTI COMPLETI ===\n');

const tradeAmounts = [
    { amount: 1000, description: '1,000 USDC' },
    { amount: 5000, description: '5,000 USDC' },
    { amount: 10000, description: '10,000 USDC' },
    { amount: 25000, description: '25,000 USDC' },
    { amount: 50000, description: '50,000 USDC' },
    { amount: 100000, description: '100,000 USDC' }
];

// Calcola quante transazioni al giorno per coprire i costi
const transactionsPerDay = 24; // Bot che monitora ogni ora
const costPerTransaction = totalDailyCosts / transactionsPerDay;

console.log(`🔄 Transazioni giornaliere: ${transactionsPerDay}`);
console.log(`💰 Costo per transazione: $${costPerTransaction.toFixed(2)}`);
console.log('');

for (const trade of tradeAmounts) {
    console.log(`🎯 Trade Size: ${trade.description}`);
    
    // Costi per transazione
    const flashLoanFeeUSD = trade.amount * FLASH_LOAN_FEE;
    const totalTransactionCosts = gasCostUSD + flashLoanFeeUSD + costPerTransaction;
    
    console.log(`   💸 Gas: $${gasCostUSD.toFixed(2)}`);
    console.log(`   💸 Flash Loan: $${flashLoanFeeUSD.toFixed(2)}`);
    console.log(`   💸 Infrastruttura: $${costPerTransaction.toFixed(2)}`);
    console.log(`   💸 TOTALE: $${totalTransactionCosts.toFixed(2)}`);
    
    // Analizza diversi spread
    const spreads = [0.1, 0.2, 0.5, 1.0, 2.0, 3.0]; // Percentuali
    
    console.log('   📊 Profittabilità per diversi spread:');
    
    for (const spread of spreads) {
        const profitUSD = trade.amount * (spread / 100);
        const netProfitUSD = profitUSD - totalTransactionCosts;
        const profitMargin = (netProfitUSD / totalTransactionCosts) * 100;
        
        const status = netProfitUSD > 0 ? '✅' : '❌';
        const marginColor = profitMargin > 100 ? '🟢' : profitMargin > 50 ? '🟡' : '🔴';
        
        console.log(`      ${spread}% spread: ${status} $${netProfitUSD.toFixed(2)} (${marginColor} ${profitMargin.toFixed(1)}% margin)`);
    }
    
    console.log('');
}

// === CALCOLO SOGLIA MINIMA GARANTITA ===
console.log('🎯 === SOGLIA MINIMA GARANTITA ===\n');

const targetTradeSize = 10000; // $10k come riferimento
const flashLoanFeeTarget = targetTradeSize * FLASH_LOAN_FEE;
const totalCostsTarget = gasCostUSD + flashLoanFeeTarget + costPerTransaction;
const minSpreadRequired = (totalCostsTarget / targetTradeSize) * 100;

console.log(`📊 Per trade di $${targetTradeSize.toLocaleString()}:`);
console.log(`   💸 Gas: $${gasCostUSD.toFixed(2)}`);
console.log(`   💸 Flash Loan: $${flashLoanFeeTarget.toFixed(2)}`);
console.log(`   💸 Infrastruttura: $${costPerTransaction.toFixed(2)}`);
console.log(`   💸 TOTALE: $${totalCostsTarget.toFixed(2)}`);
console.log(`🎯 SPREAD MINIMO GARANTITO: ${minSpreadRequired.toFixed(2)}%`);
console.log('');

// === RACCOMANDAZIONI ===
console.log('💡 === RACCOMANDAZIONI ===');
console.log(`• Soglia minima consigliata: ${Math.max(minSpreadRequired, 0.5).toFixed(2)}%`);
console.log('• Per trade < $10k: Spread minimo 1.5%');
console.log('• Per trade $10k-$50k: Spread minimo 0.8%');
console.log('• Per trade > $50k: Spread minimo 0.5%');
console.log('• Considera sempre slippage e impermanent loss');
console.log('• Monitora costi gas in tempo reale');
console.log('• Ottimizza infrastruttura per ridurre costi');

// === CONFIGURAZIONE OTTIMALE ===
const optimalThreshold = Math.max(minSpreadRequired, 0.5);
console.log(`\n⚙️ CONFIGURAZIONE OTTIMALE:`);
console.log(`MIN_PROFIT_THRESHOLD=${optimalThreshold.toFixed(3)}`);
console.log(`MIN_TRADE_SIZE=${targetTradeSize}`);
console.log(`MONITORING_INTERVAL=${config.arbitrage.monitoringInterval}`); 