#!/usr/bin/env node

/**
 * BSC Triangular Arbitrage Bot Starter
 * Simple entry point for the bot
 */

const path = require('path');
const { fork } = require('child_process');

console.log('🚀 Avvio BSC Triangular Arbitrage Bot...');
console.log('📍 Modalità: Triangular Arbitrage');
console.log('🌐 Network: BSC Testnet');

// Avvia il bot principale
const botProcess = fork(path.join(__dirname, 'bot', 'index.js'));

// Gestione eventi del processo
botProcess.on('message', (message) => {
  console.log('📨 Messaggio dal bot:', message);
});

botProcess.on('error', (error) => {
  console.error('❌ Errore nel bot:', error);
});

botProcess.on('exit', (code) => {
  console.log(`🔄 Bot terminato con codice: ${code}`);
  if (code !== 0) {
    console.log('🔄 Riavvio del bot...');
    setTimeout(() => {
      fork(path.join(__dirname, 'bot', 'index.js'));
    }, 5000);
  }
});

// Gestione chiusura pulita
process.on('SIGINT', () => {
  console.log('\n🛑 Chiusura del bot...');
  botProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminazione del bot...');
  botProcess.kill('SIGTERM');
  process.exit(0);
}); 