#!/usr/bin/env node

/**
 * Test script per Polygon Mumbai Testnet
 * Verifica tutte le funzionalità del bot su Layer 2
 */

const { ethers } = require('ethers');
const winston = require('winston');
const { config, validateConfig, loadNetworkConfig } = require('../bot/config');

// Configurazione logger
const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
            let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
            if (Object.keys(meta).length > 0) {
                log += ` ${JSON.stringify(meta)}`;
            }
            return log;
        })
    ),
    transports: [
        new winston.transports.Console()
    ]
});

class PolygonTestSuite {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }
    
    async runTests() {
        logger.info('🧪 === TEST SUITE POLYGON MUMBAI ===');
        
        try {
            // Carica configurazione Polygon
            loadNetworkConfig('mumbai');
            logger.info('✅ Configurazione Polygon caricata');
            
            // Esegui tutti i test
            await this.testConfiguration();
            await this.testBlockchainConnection();
            await this.testWallet();
            await this.testDEXConnections();
            await this.testTokens();
            await this.testPriceMonitoring();
            await this.testContractCompilation();
            
            // Risultati finali
            this.printResults();
            
        } catch (error) {
            logger.error('❌ Errore durante test suite:', error.message);
            this.results.failed++;
            this.printResults();
        }
    }
    
    async testConfiguration() {
        logger.info('🔧 Test configurazione...');
        try {
            validateConfig();
            logger.info('✅ Configurazione valida');
            this.results.passed++;
        } catch (error) {
            logger.error('❌ Configurazione non valida:', error.message);
            this.results.failed++;
        }
        this.results.total++;
    }
    
    async testBlockchainConnection() {
        logger.info('🌐 Test connessione blockchain...');
        try {
            const provider = new ethers.providers.JsonRpcProvider(config.network.rpcUrl);
            const network = await provider.getNetwork();
            
            if (network.chainId === 80001) {
                logger.info('✅ Connessione Polygon Mumbai OK');
                this.results.passed++;
            } else {
                throw new Error(`Chain ID errato: ${network.chainId}, atteso: 80001`);
            }
        } catch (error) {
            logger.error('❌ Errore connessione blockchain:', error.message);
            this.results.failed++;
        }
        this.results.total++;
    }
    
    async testWallet() {
        logger.info('💰 Test wallet...');
        try {
            const provider = new ethers.providers.JsonRpcProvider(config.network.rpcUrl);
            const wallet = new ethers.Wallet(config.wallet.privateKey, provider);
            const balance = await wallet.getBalance();
            
            logger.info(`✅ Wallet configurato: ${wallet.address}`);
            logger.info(`💰 Saldo: ${ethers.utils.formatEther(balance)} MATIC`);
            
            if (balance.lt(ethers.utils.parseEther('0.01'))) {
                logger.warn('⚠️ Saldo basso per test');
            }
            
            this.results.passed++;
        } catch (error) {
            logger.error('❌ Errore wallet:', error.message);
            this.results.failed++;
        }
        this.results.total++;
    }
    
    async testDEXConnections() {
        logger.info('🔍 Test connessioni DEX...');
        try {
            const provider = new ethers.providers.JsonRpcProvider(config.network.rpcUrl);
            
            // Test Uniswap
            const uniswapRouter = new ethers.Contract(
                config.dexRouters.uniswap,
                ['function factory() external pure returns (address)'],
                provider
            );
            await uniswapRouter.factory();
            logger.info('✅ Uniswap Router OK');
            
            // Test SushiSwap
            const sushiswapRouter = new ethers.Contract(
                config.dexRouters.sushiswap,
                ['function factory() external pure returns (address)'],
                provider
            );
            await sushiswapRouter.factory();
            logger.info('✅ SushiSwap Router OK');
            
            this.results.passed++;
        } catch (error) {
            logger.error('❌ Errore DEX:', error.message);
            this.results.failed++;
        }
        this.results.total++;
    }
    
    async testTokens() {
        logger.info('🪙 Test token supportati...');
        try {
            const provider = new ethers.providers.JsonRpcProvider(config.network.rpcUrl);
            
            for (const [symbol, token] of Object.entries(config.tokens)) {
                try {
                    const tokenContract = new ethers.Contract(
                        token.address,
                        ['function symbol() external view returns (string)'],
                        provider
                    );
                    const tokenSymbol = await tokenContract.symbol();
                    logger.info(`✅ ${symbol}: ${tokenSymbol}`);
                } catch (error) {
                    logger.warn(`⚠️ Token ${symbol} non raggiungibile: ${error.message}`);
                }
            }
            
            this.results.passed++;
        } catch (error) {
            logger.error('❌ Errore test token:', error.message);
            this.results.failed++;
        }
        this.results.total++;
    }
    
    async testPriceMonitoring() {
        logger.info('📊 Test monitoraggio prezzi...');
        try {
            const { PriceMonitor } = require('../bot/monitor');
            const priceMonitor = new PriceMonitor();
            
            const connectionOk = await priceMonitor.checkConnection();
            if (connectionOk) {
                logger.info('✅ Monitor prezzi OK');
                this.results.passed++;
            } else {
                throw new Error('Connessione monitor prezzi fallita');
            }
        } catch (error) {
            logger.error('❌ Errore monitor prezzi:', error.message);
            this.results.failed++;
        }
        this.results.total++;
    }
    
    async testContractCompilation() {
        logger.info('📝 Test compilazione contratti...');
        try {
            const { exec } = require('child_process');
            const util = require('util');
            const execAsync = util.promisify(exec);
            
            const { stdout, stderr } = await execAsync('npx hardhat compile');
            
            if (stderr && !stderr.includes('Warning')) {
                throw new Error(stderr);
            }
            
            logger.info('✅ Contratti compilati con successo');
            this.results.passed++;
        } catch (error) {
            logger.error('❌ Errore compilazione:', error.message);
            this.results.failed++;
        }
        this.results.total++;
    }
    
    printResults() {
        logger.info('📋 === RISULTATI TEST POLYGON ===');
        logger.info(`✅ Test passati: ${this.results.passed}`);
        logger.info(`❌ Test falliti: ${this.results.failed}`);
        logger.info(`📊 Totale: ${this.results.total}`);
        
        const successRate = (this.results.passed / this.results.total * 100).toFixed(1);
        logger.info(`🎯 Tasso di successo: ${successRate}%`);
        
        if (this.results.failed === 0) {
            logger.info('🎉 TUTTI I TEST PASSATI! Pronto per Polygon Mumbai');
        } else {
            logger.warn('⚠️ Alcuni test falliti. Controlla la configurazione.');
        }
    }
}

async function main() {
    const testSuite = new PolygonTestSuite();
    await testSuite.runTests();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { PolygonTestSuite }; 