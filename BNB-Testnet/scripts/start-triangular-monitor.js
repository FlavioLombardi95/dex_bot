const { ethers } = require('hardhat');
const config = require('../bot/config');
const TriangularArbitrageMonitor = require('../bot/monitor');

// Configurazione per gestire interruzioni
let monitor;
let isRunning = false;

// Gestione segnali per terminazione pulita
process.on('SIGINT', async () => {
    console.log('\n🛑 Ricevuto segnale di interruzione (CTRL+C)');
    await shutdown();
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Ricevuto segnale di terminazione');
    await shutdown();
});

async function shutdown() {
    if (monitor && isRunning) {
        console.log('🔄 Terminazione monitor in corso...');
        monitor.stopMonitoring();
        
        // Salva statistiche finali
        const stats = monitor.getOpportunityStats();
        console.log('📊 Statistiche finali:', stats);
        
        isRunning = false;
        console.log('✅ Monitor terminato correttamente');
    }
    
    process.exit(0);
}

async function main() {
    console.log('🚀 Avvio Monitor Arbitraggio Triangolare BSC Testnet');
    console.log('===================================================');
    
    // Banner informativo
    console.log('🎯 Modalità: Arbitraggio Triangolare');
    console.log('🌐 Rete: BSC Testnet');
    console.log('🥞 DEX: PancakeSwap V2');
    console.log('⏰ Intervallo scansione:', config.monitoring.triangularScanInterval + 'ms');
    console.log('💰 Profitto minimo:', config.triangularArbitrage.minProfitPercentage + '%');
    console.log('📊 Percorsi monitorati:', config.triangularArbitrage.paths.length);
    
    // Verifica rete
    const network = await ethers.provider.getNetwork();
    console.log('\n📊 Verifica rete...');
    console.log('Rete:', {
        nome: network.name,
        chainId: network.chainId
    });
    
    if (network.chainId !== 97) {
        throw new Error('⚠️ Errore: Monitor deve essere eseguito su BSC Testnet (Chain ID 97)');
    }
    
    // Verifica configurazione
    console.log('\n🔍 Verifica configurazione...');
    const validationErrors = config.validate();
    if (validationErrors.length > 0) {
        console.error('❌ Errori di configurazione:');
        validationErrors.forEach(error => console.error(`  • ${error}`));
        throw new Error('Configurazione non valida');
    }
    
    console.log('✅ Configurazione valida');
    
    // Inizializza monitor
    console.log('\n🔧 Inizializzazione monitor...');
    monitor = new TriangularArbitrageMonitor();
    
    // Verifica connessione
    const connected = await monitor.checkConnection();
    if (!connected) {
        throw new Error('❌ Impossibile connettersi alla rete BSC Testnet');
    }
    
    console.log('✅ Connessione verificata');
    
    // Test iniziale delle opportunità
    console.log('\n🧪 Test iniziale opportunità...');
    const initialOpportunities = await monitor.scanAllTriangularPaths();
    const profitableInitial = initialOpportunities.filter(o => o.profitable);
    
    console.log(`📊 Scansione iniziale completata:`);
    console.log(`   • Opportunità totali: ${initialOpportunities.length}`);
    console.log(`   • Profittevoli: ${profitableInitial.length}`);
    
    if (profitableInitial.length > 0) {
        console.log('🎯 Opportunità profittevoli iniziali:');
        profitableInitial.forEach(opp => {
            console.log(`   • ${opp.path}: +${opp.profitPercentage.toFixed(4)}% (${opp.profit} ${opp.tokenSymbols[0]})`);
        });
    }
    
    // Configurazione modalità
    const dryRun = config.bot.dryRun;
    if (dryRun) {
        console.log('\n🔍 MODALITÀ DRY RUN ATTIVA');
        console.log('   • Nessuna transazione verrà eseguita');
        console.log('   • Solo monitoraggio e logging');
    } else {
        console.log('\n💰 MODALITÀ LIVE ATTIVA');
        console.log('   • Le transazioni profittevoli verranno eseguite');
        console.log('   • Assicurati di avere fondi sufficienti');
    }
    
    // Avvio monitoraggio
    console.log('\n🚀 Avvio monitoraggio continuo...');
    isRunning = true;
    
    // Avvia il monitoraggio
    await monitor.startMonitoring();
    
    // Setup per reporting periodico
    const reportInterval = 60000; // 1 minuto
    const reportTimer = setInterval(() => {
        if (isRunning) {
            logPeriodicReport();
        }
    }, reportInterval);
    
    // Mantiene il processo attivo
    console.log('📊 Monitor attivo. Premi CTRL+C per terminare.');
    
    // Loop infinito per mantenere il processo attivo
    while (isRunning) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Pulizia finale
    clearInterval(reportTimer);
}

function logPeriodicReport() {
    const now = new Date();
    const stats = monitor.getOpportunityStats();
    const cacheStats = monitor.getCacheStats();
    
    console.log(`\n📊 Report periodico - ${now.toLocaleTimeString()}`);
    console.log('━'.repeat(50));
    console.log(`📈 Statistiche:`);
    console.log(`   • Scansioni totali: ${stats.totalScans}`);
    console.log(`   • Opportunità profittevoli: ${stats.profitableOpportunities}`);
    console.log(`   • Tasso profittabilità: ${stats.profitabilityRate}%`);
    console.log(`   • Profitto medio: ${stats.avgProfit}%`);
    
    if (stats.bestOpportunity) {
        console.log(`🏆 Migliore opportunità:`);
        console.log(`   • Percorso: ${stats.bestOpportunity.path}`);
        console.log(`   • Profitto: ${stats.bestOpportunity.profitPercentage}`);
        console.log(`   • Timestamp: ${new Date(stats.bestOpportunity.timestamp).toLocaleTimeString()}`);
    }
    
    console.log(`💾 Cache: ${cacheStats.cacheSize} voci`);
    console.log('━'.repeat(50));
}

// Funzione per la gestione degli errori
function handleError(error) {
    console.error('❌ Errore critico:', error);
    
    // Log dell'errore
    const fs = require('fs');
    const path = require('path');
    const errorLog = path.join(__dirname, '../logs/error.log');
    
    const errorEntry = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        type: 'triangular-monitor-error'
    };
    
    try {
        // Crea directory logs se non esiste
        const logsDir = path.dirname(errorLog);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        
        fs.appendFileSync(errorLog, JSON.stringify(errorEntry) + '\n');
    } catch (writeError) {
        console.error('❌ Impossibile scrivere log errore:', writeError);
    }
    
    // Tentativo di riavvio automatico se configurato
    if (config.bot.autoRestart && isRunning) {
        console.log('🔄 Tentativo di riavvio automatico in 5 secondi...');
        setTimeout(() => {
            if (isRunning) {
                console.log('🚀 Riavvio monitor...');
                main().catch(handleError);
            }
        }, 5000);
    } else {
        shutdown();
    }
}

// Gestione errori non catturati
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    handleError(new Error(`Unhandled Rejection: ${reason}`));
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    handleError(error);
});

// Esegui il monitor
if (require.main === module) {
    console.log('🔧 Configurazione ambiente...');
    
    // Verifica variabili d'ambiente
    const requiredEnvVars = ['PRIVATE_KEY', 'WALLET_ADDRESS'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('❌ Variabili d\'ambiente mancanti:', missingVars);
        console.error('💡 Assicurati di configurare il file .env');
        process.exit(1);
    }
    
    // Avvia il monitor
    main().catch(handleError);
}

module.exports = { main }; 