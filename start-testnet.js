#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 CRYPTO ARBITRAGE BOT - VERSIONE TESTNET');
console.log('==========================================');

// Carica configurazione testnet
const testnetEnvFile = '.env.testnet';
const regularEnvFile = '.env';

// Verifica se esiste il file di configurazione testnet
if (fs.existsSync(testnetEnvFile)) {
    console.log('📋 Caricamento configurazione testnet...');
    
    // Carica le variabili d'ambiente dal file testnet
    const testnetEnv = fs.readFileSync(testnetEnvFile, 'utf8');
    const envVars = testnetEnv.split('\n').filter(line => 
        line.trim() && !line.startsWith('#') && line.includes('=')
    );
    
    envVars.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=');
        process.env[key.trim()] = value.trim();
    });
    
    console.log('✅ Configurazione testnet caricata');
} else if (fs.existsSync(regularEnvFile)) {
    console.log('📋 Caricamento configurazione standard...');
    require('dotenv').config();
    console.log('✅ Configurazione standard caricata');
} else {
    console.error('❌ Nessun file di configurazione trovato!');
    console.log('📝 Crea uno di questi file:');
    console.log('   - .env.testnet (per configurazione testnet)');
    console.log('   - .env (per configurazione standard)');
    process.exit(1);
}

// Imposta automaticamente modalità testnet
process.env.DEV_MODE = 'true';
process.env.DRY_RUN = 'true';  // Inizia in modalità simulazione
process.env.LOG_LEVEL = 'debug';

// Verifica configurazione minima
const requiredVars = ['PRIVATE_KEY', 'RPC_URL'];
const missingVars = requiredVars.filter(varName => 
    !process.env[varName] || process.env[varName] === 'your_private_key_here'
);

if (missingVars.length > 0) {
    console.error('❌ Configurazione incompleta per testnet:');
    missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
    });
    console.log('');
    console.log('🔧 Per configurare la testnet:');
    console.log('1. Modifica il file .env.testnet');
    console.log('2. Inserisci la tua chiave privata testnet');
    console.log('3. Verifica che RPC_URL punti a Goerli');
    console.log('4. Ottieni ETH testnet da: https://goerlifaucet.com/');
    process.exit(1);
}

// Verifica che la directory logs esista
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('📁 Directory logs creata');
}

// Informazioni sulla modalità testnet
console.log('');
console.log('🧪 MODALITÀ TESTNET ATTIVA:');
console.log('============================');
console.log('• Rete:', process.env.NETWORK || 'goerli');
console.log('• Modalità sviluppo:', process.env.DEV_MODE || 'true');
console.log('• Simulazione:', process.env.DRY_RUN || 'true');
console.log('• Log level:', process.env.LOG_LEVEL || 'debug');
console.log('• Soglia profitto:', process.env.MIN_PROFIT_THRESHOLD || '0.005');
console.log('• Importo flash loan:', process.env.FLASHLOAN_AMOUNT || '100000000000000000');

// Verifica contratto deployato
if (!process.env.ARBITRAGE_CONTRACT_ADDRESS) {
    console.log('');
    console.log('⚠️  CONTRATTO NON DEPLOYATO');
    console.log('📝 Per deployare il contratto:');
    console.log('   npm run deploy');
    console.log('');
    console.log('🔧 Il bot può comunque avviarsi in modalità solo-monitoraggio');
}

// Avvertimenti per testnet
console.log('');
console.log('⚠️  AVVERTIMENTI TESTNET:');
console.log('========================');
console.log('• Usa solo fondi testnet');
console.log('• Le opportunità di arbitraggio sono rare su testnet');
console.log('• Controlla sempre i log per errori');
console.log('• Testa prima di usare mainnet');

console.log('');
console.log('🎯 Avvio del bot testnet...');
console.log('');

// Avvia il bot principale
try {
    require('./bot/index.js');
} catch (error) {
    console.error('❌ Errore durante l\'avvio del bot testnet:');
    console.error(error.message);
    console.error('');
    console.error('🔧 Checklist debug:');
    console.error('1. Verifica che tutte le dipendenze siano installate');
    console.error('2. Controlla che il file .env.testnet sia configurato');
    console.error('3. Verifica la connessione RPC');
    console.error('4. Controlla che il wallet abbia ETH testnet');
    console.error('5. Verifica che il contratto sia deployato (se necessario)');
    process.exit(1);
} 