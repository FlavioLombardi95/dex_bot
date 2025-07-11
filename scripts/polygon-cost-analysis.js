const { ethers } = require('ethers');
const { config } = require('../bot/config');

console.log('💰 === ANALISI COSTI POLYGON (L2) ===\n');

// === COSTI DI TRANSACTION POLYGON ===
const GAS_LIMIT = 500000;
const GAS_PRICE = 30000000000; // 30 gwei (stesso valore ma MATIC costa meno)
const FLASH_LOAN_FEE = 0.0009; // 0.09% Balancer
const MATIC_PRICE_USD = 0.85; // Prezzo MATIC in USD (vs ETH $2000)

const gasCostMATIC = (GAS_LIMIT * GAS_PRICE) / 1e18;
const gasCostUSD = gasCostMATIC * MATIC_PRICE_USD;

console.log('📊 === COSTI DI TRANSACTION POLYGON ===');
console.log(`Gas Limit: ${GAS_LIMIT.toLocaleString()}`);
console.log(`Gas Price: ${GAS_PRICE / 1e9} gwei`);
console.log(`Gas Cost: ${gasCostMATIC} MATIC ($${gasCostUSD.toFixed(2)})`);
console.log(`💡 Vantaggio Polygon: ${(30 / gasCostUSD).toFixed(0)}x più economico di Ethereum!`);
console.log('');

// === COSTI INFRASTRUTTURA (stessi di prima) ===
const INFRASTRUCTURE_COSTS = {
    server: { monthly: 50, daily: 50 / 30 },
    monitoring: { monthly: 20, daily: 20 / 30 },
    electricity: { monthly: 30, daily: 30 / 30 },
    internet: { monthly: 40, daily: 40 / 30 }
};

const totalInfrastructureDaily = Object.values(INFRASTRUCTURE_COSTS).reduce((sum, cost) => sum + cost.daily, 0);

// === COSTI OPERATIVI (stessi di prima) ===
const OPERATIONAL_COSTS = {
    maintenance: { monthly: 100, daily: 100 / 30 },
    development: { monthly: 200, daily: 200 / 30 },
    riskManagement: { monthly: 50, daily: 50 / 30 }
};

const totalOperationalDaily = Object.values(OPERATIONAL_COSTS).reduce((sum, cost) => sum + cost.daily, 0);
const totalDailyCosts = totalInfrastructureDaily + totalOperationalDaily;
const costPerTransaction = totalDailyCosts / 24; // 24 transazioni al giorno

console.log('🏗️ === COSTI INFRASTRUTTURA (Mensili) ===');
console.log(`Server Cloud: $${INFRASTRUCTURE_COSTS.server.monthly}`);
console.log(`Monitoraggio: $${INFRASTRUCTURE_COSTS.monitoring.monthly}`);
console.log(`Elettricità: $${INFRASTRUCTURE_COSTS.electricity.monthly}`);
console.log(`Internet: $${INFRASTRUCTURE_COSTS.internet.monthly}`);
console.log(`📊 Totale giornaliero: $${totalInfrastructureDaily.toFixed(2)}`);
console.log('');

console.log('⚙️ === COSTI OPERATIVI (Mensili) ===');
console.log(`Manutenzione: $${OPERATIONAL_COSTS.maintenance.monthly}`);
console.log(`Sviluppo: $${OPERATIONAL_COSTS.development.monthly}`);
console.log(`Gestione Rischi: $${OPERATIONAL_COSTS.riskManagement.monthly}`);
console.log(`📊 Totale giornaliero: $${totalOperationalDaily.toFixed(2)}`);
console.log('');

console.log('💸 === COSTI TOTALI GIORNALIERI ===');
console.log(`Infrastruttura: $${totalInfrastructureDaily.toFixed(2)}`);
console.log(`Operativi: $${totalOperationalDaily.toFixed(2)}`);
console.log(`📊 TOTALE GIORNALIERO: $${totalDailyCosts.toFixed(2)}`);
console.log(`📊 Costo per transazione: $${costPerTransaction.toFixed(2)}`);
console.log('');

// === ANALISI PROFITTABILITÀ POLYGON ===
console.log('📈 === ANALISI PROFITTABILITÀ POLYGON ===\n');

