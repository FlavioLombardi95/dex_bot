#!/usr/bin/env node

/**
 * 🚀 QUICK START - Sistema Monitoraggio Parallelo BNB-Testnet
 * ===========================================================
 * 
 * Script di avvio rapido per il sistema di monitoraggio parallelo
 * delle opportunità di arbitraggio in tempo reale
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class QuickStart {
    constructor() {
        this.projectRoot = __dirname;
        this.envFile = path.join(this.projectRoot, '.env');
    }
    
    /**
     * Avvio rapido del sistema
     */
    async start() {
        console.log('\n🚀 === QUICK START BNB-TESTNET ARBITRAGE MONITOR ===');
        console.log('====================================================');
        console.log('🎯 Obiettivo: Dati tempo reale + Opportunità');
        console.log('⚡ Modalità: Processi paralleli ottimizzati');
        console.log('🌐 Rete: BSC Testnet (GRATUITO)');
        console.log('💻 Sistema: Locale (NO Docker)\n');
        
        // Step 1: Verifica dipendenze
        await this.checkDependencies();
        
        // Step 2: Configura environment
        await this.setupEnvironment();
        
        // Step 3: Verifica connessione
        await this.checkConnection();
        
        // Step 4: Avvia sistema parallelo
        await this.launchParallelSystem();
    }
    
    /**
     * Verifica dipendenze del sistema
     */
    async checkDependencies() {
        console.log('🔍 Verifica dipendenze...');
        
        try {
            // Verifica Node.js
            const nodeVersion = process.version;
            console.log(`✅ Node.js: ${nodeVersion}`);
            
            // Verifica npm packages
            if (fs.existsSync(path.join(this.projectRoot, 'node_modules'))) {
                console.log('✅ Dipendenze installate');
            } else {
                console.log('📦 Installazione dipendenze...');
                execSync('npm install', { stdio: 'inherit', cwd: this.projectRoot });
                console.log('✅ Dipendenze installate');
            }
            
            // Verifica hardhat
            try {
                execSync('npx hardhat --version', { stdio: 'pipe', cwd: this.projectRoot });
                console.log('✅ Hardhat disponibile');
            } catch (error) {
                console.log('⚠️  Hardhat non trovato, installazione...');
                execSync('npm install --save-dev hardhat', { stdio: 'inherit', cwd: this.projectRoot });
            }
            
        } catch (error) {
            console.error('❌ Errore verifica dipendenze:', error.message);
            process.exit(1);
        }
    }
    
    /**
     * Configura environment
     */
    async setupEnvironment() {
        console.log('\n🔧 Configurazione environment...');
        
        // Crea .env se non esiste
        if (!fs.existsSync(this.envFile)) {
            const envContent = `# Configurazione BNB-Testnet
NETWORK=bscTestnet
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
CHAIN_ID=97

# Wallet (TESTNET ONLY - NON USARE IN MAINNET)
PRIVATE_KEY=your_private_key_here

# Parametri Ottimizzati
TRIANGULAR_SCAN_INTERVAL=2000
PRICE_CHECK_INTERVAL=3000
MIN_PROFIT_PERCENTAGE=0.1
MAX_SLIPPAGE=2.0
ENABLE_CACHING=true
CACHE_TTL_SECONDS=30

# Performance
PARALLEL_REQUESTS=5
MAX_CONCURRENT_EXECUTIONS=4
ENABLE_OPTIMIZATIONS=true

# Sicurezza
DRY_RUN=true
LOG_LEVEL=info
ENABLE_NOTIFICATIONS=false

# Monitoraggio
ENABLE_HEALTH_CHECK=true
HEALTH_CHECK_INTERVAL=30000
ENABLE_PERFORMANCE_TRACKING=true
`;
            fs.writeFileSync(this.envFile, envContent);
            console.log('✅ File .env creato');
            console.log('⚠️  IMPORTANTE: Configura PRIVATE_KEY nel file .env');
        } else {
            console.log('✅ File .env esistente');
        }
        
        // Verifica configurazione
        require('dotenv').config({ path: this.envFile });
        
        if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'your_private_key_here') {
            console.log('⚠️  ATTENZIONE: PRIVATE_KEY non configurata');
            console.log('   Modalità DRY_RUN attivata automaticamente');
            process.env.DRY_RUN = 'true';
        }
    }
    
    /**
     * Verifica connessione BSC Testnet
     */
    async checkConnection() {
        console.log('\n🌐 Verifica connessione BSC Testnet...');
        
        try {
            const { ethers } = require('ethers');
            const provider = new ethers.providers.JsonRpcProvider(
                process.env.RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545'
            );
            
            const network = await provider.getNetwork();
            console.log(`✅ Rete connessa: ${network.name} (Chain ID: ${network.chainId})`);
            
            if (network.chainId !== 97) {
                throw new Error('Rete non è BSC Testnet');
            }
            
            // Test velocità connessione
            const start = Date.now();
            await provider.getBlockNumber();
            const latency = Date.now() - start;
            console.log(`⚡ Latenza: ${latency}ms`);
            
        } catch (error) {
            console.error('❌ Errore connessione:', error.message);
            console.log('🔄 Prova con RPC alternativo...');
            
            // Prova RPC alternativo
            process.env.RPC_URL = 'https://data-seed-prebsc-2-s1.binance.org:8545';
            await this.checkConnection();
        }
    }
    
    /**
     * Avvia sistema parallelo
     */
    async launchParallelSystem() {
        console.log('\n🚀 Avvio sistema di monitoraggio parallelo...');
        
        // Crea directory logs
        if (!fs.existsSync('logs')) {
            fs.mkdirSync('logs', { recursive: true });
        }
        
        // Compila contratti se necessario
        if (!fs.existsSync('artifacts')) {
            console.log('🔨 Compilazione contratti...');
            execSync('npx hardhat compile', { stdio: 'inherit', cwd: this.projectRoot });
            console.log('✅ Contratti compilati');
        }
        
        // Mostra configurazione finale
        console.log('\n📊 === CONFIGURAZIONE SISTEMA ===');
        console.log(`🔺 Scanner Triangolare: ABILITATO`);
        console.log(`⚡ Scanner Realtime: ABILITATO`);
        console.log(`💰 Scanner Profitti: ABILITATO`);
        console.log(`🚀 Monitor Ottimizzato: ABILITATO`);
        console.log(`🔄 Intervallo scansione: ${process.env.TRIANGULAR_SCAN_INTERVAL || 2000}ms`);
        console.log(`💾 Cache abilitata: ${process.env.ENABLE_CACHING || 'true'}`);
        console.log(`🧪 Modalità DRY RUN: ${process.env.DRY_RUN || 'true'}`);
        console.log(`📈 Profitto minimo: ${process.env.MIN_PROFIT_PERCENTAGE || 0.1}%`);
        
        console.log('\n⏳ Avvio in 3 secondi...');
        await this.sleep(3000);
        
        // Avvia il sistema parallelo
        const ParallelMonitoringSystem = require('./parallel-monitor');
        const system = new ParallelMonitoringSystem();
        
        // Configura eventi
        system.on('opportunity', (data) => {
            console.log(`\n🎯 OPPORTUNITÀ RILEVATA da ${data.scanner.toUpperCase()}`);
        });
        
        // Avvia monitoraggio
        await system.startParallelMonitoring();
    }
    
    /**
     * Utility sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Esecuzione
if (require.main === module) {
    const quickStart = new QuickStart();
    quickStart.start().catch(console.error);
}

module.exports = QuickStart; 