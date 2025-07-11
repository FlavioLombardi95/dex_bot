#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 CRYPTO ARBITRAGE BOT - AVVIO');
console.log('================================');

// Verifica che il file .env esista
if (!fs.existsSync('.env')) {
    console.error('❌ File .env non trovato!');
    console.log('📝 Copia .env.template in .env e configura le tue variabili:');
    console.log('   cp .env.template .env');
    console.log('   nano .env');
    process.exit(1);
}

// Carica le variabili d'ambiente
require('dotenv').config();

// Verifica configurazione minima
const requiredVars = ['PRIVATE_KEY', 'RPC_URL'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Variabili d\'ambiente mancanti:');
    missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
    });
    console.log('📝 Configura le variabili nel file .env');
    process.exit(1);
}

// Verifica che la directory logs esista
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('📁 Directory logs creata');
}

// Verifica che il contratto sia stato deployato
if (!process.env.ARBITRAGE_CONTRACT_ADDRESS) {
    console.warn('⚠️ Contratto non deployato!');
    console.log('📝 Per deployare il contratto esegui:');
    console.log('   npm run deploy');
    console.log('🔧 Oppure avvia in modalità solo-monitoraggio...');
}

console.log('✅ Configurazione verificata');
console.log('🎯 Avvio del bot...');
console.log('');

// Avvia il bot principale
try {
    require('./bot/index.js');
} catch (error) {
    console.error('❌ Errore durante l\'avvio del bot:');
    console.error(error.message);
    console.error('');
    console.error('🔧 Verifica:');
    console.error('1. Che tutte le dipendenze siano installate: npm install');
    console.error('2. Che il file .env sia configurato correttamente');
    console.error('3. Che la connessione RPC funzioni');
    console.error('4. Che il contratto sia deployato (se necessario)');
    process.exit(1);
} 