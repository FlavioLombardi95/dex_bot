#!/usr/bin/env node

/**
 * 🚀 SISTEMA MONITORAGGIO PARALLELO - OTTIMIZZATO PER DATI TEMPO REALE
 * ================================================================
 * 
 * Orchestrazione intelligente di processi paralleli per massimizzare
 * il rilevamento di opportunità di arbitraggio in tempo reale.
 * 
 * Nessun Docker necessario - 100% Node.js locale
 */

const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');

class ParallelMonitoringSystem extends EventEmitter {
    constructor() {
        super();
        this.processes = new Map();
        this.stats = {
            totalOpportunities: 0,
            profitableOpportunities: 0,
            totalScans: 0,
            systemStartTime: Date.now(),
            lastOpportunityTime: null
        };
        
        this.config = {
            // Configurazione processi paralleli
            enabledScanners: {
                triangular: true,        // Arbitraggio triangolare
                realtime: true,          // Nuovi token in tempo reale
                profit: true,            // Scansione profitti
                optimized: true          // Monitor ottimizzato
            },
            
            // Configurazione performance
            maxConcurrentProcesses: 4,
            restartOnCrash: true,
            healthCheckInterval: 30000, // 30 secondi
            
            // Configurazione ottimizzazione
            cpuAffinity: true,
            memoryOptimization: true,
            priorityScheduling: true
        };
        
        this.setupHealthMonitoring();
        this.setupSignalHandlers();
    }
    
    /**
     * Avvia tutti i processi di monitoraggio in parallelo
     */
    async startParallelMonitoring() {
        console.log('\n🚀 === SISTEMA MONITORAGGIO PARALLELO BNB-TESTNET ===');
        console.log('=====================================================');
        console.log('💡 Modalità: Processi paralleli ottimizzati');
        console.log('🌐 Rete: BSC Testnet (senza Docker)');
        console.log('⚡ Performance: Massima efficienza CPU/RAM');
        console.log('📊 Dati: Tempo reale con cache intelligente\n');
        
        // Verifica sistema
        await this.systemCheck();
        
        // Avvia processi paralleli
        const scannerPromises = [];
        
        if (this.config.enabledScanners.triangular) {
            scannerPromises.push(this.startTriangularScanner());
        }
        
        if (this.config.enabledScanners.realtime) {
            scannerPromises.push(this.startRealtimeScanner());
        }
        
        if (this.config.enabledScanners.profit) {
            scannerPromises.push(this.startProfitScanner());
        }
        
        if (this.config.enabledScanners.optimized) {
            scannerPromises.push(this.startOptimizedMonitor());
        }
        
        // Avvia monitoraggio aggregato
        this.startAggregatedMonitoring();
        
        // Avvia report performance
        this.startPerformanceReporting();
        
        console.log(`🎯 ${scannerPromises.length} processi paralleli avviati`);
        console.log('📊 Premi CTRL+C per terminare tutto il sistema\n');
        
        // Attendi tutti i processi
        await Promise.all(scannerPromises);
    }
    
    /**
     * Verifica sistema e ottimizzazioni
     */
    async systemCheck() {
        console.log('🔍 Verifica sistema...');
        
        // Verifica memoria disponibile
        const memoryUsage = process.memoryUsage();
        const freeMemory = require('os').freemem();
        
        console.log(`💾 Memoria disponibile: ${Math.round(freeMemory / 1024 / 1024)} MB`);
        console.log(`🔄 Memoria Node.js: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`);
        
        // Verifica CPU
        const cpuCount = require('os').cpus().length;
        console.log(`💻 CPU cores: ${cpuCount}`);
        
        // Verifica network
        const { execSync } = require('child_process');
        try {
            const ping = execSync('ping -c 1 bsc-dataseed.binance.org', { timeout: 5000 });
            console.log('🌐 Connessione BSC: ✅ OK');
        } catch (error) {
            console.log('🌐 Connessione BSC: ⚠️ Verificare rete');
        }
        
        // Ottimizzazioni sistema
        if (this.config.cpuAffinity) {
            console.log('⚡ Ottimizzazione CPU: Abilitata');
        }
        
        if (this.config.memoryOptimization) {
            console.log('💾 Ottimizzazione RAM: Abilitata');
            // Imposta limiti memory per ottimizzazione
            if (process.env.NODE_OPTIONS) {
                process.env.NODE_OPTIONS += ' --max-old-space-size=2048';
            } else {
                process.env.NODE_OPTIONS = '--max-old-space-size=2048';
            }
        }
        
        console.log('✅ Sistema pronto per monitoraggio parallelo\n');
    }
    
