#!/usr/bin/env node

/**
 * 🧹 PULIZIA SISTEMA - Mantiene solo file essenziali
 * =================================================
 */

const fs = require('fs');
const path = require('path');

const FileCleaner = {
    // File ESSENZIALI da mantenere
    essential: [
        'package.json',
        'package-lock.json',
        'app.js',
        'hardhat.config.js',
        '.gitignore',
        'test-basic.js',
        'testnet-config.js',
        'core',
        'contracts',
        'node_modules',
        'logs'
    ],
    
    // File SICUREZZA (opzionali ma importanti)
    security: [
        'security-setup.js',
        'testnet-debug.js',
        'env-secure-template.txt'
    ],
    
    // File AVANZATI (per produzione)
    advanced: [
        'parallel-monitor.js',
        'realtime-new-tokens-scanner.js',
        'real-profit-scanner.js',
        'optimized-arbitrage-monitor.js',
        'test-scanner.js',
        'scripts'
    ],
    
    // File DOCUMENTAZIONE
    documentation: [
        'README.md',
        'BSC_TESTNET_GUIDE.md',
        'OPTIMIZATION_GUIDE.md',
        'TRIANGULAR_ARBITRAGE_GUIDE.md'
    ],
    
    // File DA ELIMINARE
    removable: [
        'competitive-analysis.js',
        'mainnet-analysis-strategy.js',
        'hybrid-strategy-plan.md',
        'quick-start.js',
        'bot',
        'scanners',
        'test'
    ],
    
    showCurrentFiles() {
        console.log('📂 FILE ATTUALI:');
        console.log('================');
        
        const files = fs.readdirSync('.').filter(f => f !== 'cleanup-system.js');
        const categories = this.categorizeFiles(files);
        
        console.log(`✅ Essenziali (${categories.essential.length}): ${categories.essential.join(', ')}`);
        console.log(`⚠️  Sicurezza (${categories.security.length}): ${categories.security.join(', ')}`);
        console.log(`🔧 Avanzati (${categories.advanced.length}): ${categories.advanced.join(', ')}`);
        console.log(`📄 Documentazione (${categories.documentation.length}): ${categories.documentation.join(', ')}`);
        console.log(`🗑️  Eliminabili (${categories.removable.length}): ${categories.removable.join(', ')}`);
        console.log(`❓ Altri (${categories.others.length}): ${categories.others.join(', ')}`);
        
        return categories;
    },
    
    categorizeFiles(files) {
        const categories = {
            essential: [],
            security: [],
            advanced: [],
            documentation: [],
            removable: [],
            others: []
        };
        
        files.forEach(file => {
            if (this.essential.includes(file)) {
                categories.essential.push(file);
            } else if (this.security.includes(file)) {
                categories.security.push(file);
            } else if (this.advanced.includes(file)) {
                categories.advanced.push(file);
            } else if (this.documentation.includes(file)) {
                categories.documentation.push(file);
            } else if (this.removable.includes(file)) {
                categories.removable.push(file);
            } else {
                categories.others.push(file);
            }
        });
        
        return categories;
    },
    
    cleanupBasic() {
        console.log('\n🧹 PULIZIA BASIC - Solo file essenziali');
        console.log('=====================================');
        
        const categories = this.showCurrentFiles();
        
        console.log('\n🗑️  File da eliminare:');
        const toRemove = [...categories.advanced, ...categories.removable];
        
        toRemove.forEach(file => {
            try {
                const filePath = path.join('.', file);
                if (fs.existsSync(filePath)) {
                    if (fs.statSync(filePath).isDirectory()) {
                        fs.rmSync(filePath, { recursive: true, force: true });
                        console.log(`📁 Eliminata cartella: ${file}`);
                    } else {
                        fs.unlinkSync(filePath);
                        console.log(`📄 Eliminato file: ${file}`);
                    }
                }
            } catch (error) {
                console.log(`❌ Errore eliminando ${file}: ${error.message}`);
            }
        });
        
        console.log('\n✅ PULIZIA COMPLETATA!');
        console.log('📊 File rimasti:', this.countFiles());
        console.log('\n🎯 Sistema semplificato per test base');
    },
    
    cleanupAdvanced() {
        console.log('\n🧹 PULIZIA AVANZATA - Mantiene sicurezza');
        console.log('=======================================');
        
        const categories = this.showCurrentFiles();
        
        console.log('\n🗑️  File da eliminare:');
        const toRemove = [...categories.removable];
        
        toRemove.forEach(file => {
            try {
                const filePath = path.join('.', file);
                if (fs.existsSync(filePath)) {
                    if (fs.statSync(filePath).isDirectory()) {
                        fs.rmSync(filePath, { recursive: true, force: true });
                        console.log(`📁 Eliminata cartella: ${file}`);
                    } else {
                        fs.unlinkSync(filePath);
                        console.log(`📄 Eliminato file: ${file}`);
                    }
                }
            } catch (error) {
                console.log(`❌ Errore eliminando ${file}: ${error.message}`);
            }
        });
        
        console.log('\n✅ PULIZIA COMPLETATA!');
        console.log('📊 File rimasti:', this.countFiles());
        console.log('\n🎯 Sistema ottimizzato con sicurezza');
    },
    
    createBackup() {
        console.log('\n💾 CREAZIONE BACKUP...');
        const backupDir = '../backup-before-cleanup';
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }
        
        // Copia solo file importanti per backup
        const importantFiles = [
            'competitive-analysis.js',
            'mainnet-analysis-strategy.js',
            'hybrid-strategy-plan.md',
            'quick-start.js'
        ];
        
        importantFiles.forEach(file => {
            try {
                if (fs.existsSync(file)) {
                    fs.copyFileSync(file, path.join(backupDir, file));
                    console.log(`💾 Backup salvato: ${file}`);
                }
            } catch (error) {
                console.log(`❌ Errore backup ${file}: ${error.message}`);
            }
        });
        
        console.log(`✅ Backup creato in: ${backupDir}`);
    },
    
    countFiles() {
        return fs.readdirSync('.').filter(f => f !== 'cleanup-system.js').length;
    }
};

// Menu interattivo
function showMenu() {
    console.log('\n🧹 === PULIZIA SISTEMA DEX BOT ===');
    console.log('==================================');
    console.log('1. 📊 Mostra file attuali');
    console.log('2. 🧹 Pulizia BASIC (solo essenziali)');
    console.log('3. 🔧 Pulizia AVANZATA (mantiene sicurezza)');
    console.log('4. 💾 Crea backup prima di pulire');
    console.log('5. ❌ Esci');
    console.log('\nScegli opzione (1-5):');
}

// Gestione argomenti da linea di comando
const args = process.argv.slice(2);

if (args.length === 0) {
    // Mostra solo file attuali se nessun argomento
    FileCleaner.showCurrentFiles();
    console.log('\n💡 Usa: node cleanup-system.js [basic|advanced|backup]');
} else {
    switch (args[0]) {
        case 'basic':
            FileCleaner.createBackup();
            FileCleaner.cleanupBasic();
            break;
        case 'advanced':
            FileCleaner.createBackup();
            FileCleaner.cleanupAdvanced();
            break;
        case 'backup':
            FileCleaner.createBackup();
            break;
        case 'show':
            FileCleaner.showCurrentFiles();
            break;
        default:
            console.log('❌ Opzione non valida');
            console.log('💡 Usa: node cleanup-system.js [basic|advanced|backup|show]');
    }
} 