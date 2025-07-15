const { ethers } = require('ethers');

async function quickTest() {
    console.log('🚀 TEST RAPIDO SISTEMA');
    console.log('=======================\n');

    // Test 1: Connessione RPC
    console.log('1️⃣ Test Connessione RPC...');
    const rpcUrl = 'https://bsc-testnet.public.blastapi.io';
    
    try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const blockNumber = await provider.getBlockNumber();
        const network = await provider.getNetwork();
        
        console.log(`   ✅ RPC OK - Block: ${blockNumber} - Chain: ${network.chainId}`);
    } catch (error) {
        console.log(`   ❌ RPC Error: ${error.message}`);
        return false;
    }

    // Test 2: Scanner triangolare
    console.log('\n2️⃣ Test Scanner Triangolare...');
    try {
        const TriangularScanner = require('./scanners/triangular-scanner');
        console.log('   ✅ Scanner caricato correttamente');
    } catch (error) {
        console.log(`   ❌ Scanner Error: ${error.message}`);
        return false;
    }

    // Test 3: Monitor parallelo
    console.log('\n3️⃣ Test Monitor Parallelo...');
    try {
        const fs = require('fs');
        if (fs.existsSync('./parallel-monitor.js')) {
            console.log('   ✅ File parallel-monitor.js trovato');
        } else {
            console.log('   ❌ File parallel-monitor.js mancante');
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Monitor Error: ${error.message}`);
        return false;
    }

    // Test 4: Dipendenze
    console.log('\n4️⃣ Test Dipendenze...');
    try {
        require('ethers');
        require('dotenv');
        console.log('   ✅ Dipendenze principali OK');
    } catch (error) {
        console.log(`   ❌ Dipendenze Error: ${error.message}`);
        return false;
    }

    console.log('\n✅ TUTTI I TEST SUPERATI!');
    console.log('🎯 Sistema pronto per l\'uso');
    
    return true;
}

// Test specifico RPC
async function testRpcOnly() {
    console.log('🔍 TEST RPC SOLO');
    console.log('================\n');

    const endpoints = [
        'https://bsc-testnet.public.blastapi.io',
        'https://bsc-testnet.publicnode.com',
        'https://bsc-testnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3'
    ];

    for (const url of endpoints) {
        console.log(`🧪 Test: ${url}`);
        
        try {
            const provider = new ethers.providers.JsonRpcProvider(url);
            const startTime = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const responseTime = Date.now() - startTime;
            
            console.log(`   ✅ OK - ${responseTime}ms - Block: ${blockNumber}`);
            return url; // Primo endpoint funzionante
            
        } catch (error) {
            console.log(`   ❌ Errore: ${error.message}`);
        }
    }
    
    return null;
}

// Test scanner individuale
async function testScanner() {
    console.log('🔍 TEST SCANNER INDIVIDUALE');
    console.log('===========================\n');

    try {
        const TriangularScanner = require('./scanners/triangular-scanner');
        const scanner = new TriangularScanner();
        
        console.log('✅ Scanner istanziato correttamente');
        
        // Test breve (5 secondi)
        console.log('🚀 Avvio test breve (5 secondi)...');
        scanner.start();
        
        setTimeout(() => {
            scanner.stop();
            console.log('⏹️ Test completato');
        }, 5000);
        
    } catch (error) {
        console.log(`❌ Errore scanner: ${error.message}`);
    }
}

// Menu principale
async function main() {
    const args = process.argv.slice(2);
    
    switch (args[0]) {
        case 'rpc':
            await testRpcOnly();
            break;
        case 'scanner':
            await testScanner();
            break;
        default:
            await quickTest();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { quickTest, testRpcOnly, testScanner }; 