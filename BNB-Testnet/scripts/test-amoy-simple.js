const { ethers } = require('ethers');
const { config, loadNetworkConfig } = require('../bot/config');

async function testAmoyConfiguration() {
    console.log('🧪 === TEST CONFIGURAZIONE AMOY SEMPLIFICATO ===\n');
    
    try {
        // Carica configurazione Amoy
        loadNetworkConfig('amoy');
        console.log('✅ Configurazione Amoy caricata');
        console.log(`📍 Network: ${config.network.name} (Chain ID: ${config.network.chainId})`);
        console.log(`🔗 RPC: ${config.network.rpcUrl}\n`);
        
        // Test connessione RPC
        console.log('🌐 Test connessione RPC...');
        const provider = new ethers.providers.JsonRpcProvider(config.network.rpcUrl);
        const network = await provider.getNetwork();
        console.log(`✅ Connesso a: ${network.name || 'Unknown'} (Chain ID: ${network.chainId})`);
        
        // Test wallet
        console.log('\n💰 Test wallet...');
        const wallet = new ethers.Wallet(config.wallet.privateKey, provider);
        const balance = await wallet.getBalance();
        console.log(`📍 Indirizzo: ${wallet.address}`);
        console.log(`💰 Bilancio: ${ethers.utils.formatEther(balance)} POL`);
        
        // Test token configurati
        console.log('\n🪙 Token configurati per Amoy:');
        Object.entries(config.tokens).forEach(([symbol, token]) => {
            console.log(`  ${symbol}: ${token.address} (${token.decimals} decimals)`);
        });
        
        // Test coppie configurate
        console.log('\n🔄 Coppie di trading configurate:');
        config.tradingPairs.forEach((pair, index) => {
            console.log(`  ${index + 1}. ${pair.tokenA}/${pair.tokenB}`);
        });
        
        // Test router DEX
        console.log('\n🏦 Router DEX configurati:');
        console.log(`  Uniswap: ${config.dexRouters.uniswap}`);
        console.log(`  SushiSwap: ${config.dexRouters.sushiswap}`);
        
        // Test parametri arbitraggio
        console.log('\n⚙️ Parametri arbitraggio:');
        console.log(`  Soglia profitto minimo: ${config.arbitrage.minProfitThreshold * 100}%`);
        console.log(`  Slippage massimo: ${config.arbitrage.maxSlippage * 100}%`);
        console.log(`  Gas limit: ${config.arbitrage.gasLimit}`);
        console.log(`  Intervallo monitoraggio: ${config.arbitrage.monitoringInterval}ms`);
        
        // Test DRY_RUN
        console.log('\n🛡️ Modalità sicurezza:');
        console.log(`  DRY_RUN: ${process.env.DRY_RUN}`);
        console.log(`  Log Level: ${process.env.LOG_LEVEL}`);
        
        console.log('\n🎉 === CONFIGURAZIONE AMOY FUNZIONANTE ===');
        console.log('✅ Tutti i test di base completati con successo!');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ Errore durante test:', error.message);
        return false;
    }
}

// Esegui test se chiamato direttamente
if (require.main === module) {
    testAmoyConfiguration();
}

module.exports = { testAmoyConfiguration }; 