const tradeAmounts = [
    { amount: 1000, description: '1,000 USDC' },
    { amount: 5000, description: '5,000 USDC' },
    { amount: 10000, description: '10,000 USDC' },
    { amount: 25000, description: '25,000 USDC' },
    { amount: 50000, description: '50,000 USDC' },
    { amount: 100000, description: '100,000 USDC' }
];

for (const trade of tradeAmounts) {
    console.log(`🎯 Trade Size: ${trade.description}`);
    
    // Costi per transazione su Polygon
    const flashLoanFeeUSD = trade.amount * FLASH_LOAN_FEE;
    const totalTransactionCosts = gasCostUSD + flashLoanFeeUSD + costPerTransaction;
    
    console.log(`   💸 Gas (Polygon): $${gasCostUSD.toFixed(2)}`);
    console.log(`   💸 Flash Loan: $${flashLoanFeeUSD.toFixed(2)}`);
    console.log(`   💸 Infrastruttura: $${costPerTransaction.toFixed(2)}`);
    console.log(`   💸 TOTALE: $${totalTransactionCosts.toFixed(2)}`);
    
    // Analizza diversi spread
    const spreads = [0.1, 0.2, 0.3, 0.5, 1.0, 2.0]; // Percentuali
    
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

// === CALCOLO SOGLIA MINIMA POLYGON ===
console.log('🎯 === SOGLIA MINIMA GARANTITA POLYGON ===\n');

const targetTradeSize = 10000; // $10k come riferimento
const flashLoanFeeTarget = targetTradeSize * FLASH_LOAN_FEE;
const totalCostsTarget = gasCostUSD + flashLoanFeeTarget + costPerTransaction;
const minSpreadRequired = (totalCostsTarget / targetTradeSize) * 100;

console.log(`📊 Per trade di $${targetTradeSize.toLocaleString()} su Polygon:`);
console.log(`   💸 Gas: $${gasCostUSD.toFixed(2)}`);
console.log(`   💸 Flash Loan: $${flashLoanFeeTarget.toFixed(2)}`);
console.log(`   💸 Infrastruttura: $${costPerTransaction.toFixed(2)}`);
console.log(`   💸 TOTALE: $${totalCostsTarget.toFixed(2)}`);
console.log(`🎯 SPREAD MINIMO GARANTITO: ${minSpreadRequired.toFixed(3)}%`);
console.log('');

// === CONFRONTO ETHEREUM vs POLYGON ===
console.log('🔄 === CONFRONTO ETHEREUM vs POLYGON ===\n');

const ethGasCost = 30; // $30 su Ethereum
const polygonGasCost = gasCostUSD; // $0.03 su Polygon

console.log(`Ethereum Gas Cost: $${ethGasCost}`);
console.log(`Polygon Gas Cost: $${polygonGasCost.toFixed(2)}`);
console.log(`💡 Risparmio: ${(ethGasCost / polygonGasCost).toFixed(0)}x più economico!`);
console.log('');

// === RACCOMANDAZIONI POLYGON ===
console.log('💡 === RACCOMANDAZIONI POLYGON ===');
console.log(`• Soglia minima consigliata: ${Math.max(minSpreadRequired, 0.2).toFixed(2)}%`);
console.log('• Per trade < $5k: Spread minimo 0.8%');
console.log('• Per trade $5k-$25k: Spread minimo 0.4%');
console.log('• Per trade > $25k: Spread minimo 0.2%');
console.log('• Vantaggio Polygon: Gas cost 1000x più bassi');
console.log('• Più opportunità profittevoli su L2');
console.log('• Monitora liquidità su Polygon');

// === CONFIGURAZIONE OTTIMALE POLYGON ===
const optimalThreshold = Math.max(minSpreadRequired, 0.2);
console.log(`\n⚙️ CONFIGURAZIONE OTTIMALE POLYGON:`);
console.log(`MIN_PROFIT_THRESHOLD=${optimalThreshold.toFixed(3)}`);
console.log(`MIN_TRADE_SIZE=${targetTradeSize}`);
console.log(`MONITORING_INTERVAL=${config.arbitrage.monitoringInterval}`);
console.log(`NETWORK=polygon`);
console.log(`CHAIN_ID=137`); 