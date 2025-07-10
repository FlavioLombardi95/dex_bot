#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 CRYPTO ARBITRAGE BOT - SETUP AUTOMATICO');
console.log('==========================================');

function runCommand(command, description) {
    console.log(`🔄 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} completato`);
    } catch (error) {
        console.error(`❌ Errore durante: ${description}`);
        console.error(error.message);
        process.exit(1);
    }
}

function createFile(filePath, content, description) {
    try {
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${description} creato: ${filePath}`);
    } catch (error) {
        console.error(`❌ Errore creando ${description}:`, error.message);
    }
}

function createDirectory(dirPath, description) {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`✅ ${description} creata: ${dirPath}`);
        } else {
            console.log(`📁 ${description} già esiste: ${dirPath}`);
        }
    } catch (error) {
        console.error(`❌ Errore creando ${description}:`, error.message);
    }
}

// 1. Verifica Node.js
console.log('🔍 Verifica Node.js...');
const nodeVersion = process.version;
console.log(`Node.js version: ${nodeVersion}`);

const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 16) {
    console.error('❌ Node.js 16+ richiesto. Versione attuale:', nodeVersion);
    process.exit(1);
}

// 2. Installa dipendenze
runCommand('npm install', 'Installazione dipendenze');

// 3. Crea directory necessarie
createDirectory('logs', 'Directory logs');
createDirectory('cache', 'Directory cache');
createDirectory('artifacts', 'Directory artifacts');

// 4. Crea file .env se non esiste
if (!fs.existsSync('.env')) {
    if (fs.existsSync('.env.template')) {
        fs.copyFileSync('.env.template', '.env');
        console.log('✅ File .env creato da template');
    } else {
        const defaultEnv = `# CRYPTO ARBITRAGE BOT - CONFIGURAZIONE
PRIVATE_KEY=your_private_key_here
RPC_URL=https://rpc.ankr.com/eth_goerli
NETWORK=goerli
CHAIN_ID=5
ARBITRAGE_CONTRACT_ADDRESS=
MIN_PROFIT_THRESHOLD=0.01
LOG_LEVEL=info
`;
        createFile('.env', defaultEnv, 'File .env');
    }
    console.log('⚠️  IMPORTANTE: Configura le tue variabili nel file .env');
}

// 5. Compila contratti
runCommand('npx hardhat compile', 'Compilazione contratti Solidity');

// 6. Test setup
console.log('🧪 Test configurazione...');
try {
    require('dotenv').config();
    console.log('✅ File .env caricato');
} catch (error) {
    console.error('❌ Errore caricamento .env:', error.message);
}

// 7. Verifica struttura progetto
const requiredFiles = [
    'contracts/Arbitrage.sol',
    'bot/index.js',
    'bot/config.js',
    'bot/monitor.js',
    'scripts/deploy.js',
    'test/test-arbitrage.js'
];

console.log('📋 Verifica struttura progetto...');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.error(`❌ File mancante: ${file}`);
    }
});

// 8. Suggerimenti finali
console.log('\n🎉 SETUP COMPLETATO!');
console.log('');
console.log('📋 PROSSIMI PASSI:');
console.log('1. Configura il file .env con la tua chiave privata');
console.log('2. Ottieni ETH di test da un faucet Goerli');
console.log('3. Deploya il contratto: npm run deploy');
console.log('4. Avvia il bot: npm start');
console.log('');
console.log('🔗 RISORSE UTILI:');
console.log('• Faucet Goerli: https://goerlifaucet.com/');
console.log('• Etherscan Goerli: https://goerli.etherscan.io/');
console.log('• Documentazione: README.md');
console.log('');
console.log('⚠️  ATTENZIONE: Usa solo testnet per sviluppo!');
console.log('💡 Monitora sempre i logs per errori'); 