#!/usr/bin/env node

/**
 * Setup script per Polygon PoS Amoy Testnet
 * Configurazione automatica per Layer 2
 */

const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const winston = require('winston');

// Configurazione logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console()
    ]
});

class PolygonSetup {
    constructor() {
        this.setupComplete = false;
    }
    
    async runSetup() {
        logger.info('🚀 === SETUP POLYGON POS AMOY ===');
        
        try {
            await this.checkPrerequisites();
            await this.createDirectories();
            await this.createConfigFiles();
            await this.installDependencies();
            await this.compileContracts();
            await this.createDocumentation();
            
            this.setupComplete = true;
            this.printSuccess();
            
        } catch (error) {
            logger.error('❌ Errore durante setup:', error.message);
            this.printFailure();
        }
    }
    
    async checkPrerequisites() {
        logger.info('🔍 Verifica prerequisiti...');
        
        // Verifica Node.js
        const nodeVersion = process.version;
        logger.info(`✅ Node.js: ${nodeVersion}`);
        
        // Verifica npm
        const { exec } = require('child_process');
        const util = require('util');
        const execAsync = util.promisify(exec);
        
        try {
            const { stdout } = await execAsync('npm --version');
            logger.info(`✅ npm: ${stdout.trim()}`);
        } catch (error) {
            throw new Error('npm non trovato');
        }
        
        // Verifica Hardhat
        try {
            const { stdout } = await execAsync('npx hardhat --version');
            logger.info(`✅ Hardhat: ${stdout.trim()}`);
        } catch (error) {
            logger.warn('⚠️ Hardhat non installato, verrà installato automaticamente');
        }
    }
    
    async createDirectories() {
        logger.info('📁 Creazione directory...');
        
        const directories = [
            'logs',
            'scripts',
            'test'
        ];
        
        for (const dir of directories) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                logger.info(`✅ Creata directory: ${dir}`);
            } else {
                logger.info(`✅ Directory esistente: ${dir}`);
            }
        }
    }
    
    async createConfigFiles() {
        logger.info('⚙️ Creazione file di configurazione...');
        
        // Crea .env se non esiste
        if (!fs.existsSync('.env')) {
            const envContent = `# Configurazione Polygon PoS Amoy Testnet
NETWORK=amoy
RPC_URL=https://rpc-amoy.polygon.technology
CHAIN_ID=80002

# Wallet (inserisci la tua chiave privata)
PRIVATE_KEY=your_private_key_here

# Smart Contract (verrà deployato)
ARBITRAGE_CONTRACT_ADDRESS=

# Balancer Vault (Polygon)
BALANCER_VAULT_ADDRESS=0xBA12222222228d8Ba445958a75a0704d566BF2C8

# Router DEX (Polygon Amoy)
UNISWAP_ROUTER=0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff
SUSHISWAP_ROUTER=0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506

# Token Amoy Testnet
WMATIC_ADDRESS=0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889
USDC_ADDRESS=0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747
USDT_ADDRESS=0xA02f6adc7926efeBBd59Fd43A84f1E0C1232Fa2D
DAI_ADDRESS=0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F

# Parametri arbitraggio ottimizzati per Polygon
MIN_PROFIT_THRESHOLD=0.005
MAX_SLIPPAGE=0.02
GAS_LIMIT=500000
GAS_PRICE=30000000000
MONITORING_INTERVAL=5000
FLASHLOAN_AMOUNT=1000000000000000000

# Modalità sicura
DRY_RUN=true
LOG_LEVEL=debug
`;
            
            fs.writeFileSync('.env', envContent);
            logger.info('✅ Creato file .env');
        } else {
            logger.info('✅ File .env esistente');
        }
    }
    
    async installDependencies() {
        logger.info('📦 Installazione dipendenze...');
        
        const { exec } = require('child_process');
        const util = require('util');
        const execAsync = util.promisify(exec);
        
        try {
            await execAsync('npm install');
            logger.info('✅ Dipendenze installate');
        } catch (error) {
            logger.error('❌ Errore installazione dipendenze:', error.message);
            throw error;
        }
    }
    
    async compileContracts() {
        logger.info('📝 Compilazione contratti...');
        
        const { exec } = require('child_process');
        const util = require('util');
        const execAsync = util.promisify(exec);
        
        try {
            await execAsync('npx hardhat compile');
            logger.info('✅ Contratti compilati');
        } catch (error) {
            logger.error('❌ Errore compilazione:', error.message);
            throw error;
        }
    }
    
    async createDocumentation() {
        logger.info('📚 Creazione documentazione...');
        
        const polygonGuide = `# 🚀 GUIDA POLYGON POS AMOY

## ✅ Setup Completato!

Il bot è stato configurato per Polygon PoS Amoy testnet.

## 🎯 Prossimi Passi

### 1. Configura Wallet
- Ottieni MATIC da: https://faucet.polygon.technology/
- Inserisci la tua chiave privata nel file .env

### 2. Test Sistema
\`\`\`bash
npm run test:polygon
\`\`\`

### 3. Deploy Contratto
\`\`\`bash
npm run deploy:polygon
\`\`\`

### 4. Avvia Bot
\`\`\`bash
npm run start:polygon
\`\`\`

## 🔗 Risorse Utili

- **Faucet MATIC**: https://faucet.polygon.technology/
- **Polygon Amoy Explorer**: https://amoy.polygonscan.com/
- **Uniswap Amoy**: https://app.uniswap.org/
- **SushiSwap Amoy**: https://app.sushi.com/

## ⚠️ Note Importanti

- Usa sempre testnet per sviluppo
- Monitora i log in logs/polygon-arbitrage.log
- Mantieni DRY_RUN=true inizialmente
- Gas fees su Polygon sono molto basse

## 🎉 Pronto per il Trading!

Il bot è ottimizzato per Layer 2 con:
- Gas fees ridotte
- Transazioni veloci
- Liquidità crescente
- Opportunità frequenti
`;
        
        fs.writeFileSync('POLYGON_GUIDE.md', polygonGuide);
        logger.info('✅ Creata guida Polygon');
    }
    
    printSuccess() {
        logger.info('🎉 === SETUP COMPLETATO CON SUCCESSO ===');
        logger.info('✅ Tutti i componenti configurati per Polygon PoS Amoy');
        logger.info('📝 Leggi POLYGON_GUIDE.md per i prossimi passi');
        logger.info('🧪 Esegui: npm run test:polygon');
        logger.info('🚀 Avvia: npm run start:polygon');
    }
    
    printFailure() {
        logger.error('❌ === SETUP FALLITO ===');
        logger.error('Controlla gli errori sopra e riprova');
    }
}

async function main() {
    const setup = new PolygonSetup();
    await setup.runSetup();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { PolygonSetup }; 