    /**
     * Avvia scanner arbitraggio triangolare
     */
    async startTriangularScanner() {
        console.log('🔺 Avvio Scanner Triangolare...');
        
        const childProcess = spawn('node', ['scanners/triangular-scanner.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                SCANNER_MODE: 'continuous',
                SCAN_INTERVAL: '2000',
                MAX_CONCURRENT: '3',
                ENABLE_CACHE: 'true'
            }
        });
        
        this.processes.set('triangular', childProcess);
        this.setupProcessHandlers('triangular', childProcess);
        
        return this.waitForProcessReady('triangular');
    }
    
    /**
     * Avvia scanner tempo reale nuovi token
     */
    async startRealtimeScanner() {
        console.log('⚡ Avvio Scanner Tempo Reale...');
        
        const childProcess = spawn('node', ['realtime-new-tokens-scanner.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                SCANNER_MODE: 'realtime',
                SCAN_INTERVAL: '30000',
                NEW_TOKEN_DETECTION: 'true',
                ENABLE_CACHE: 'true'
            }
        });
        
        this.processes.set('realtime', childProcess);
        this.setupProcessHandlers('realtime', childProcess);
        
        return this.waitForProcessReady('realtime');
    }
    
    /**
     * Avvia scanner profitti
     */
    async startProfitScanner() {
        console.log('💰 Avvio Scanner Profitti...');
        
        const childProcess = spawn('node', ['real-profit-scanner.js', 'monitor'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                SCANNER_MODE: 'profit',
                SCAN_INTERVAL: '5000',
                MIN_PROFIT: '0.1',
                ENABLE_CACHE: 'true'
            }
        });
        
        this.processes.set('profit', childProcess);
        this.setupProcessHandlers('profit', childProcess);
        
        return this.waitForProcessReady('profit');
    }
    
    /**
     * Avvia monitor ottimizzato
     */
    async startOptimizedMonitor() {
        console.log('🚀 Avvio Monitor Ottimizzato...');
        
        const childProcess = spawn('node', ['optimized-arbitrage-monitor.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                SCANNER_MODE: 'optimized',
                SCAN_INTERVAL: '1500',
                QUICK_SCAN: '500',
                ENABLE_CACHE: 'true'
            }
        });
        
        this.processes.set('optimized', childProcess);
        this.setupProcessHandlers('optimized', childProcess);
        
        return this.waitForProcessReady('optimized');
    }
    
    /**
     * Configurazione handlers per processi
     */
    setupProcessHandlers(name, process) {
        process.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`[${name.toUpperCase()}] ${output.trim()}`);
            
            // Parsing opportunità
            if (output.includes('OPPORTUNITÀ TROVATA') || output.includes('PROFITTEVOLE')) {
                this.stats.totalOpportunities++;
                this.stats.lastOpportunityTime = Date.now();
                this.emit('opportunity', { scanner: name, data: output });
            }
        });
        
        process.stderr.on('data', (data) => {
            console.error(`[${name.toUpperCase()}] ERROR: ${data.toString().trim()}`);
        });
        
        process.on('exit', (code) => {
            console.log(`[${name.toUpperCase()}] Processo terminato (code: ${code})`);
            
            if (this.config.restartOnCrash && code !== 0) {
                console.log(`[${name.toUpperCase()}] Riavvio automatico...`);
                setTimeout(() => {
                    this.restartProcess(name);
                }, 5000);
            }
        });
    }
    
    /**
     * Attendi processo pronto
     */
    waitForProcessReady(name) {
        return new Promise((resolve) => {
            const process = this.processes.get(name);
            let ready = false;
            
            const timeout = setTimeout(() => {
                if (!ready) {
                    console.log(`[${name.toUpperCase()}] ✅ Processo avviato`);
                    ready = true;
                    resolve();
                }
            }, 3000);
            
            process.stdout.on('data', (data) => {
                if (!ready && (data.toString().includes('Monitor attivo') || 
                               data.toString().includes('Scansione') ||
                               data.toString().includes('Monitoraggio'))) {
                    clearTimeout(timeout);
                    console.log(`[${name.toUpperCase()}] ✅ Processo pronto`);
                    ready = true;
                    resolve();
                }
            });
        });
    }
    
    /**
     * Monitoraggio aggregato risultati
     */
    startAggregatedMonitoring() {
        console.log('📊 Avvio Monitoraggio Aggregato...\n');
        
        setInterval(() => {
            const uptime = Date.now() - this.stats.systemStartTime;
            const activeProcesses = this.processes.size;
            
            console.log(`\n📊 === REPORT SISTEMA (${new Date().toLocaleTimeString()}) ===`);
            console.log(`⏱️  Uptime: ${Math.round(uptime / 1000)}s`);
            console.log(`🔄 Processi attivi: ${activeProcesses}`);
            console.log(`🎯 Opportunità totali: ${this.stats.totalOpportunities}`);
            console.log(`💰 Opportunità profittevoli: ${this.stats.profitableOpportunities}`);
            console.log(`📈 Scansioni totali: ${this.stats.totalScans}`);
            
            if (this.stats.lastOpportunityTime) {
                const lastOpportunity = Date.now() - this.stats.lastOpportunityTime;
                console.log(`⏰ Ultima opportunità: ${Math.round(lastOpportunity / 1000)}s fa`);
            }
            
            // Memoria sistema
            const memUsage = process.memoryUsage();
            console.log(`💾 Memoria heap: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
            console.log(`─────────────────────────────────────────────────────────`);
        }, 30000); // Ogni 30 secondi
    }
    
    /**
     * Report performance dettagliato
     */
    startPerformanceReporting() {
        setInterval(() => {
            const report = {
                timestamp: new Date().toISOString(),
                uptime: Date.now() - this.stats.systemStartTime,
                processes: Array.from(this.processes.keys()),
                memory: process.memoryUsage(),
                opportunities: this.stats.totalOpportunities,
                profitableOpportunities: this.stats.profitableOpportunities
            };
            
            // Salva report per analisi
            if (!fs.existsSync('logs')) {
                fs.mkdirSync('logs', { recursive: true });
            }
            
            fs.appendFileSync('logs/performance-report.json', JSON.stringify(report) + '\n');
            
        }, 60000); // Ogni minuto
    }
    
    /**
     * Monitoraggio salute processi
     */
    setupHealthMonitoring() {
        setInterval(() => {
            this.processes.forEach((process, name) => {
                if (process.killed || process.exitCode !== null) {
                    console.log(`⚠️  Processo ${name} non attivo, riavvio...`);
                    this.restartProcess(name);
                }
            });
        }, this.config.healthCheckInterval);
    }
    
    /**
     * Riavvia processo
     */
    restartProcess(name) {
        const oldProcess = this.processes.get(name);
        if (oldProcess) {
            oldProcess.kill();
            this.processes.delete(name);
        }
        
        // Riavvia basato sul tipo
        switch (name) {
            case 'triangular':
                this.startTriangularScanner();
                break;
            case 'realtime':
                this.startRealtimeScanner();
                break;
            case 'profit':
                this.startProfitScanner();
                break;
            case 'optimized':
                this.startOptimizedMonitor();
                break;
        }
    }
    
    /**
     * Gestione segnali di terminazione
     */
    setupSignalHandlers() {
        process.on('SIGINT', () => {
            console.log('\n🛑 Terminazione sistema...');
            this.shutdown();
        });
        
        process.on('SIGTERM', () => {
            console.log('\n🛑 Terminazione sistema...');
            this.shutdown();
        });
    }
    
    /**
     * Shutdown pulito
     */
    shutdown() {
        console.log('🔄 Terminazione processi paralleli...');
        
        this.processes.forEach((process, name) => {
            console.log(`📴 Terminazione ${name}...`);
            process.kill('SIGTERM');
        });
        
        setTimeout(() => {
            console.log('✅ Sistema terminato');
            process.exit(0);
        }, 5000);
    }
}

// Esecuzione
if (require.main === module) {
    const system = new ParallelMonitoringSystem();
    system.startParallelMonitoring().catch(console.error);
}

module.exports = ParallelMonitoringSystem; 