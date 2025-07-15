const { ethers } = require('ethers');
const config = require('./core/config');

async function testRpcConnection() {
    console.log('🔍 TEST CONNESSIONE RPC');
    console.log('========================\n');

    const networkConfig = config.getNetworkConfig()[config.getCurrentNetwork()];
    console.log(`🌐 Rete: ${networkConfig.name} (Chain ID: ${networkConfig.chainId})`);
    console.log(`📡 Endpoint RPC disponibili: ${networkConfig.rpcUrls.length}\n`);

    const results = [];

    for (let i = 0; i < networkConfig.rpcUrls.length; i++) {
        const url = networkConfig.rpcUrls[i];
        console.log(`🧪 Test ${i + 1}/${networkConfig.rpcUrls.length}: ${url}`);
        
        try {
            const provider = new ethers.providers.JsonRpcProvider(url);
            
            // Test 1: Connessione base
            const startTime = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const responseTime = Date.now() - startTime;
            
            // Test 2: Network info
            const network = await provider.getNetwork();
            
            // Test 3: Gas price
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
            
            console.log(`   ✅ Connessione OK - ${responseTime}ms - Block: ${blockNumber}`);
            
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

    // Risultati finali
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
        console.log('❌ Nessun endpoint funzionante trovato!');
        console.log('🔧 Possibili soluzioni:');
        console.log('   1. Verificare connessione internet');
        console.log('   2. Provare endpoint alternativi');
        console.log('   3. Usare provider esterni (Alchemy, Infura)');
    } else if (successful.length < results.length) {
        console.log('⚠️ Alcuni endpoint non funzionano');
        console.log('✅ Il sistema userà automaticamente quelli funzionanti');
    } else {
        console.log('✅ Tutti gli endpoint funzionano correttamente');
    }

    return {
        successful: successful.length,
        failed: failed.length,
        bestEndpoint: successful[0]?.url || null
    };
}

// Test anche endpoint alternativi
async function testAlternativeEndpoints() {
    console.log('\n🔍 TEST ENDPOINT ALTERNATIVI');
    console.log('=============================\n');

    const alternativeEndpoints = [
        'https://bsc-testnet.public.blastapi.io',
        'https://bsc-testnet.publicnode.com',
        'https://bsc-testnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3',
        'https://data-seed-prebsc-1-s3.binance.org:8545',
        'https://data-seed-prebsc-2-s3.binance.org:8545'
    ];

    const results = [];

    for (const url of alternativeEndpoints) {
        console.log(`🧪 Test alternativo: ${url}`);
        
        try {
            const provider = new ethers.providers.JsonRpcProvider(url);
            const startTime = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const responseTime = Date.now() - startTime;
            
            results.push({
                url,
                status: '✅ SUCCESS',
                responseTime: `${responseTime}ms`,
                blockNumber
            });
            
            console.log(`   ✅ OK - ${responseTime}ms - Block: ${blockNumber}`);
            
        } catch (error) {
            results.push({
                url,
                status: '❌ FAILED',
                error: error.message
            });
            
            console.log(`   ❌ Errore: ${error.message}`);
        }
    }

    const successful = results.filter(r => r.status === '✅ SUCCESS');
    
    if (successful.length > 0) {
        console.log('\n🎯 ENDPOINT ALTERNATIVI FUNZIONANTI:');
        successful
            .sort((a, b) => parseInt(a.responseTime) - parseInt(b.responseTime))
            .forEach(result => {
                console.log(`• ${result.url} (${result.responseTime})`);
            });
    }

    return successful;
}

// Esegui test
async function main() {
    try {
        const mainResults = await testRpcConnection();
        const alternativeResults = await testAlternativeEndpoints();
        
        console.log('\n🎯 RACCOMANDAZIONE FINALE:');
        if (mainResults.bestEndpoint) {
            console.log(`✅ Usa endpoint principale: ${mainResults.bestEndpoint}`);
        } else if (alternativeResults.length > 0) {
            console.log(`✅ Usa endpoint alternativo: ${alternativeResults[0].url}`);
        } else {
            console.log('❌ Nessun endpoint funzionante trovato');
        }
        
    } catch (error) {
        console.error('❌ Errore durante il test:', error.message);
    }
}

if (require.main === module) {
    main();
}

module.exports = { testRpcConnection, testAlternativeEndpoints }; 