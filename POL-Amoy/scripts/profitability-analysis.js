const { ethers } = require('ethers');
const { config } = require('../bot/config');

console.log('💰 === ANALISI PROFITTABILITÀ ARBITRAGGIO ===\n');

// Parametri di costo
const GAS_LIMIT = 500000;
const GAS_PRICE = 30000000000; // 30 gwei
const FLASH_LOAN_FEE = 0.0009; // 0.09% Balancer
const ETH_PRICE_USD = 2000; // Prezzo ETH in USD
const MATIC_PRICE_USD = 0.85; // Prezzo MATIC in USD

// Calcola costi
const gasCostETH = (GAS_LIMIT * GAS_PRICE) / 1e18;
const gasCostUSD = gasCostETH * ETH_PRICE_USD;

console.log('📊 === COSTI DI TRANSACTION ===');
console.log(`Gas Limit: ${GAS_LIMIT.toLocaleString()}`);
console.log(`Gas Price: ${GAS_PRICE / 1e9} gwei`);
console.log(`Gas Cost: ${gasCostETH} ETH ($${gasCostUSD.toFixed(2)})`);
console.log('');

// Analizza diverse dimensioni di trade
const tradeAmounts = [
    { amount: 1000, description: '1,000 USDC' },
    { amount: 5000, description: '5,000 USDC' },
    { amount: 10000, description: '10,000 USDC' },
    { amount: 50000, description: '50,000 USDC' },
    { amount: 100000, description: '100,000 USDC' }
];

console.log('📈 === ANALISI PROFITTABILITÀ PER DIVERSE DIMENSIONI ===\n');

for (const trade of tradeAmounts) {
    console.log(`🎯 Trade Size: ${trade.description}`);
    
    // Calcola costi flash loan
    const flashLoanFeeUSD = trade.amount * FLASH_LOAN_FEE;
    
    // Costi totali
    const totalCostsUSD = gasCostUSD + flashLoanFeeUSD;
    
    console.log(`   💸 Gas Cost: $${gasCostUSD.toFixed(2)}`);
    console.log(`   💸 Flash Loan Fee: $${flashLoanFeeUSD.toFixed(2)}`);
    console.log(`   💸 Total Costs: $${totalCostsUSD.toFixed(2)}`);
    
    // Analizza diversi spread
    const spreads = [0.1, 0.2, 0.5, 1.0, 2.0]; // Percentuali
    
    console.log('   📊 Profittabilità per diversi spread:');
    
    for (const spread of spreads) {
        const profitUSD = trade.amount * (spread / 100);
        const netProfitUSD = profitUSD - totalCostsUSD;
        const profitMargin = (netProfitUSD / totalCostsUSD) * 100;
        
        const status = netProfitUSD > 0 ? '✅' : '❌';
        const marginColor = profitMargin > 50 ? '🟢' : profitMargin > 20 ? '🟡' : '🔴';
        
        console.log(`      ${spread}% spread: ${status} $${netProfitUSD.toFixed(2)} (${marginColor} ${profitMargin.toFixed(1)}% margin)`);
    }
    
    console.log('');
}

// Analisi specifica per spread 0.1%
console.log('🎯 === ANALISI SPECIFICA PER SPREAD 0.1% ===\n');

const targetSpread = 0.1;
const baseCostsUSD = gasCostUSD + (10000 * FLASH_LOAN_FEE); // Per trade di $10k
const minProfitableAmount = baseCostsUSD / (targetSpread / 100);

console.log(`📊 Spread target: ${targetSpread}%`);
console.log(`💰 Costi base: $${baseCostsUSD.toFixed(2)}`);
console.log(`📈 Importo minimo profittevole: $${minProfitableAmount.toLocaleString()}`);
console.log('');

// Raccomandazioni
console.log('💡 === RACCOMANDAZIONI ===');
console.log('• Spread < 0.5%: Richiede trade size molto grandi (>$50k)');
console.log('• Spread 0.5-1%: Profittevole con trade size moderati ($10k-$50k)');
console.log('• Spread > 1%: Profittevole anche con trade size piccoli (<$10k)');
console.log('• Considera sempre slippage e impermanent loss');
console.log('• Monitora i costi di gas in tempo reale');
console.log('• Usa flash loan solo per importi significativi');

// Calcola soglia ottimale
const optimalThreshold = (baseCostsUSD / 10000) * 100; // Per trade di $10k
console.log(`\n🎯 Soglia ottimale per trade $10k: ${optimalThreshold.toFixed(2)}%`); 