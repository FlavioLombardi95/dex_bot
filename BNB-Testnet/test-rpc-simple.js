const { ethers } = require('ethers');

async function testRpcEndpoints() {
    console.log('🔍 TEST CONNESSIONE RPC SEMPLIFICATO');
    console.log('=====================================\n');

    const endpoints = [
        // Endpoint ufficiali BSC Testnet
        'https://data-seed-prebsc-1-s1.binance.org:8545',
        'https://data-seed-prebsc-2-s1.binance.org:8545',
        'https://data-seed-prebsc-1-s2.binance.org:8545',
        'https://data-seed-prebsc-2-s2.binance.org:8545',
        'https://data-seed-prebsc-1-s3.binance.org:8545',
        'https://data-seed-prebsc-2-s3.binance.org:8545',
        
        // Endpoint alternativi
        'https://bsc-testnet.public.blastapi.io',
        'https://bsc-testnet.publicnode.com',
        'https://bsc-testnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3',
        'https://bsc-testnet.blockpi.network/v1/rpc/public'
    ];

    const results = [];

    for (let i = 0; i < endpoints.length; i++) {
        const url = endpoints[i];
        console.log(`🧪 Test ${i + 1}/${endpoints.length}: ${url}`);
        
        try {
            const provider = new ethers.providers.JsonRpcProvider(url);
            
            // Test connessione
            const startTime = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const responseTime = Date.now() - startTime;
            
            // Test network
            const network = await provider.getNetwork();
            
            // Test gas price
            const gasPrice = await provider.getGasPrice();
            
            results.push({
                url,
                index: i,
                status: '✅ SUCCESS',
                responseTime: `${responseTime}ms`,
                blockNumber,
                chainId: network.chainId,
                gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei') + ' gwei'
            });
            
            console.log(`   ✅ OK - ${responseTime}ms - Block: ${blockNumber} - Chain: ${network.chainId}`);
            
        } catch (error) {
            results.push({
                url,
                index: i,
                status: '❌ FAILED',
                error: error.message,
                responseTime: 'N/A'
            });
            
            console.log(`   ❌ Errore: ${error.message}`);
        }
        
        console.log('');
    }

    // Analisi risultati
    console.log('📊 RISULTATI FINALI');
    console.log('===================');
    
    const successful = results.filter(r => r.status === '✅ SUCCESS');
    const failed = results.filter(r => r.status === '❌ FAILED');
    
    console.log(`✅ Connessioni riuscite: ${successful.length}/${results.length}`);
    console.log(`❌ Connessioni fallite: ${failed.length}/${results.length}\n`);
    
    if (successful.length > 0) {
        console.log('🏆 MIGLIORI ENDPOINT:');
        successful
            .sort((a, b) => parseInt(a.responseTime) - parseInt(b.responseTime))
            .forEach((result, index) => {
                console.log(`${index + 1}. ${result.url}`);
                console.log(`   ⚡ Velocità: ${result.responseTime}`);
                console.log(`   🔗 Chain ID: ${result.chainId}`);
                console.log(`   ⛽ Gas Price: ${result.gasPrice}`);
                console.log(`   📦 Block: ${result.blockNumber}`);
                console.log('');
            });
    }
    
    if (failed.length > 0) {
        console.log('❌ ENDPOINT FALLITI:');
        failed.forEach(result => {
            console.log(`• ${result.url}`);
            console.log(`  Errore: ${result.error}`);
        });
    }

    // Raccomandazioni
    console.log('\n💡 RACCOMANDAZIONI:');
    if (successful.length === 0) {
        console.log('❌ Nessun endpoint funzionante!');
        console.log('🔧 Possibili cause:');
        console.log('   • Problemi di rete');
        console.log('   • Firewall/Proxy');
        console.log('   • Endpoint temporaneamente offline');
    } else if (successful.length < results.length) {
        console.log('⚠️ Alcuni endpoint non funzionano');
        console.log('✅ Il sistema userà quelli funzionanti');
    } else {
        console.log('✅ Tutti gli endpoint funzionano');
    }

    // Configurazione ottimale
    if (successful.length > 0) {
        const best = successful[0];
        console.log('\n🎯 CONFIGURAZIONE OTTIMALE:');
        console.log(`📡 Endpoint principale: ${best.url}`);
        console.log(`⚡ Velocità: ${best.responseTime}`);
        console.log(`🔗 Chain ID: ${best.chainId}`);
        
        // Suggerimento per .env
        console.log('\n📝 Aggiungi al file .env:');
        console.log(`RPC_URL=${best.url}`);
        console.log(`CHAIN_ID=${best.chainId}`);
    }

    return {
        successful: successful.length,
        failed: failed.length,
        bestEndpoint: successful[0]?.url || null,
        allSuccessful: successful
    };
}

// Test specifico per un endpoint
async function testSpecificEndpoint(url) {
    console.log(`🔍 Test specifico: ${url}`);
    
    try {
        const provider = new ethers.providers.JsonRpcProvider(url);
        
        console.log('📡 Testando connessione...');
        const blockNumber = await provider.getBlockNumber();
        console.log(`✅ Block number: ${blockNumber}`);
        
        console.log('🌐 Testando network...');
        const network = await provider.getNetwork();
        console.log(`✅ Chain ID: ${network.chainId}`);
        
        console.log('⛽ Testando gas price...');
        const gasPrice = await provider.getGasPrice();
        console.log(`✅ Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
        
        console.log('✅ Endpoint funzionante!');
        return true;
        
    } catch (error) {
        console.log(`❌ Errore: ${error.message}`);
        return false;
    }
}

// Esegui test
async function main() {
    try {
        const results = await testRpcEndpoints();
        
        if (results.bestEndpoint) {
            console.log('\n🚀 TEST ENDPOINT MIGLIORE:');
            await testSpecificEndpoint(results.bestEndpoint);
        }
        
    } catch (error) {
        console.error('❌ Errore durante il test:', error.message);
    }
}

if (require.main === module) {
    main();
}

module.exports = { testRpcEndpoints, testSpecificEndpoint }; 