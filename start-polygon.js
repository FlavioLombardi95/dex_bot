#!/usr/bin/env node

/**
 * Script di avvio per Polygon Mumbai Testnet
 * Bot di arbitraggio crypto ottimizzato per Layer 2
 */

const { ethers } = require('ethers');
const winston = require('winston');
const { config, validateConfig, loadNetworkConfig } = require('./bot/config');

// Configurazione logger specifica per Polygon
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
        new winston.transports.File({ 
            filename: 'logs/polygon-arbitrage.log',
            maxsize: '10m',
            maxFiles: 5
        }),
        new winston.transports.Console()
    ]
});

async function main() {
    try {
        logger.info('🚀 === AVVIO BOT ARBITRAGGIO POLYGON ===');
        
        // Carica configurazione Polygon
        loadNetworkConfig('mumbai');
        logger.info('✅ Configurazione Polygon Mumbai caricata');
        
        // Valida configurazione
        validateConfig();
        logger.info('✅ Configurazione validata');
        
        // Test connessione blockchain
        const provider = new ethers.providers.JsonRpcProvider(config.network.rpcUrl);
        const network = await provider.getNetwork();
        logger.info('🌐 Connessione Polygon stabilita', { 
            chainId: network.chainId,
            name: network.name,
            rpcUrl: config.network.rpcUrl
        });
        
        // Test wallet
        const wallet = new ethers.Wallet(config.wallet.privateKey, provider);
        const balance = await wallet.getBalance();
        logger.info('💰 Wallet configurato', {
            address: wallet.address,
            balance: ethers.utils.formatEther(balance) + ' MATIC'
        });
        
        if (balance.lt(ethers.utils.parseEther('0.1'))) {
            logger.warn('⚠️ Saldo basso! Ottieni MATIC da: https://faucet.polygon.technology/');
        }
        
        // Test DEX
        logger.info('🔍 Test connessione DEX...');
        const uniswapRouter = new ethers.Contract(
            config.dexRouters.uniswap,
            ['function factory() external pure returns (address)'],
            provider
        );
        
        const sushiswapRouter = new ethers.Contract(
            config.dexRouters.sushiswap,
            ['function factory() external pure returns (address)'],
            provider
        );
        
        try {
            await uniswapRouter.factory();
            await sushiswapRouter.factory();
            logger.info('✅ DEX configurati correttamente');
        } catch (error) {
            logger.error('❌ Errore configurazione DEX:', error.message);
        }
        
        // Test token
        logger.info('🪙 Test token supportati...');
        for (const [symbol, token] of Object.entries(config.tokens)) {
            try {
                const tokenContract = new ethers.Contract(
                    token.address,
                    ['function symbol() external view returns (string)'],
                    provider
                );
                const tokenSymbol = await tokenContract.symbol();
                logger.info(`✅ ${symbol}: ${tokenSymbol} (${token.address})`);
            } catch (error) {
                logger.warn(`⚠️ Token ${symbol} non raggiungibile: ${error.message}`);
            }
        }
        
        // Avvia bot
        logger.info('🤖 Avvio bot arbitraggio...');
        const { ArbitrageBot } = require('./bot/index');
        
        const bot = new ArbitrageBot();
        global.bot = bot;
        
        await bot.initialize();
        await bot.startMonitoring();
        
        logger.info('🎉 Bot avviato con successo su Polygon Mumbai!');
        logger.info('📊 Monitoraggio attivo per opportunità di arbitraggio');
        logger.info('📝 Log dettagliati in: logs/polygon-arbitrage.log');
        
    } catch (error) {
        logger.error('💥 Errore fatale durante avvio:', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
}

// Gestione graceful shutdown
process.on('SIGINT', () => {
    logger.info('🛑 Arresto bot...');
    if (global.bot) {
        global.bot.stop();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('🛑 Arresto bot...');
    if (global.bot) {
        global.bot.stop();
    }
    process.exit(0);
});

// Esegui solo se chiamato direttamente
if (require.main === module) {
    main();
}

module.exports = { main }; 