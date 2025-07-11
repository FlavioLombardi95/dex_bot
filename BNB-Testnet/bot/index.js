const { ethers } = require('ethers');
const cron = require('node-cron');
const winston = require('winston');
const { config, validateConfig } = require('./config');
const { PriceMonitor } = require('./monitor');

// Configurazione logger centralizzato
const logger = winston.createLogger({
    level: config.logging.level,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, error, stack, ...meta }) => {
            let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
            if (Object.keys(meta).length > 0) {
                log += ` ${JSON.stringify(meta)}`;
            }
            if (error && stack) {
                log += `\n${stack}`;
            }
            return log;
        })
    ),
    transports: [
        new winston.transports.File({ 
            filename: config.logging.file,
            maxsize: config.logging.maxSize,
            maxFiles: config.logging.maxFiles,
            tailable: true
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// ABI dello smart contract di arbitraggio
const ARBITRAGE_ABI = [
    'function executeArbitrage(tuple(address tokenA, address tokenB, uint256 amountIn, address dexA, address dexB, uint256 minProfit) params) external',
    'function emergencyWithdraw(address token) external',
    'function owner() external view returns (address)',
    'event FlashLoanInitiated(address token, uint256 amount)',
    'event ArbitrageExecuted(address tokenA, address tokenB, uint256 profit)',
    'event ErrorOccurred(string reason, bytes data)'
];

class ArbitrageBot {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.arbitrageContract = null;
        this.priceMonitor = null;
        this.isRunning = false;
        this.lastExecutionTime = 0;
        
        logger.info('ArbitrageBot inizializzato');
    }
    
    /**
     * Inizializza il bot con tutte le connessioni necessarie
     */
    async initialize() {
        try {
            logger.info('Avvio inizializzazione bot...');
            
            // Valida configurazione
            validateConfig();
            logger.info('Configurazione validata con successo');
            
            // Configura provider
            this.provider = new ethers.providers.JsonRpcProvider(config.network.rpcUrl);
            logger.info('Provider blockchain configurato', { rpcUrl: config.network.rpcUrl });
            
            // Configura wallet
            this.wallet = new ethers.Wallet(config.wallet.privateKey, this.provider);
            logger.info('Wallet configurato', { address: this.wallet.address });
            
            // Verifica connessione blockchain
            const network = await this.provider.getNetwork();
            logger.info('Connessione blockchain stabilita', { 
                chainId: network.chainId, 
                name: network.name 
            });
            
            // Verifica saldo wallet
            const balance = await this.wallet.getBalance();
            logger.info('Saldo wallet verificato', { 
                balance: ethers.utils.formatEther(balance),
                address: this.wallet.address
            });
            
            if (balance.lt(ethers.utils.parseEther('0.01'))) {
                logger.warn('Saldo wallet basso per gas fees', { 
                    balance: ethers.utils.formatEther(balance)
                });
            }
            
            // Configura contratto arbitraggio
            if (config.contracts.arbitrage) {
                this.arbitrageContract = new ethers.Contract(
                    config.contracts.arbitrage,
                    ARBITRAGE_ABI,
                    this.wallet
                );
                logger.info('Contratto arbitraggio configurato', { 
                    address: config.contracts.arbitrage 
                });
                
                // Verifica proprietà del contratto
                const owner = await this.arbitrageContract.owner();
                if (owner.toLowerCase() !== this.wallet.address.toLowerCase()) {
                    throw new Error(`Wallet non è proprietario del contratto. Owner: ${owner}, Wallet: ${this.wallet.address}`);
                }
                logger.info('Proprietà contratto verificata');
            } else {
                logger.warn('Indirizzo contratto arbitraggio non configurato');
            }
            
            // Inizializza monitor prezzi
            this.priceMonitor = new PriceMonitor();
            const connectionOk = await this.priceMonitor.checkConnection();
            if (!connectionOk) {
                throw new Error('Impossibile stabilire connessione per monitor prezzi');
            }
            
            // Configura listener eventi contratto
            this.setupEventListeners();
            
            logger.info('Bot inizializzato con successo');
            
        } catch (error) {
            logger.error('Errore durante inizializzazione:', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
    
    /**
     * Configura i listener per gli eventi del contratto
     */
    setupEventListeners() {
        if (!this.arbitrageContract) return;
        
        try {
            // Listener per flash loan iniziato
            this.arbitrageContract.on('FlashLoanInitiated', (token, amount, event) => {
                logger.info('Flash loan iniziato', {
                    token,
                    amount: ethers.utils.formatUnits(amount, 18),
                    txHash: event.transactionHash,
                    blockNumber: event.blockNumber
                });
            });
            
            // Listener per arbitraggio completato
            this.arbitrageContract.on('ArbitrageExecuted', (tokenA, tokenB, profit, event) => {
                logger.info('Arbitraggio completato con successo', {
                    tokenA,
                    tokenB,
                    profit: ethers.utils.formatUnits(profit, 18),
                    txHash: event.transactionHash,
                    blockNumber: event.blockNumber
                });
            });
            
            // Listener per errori
            this.arbitrageContract.on('ErrorOccurred', (reason, data, event) => {
                logger.error('Errore nel contratto arbitraggio', {
                    reason,
                    data,
                    txHash: event.transactionHash,
                    blockNumber: event.blockNumber
                });
            });
            
            logger.info('Event listeners configurati');
            
        } catch (error) {
            logger.error('Errore configurazione event listeners:', {
                error: error.message,
                stack: error.stack
            });
        }
    }
    
    /**
     * Avvia il monitoraggio continuo
     */
    async startMonitoring() {
        if (this.isRunning) {
            logger.warn('Il bot è già in esecuzione');
            return;
        }
        
        logger.info('Avvio monitoraggio continuo...');
        this.isRunning = true;
        
        // Esegui immediatamente un controllo
        await this.checkOpportunities();
        
        // Programma controlli periodici
        const intervalMs = config.arbitrage.monitoringInterval;
        const cronExpression = this.intervalToCron(intervalMs);
        
        cron.schedule(cronExpression, async () => {
            if (this.isRunning) {
                await this.checkOpportunities();
            }
        });
        
        logger.info('Monitoraggio avviato', { 
            intervalMs,
            cronExpression
        });
    }
    
    /**
     * Converte un intervallo in ms in espressione cron
     */
    intervalToCron(intervalMs) {
        const seconds = Math.floor(intervalMs / 1000);
        if (seconds < 60) {
            return `*/${seconds} * * * * *`;
        }
        const minutes = Math.floor(seconds / 60);
        return `*/${minutes} * * * *`;
    }
    
    /**
     * Controlla le opportunità di arbitraggio
     */
    async checkOpportunities() {
        try {
            const startTime = Date.now();
            logger.debug('Inizio controllo opportunità...');
            
            // Monitora tutte le coppie
            const opportunities = await this.priceMonitor.monitorAllPairs();
            
            if (opportunities.length === 0) {
                logger.debug('Nessuna opportunità profittevole trovata');
                return;
            }
            
            // Ordina per profitto decrescente
            opportunities.sort((a, b) => Math.abs(b.priceDiffPercent) - Math.abs(a.priceDiffPercent));
            
            logger.info(`Trovate ${opportunities.length} opportunità profittevoli`);
            
            // Esegui arbitraggio sulla migliore opportunità
            const bestOpportunity = opportunities[0];
            await this.executeArbitrage(bestOpportunity);
            
            const endTime = Date.now();
            logger.debug('Controllo opportunità completato', {
                duration: `${endTime - startTime}ms`,
                opportunitiesFound: opportunities.length
            });
            
        } catch (error) {
            logger.error('Errore durante controllo opportunità:', {
                error: error.message,
                stack: error.stack
            });
        }
    }
    
    /**
     * Esegue l'arbitraggio per una data opportunità
     */
    async executeArbitrage(opportunity) {
        try {
            logger.info('Tentativo di eseguire arbitraggio', { opportunity });
            
            if (!this.arbitrageContract) {
                logger.error('Contratto arbitraggio non disponibile');
                return;
            }
            
            // Verifica che non ci siano esecuzioni troppo frequenti
            const now = Date.now();
            const minInterval = 30000; // 30 secondi
            if (now - this.lastExecutionTime < minInterval) {
                logger.warn('Esecuzione troppo frequente, saltando...', {
                    timeElapsed: now - this.lastExecutionTime,
                    minInterval
                });
                return;
            }
            
            // Determina direzione dell'arbitraggio
            const isUniswapCheaper = parseFloat(opportunity.uniswapPrice) < parseFloat(opportunity.sushiPrice);
            
            // Configura parametri
            const tokenA = config.tokens[opportunity.pair.split('/')[0]];
            const tokenB = config.tokens[opportunity.pair.split('/')[1]];
            
            const params = {
                tokenA: tokenA.address,
                tokenB: tokenB.address,
                amountIn: config.arbitrage.flashLoanAmount,
                dexA: isUniswapCheaper ? config.dexRouters.uniswap : config.dexRouters.sushiswap,
                dexB: isUniswapCheaper ? config.dexRouters.sushiswap : config.dexRouters.uniswap,
                minProfit: ethers.utils.parseEther((config.arbitrage.minProfitThreshold * 0.5).toString())
            };
            
            logger.info('Parametri arbitraggio configurati', { params });
            
            // Stima gas
            const gasEstimate = await this.arbitrageContract.estimateGas.executeArbitrage(params);
            const gasLimit = gasEstimate.mul(120).div(100); // +20% buffer
            
            logger.info('Gas stimato', { 
                gasEstimate: gasEstimate.toString(),
                gasLimit: gasLimit.toString()
            });
            
            // Esegui transazione
            const tx = await this.arbitrageContract.executeArbitrage(params, {
                gasLimit: gasLimit,
                gasPrice: ethers.utils.parseUnits('20', 'gwei')
            });
            
            logger.info('Transazione arbitraggio inviata', {
                txHash: tx.hash,
                gasLimit: gasLimit.toString(),
                gasPrice: '20 gwei'
            });
            
            // Attendi conferma
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                logger.info('Arbitraggio eseguito con successo', {
                    txHash: receipt.transactionHash,
                    gasUsed: receipt.gasUsed.toString(),
                    blockNumber: receipt.blockNumber
                });
                this.lastExecutionTime = now;
            } else {
                logger.error('Transazione arbitraggio fallita', {
                    txHash: receipt.transactionHash,
                    status: receipt.status
                });
            }
            
        } catch (error) {
            logger.error('Errore durante esecuzione arbitraggio:', {
                error: error.message,
                stack: error.stack,
                opportunity
            });
        }
    }
    
    /**
     * Ferma il bot
     */
    stop() {
        logger.info('Arresto bot...');
        this.isRunning = false;
        
        // Rimuovi listener eventi
        if (this.arbitrageContract) {
            this.arbitrageContract.removeAllListeners();
        }
        
        logger.info('Bot arrestato');
    }
    
    /**
     * Funzione di emergenza per recuperare fondi
     */
    async emergencyWithdraw(tokenAddress) {
        try {
            logger.warn('Esecuzione ritiro di emergenza', { tokenAddress });
            
            if (!this.arbitrageContract) {
                throw new Error('Contratto non disponibile');
            }
            
            const tx = await this.arbitrageContract.emergencyWithdraw(tokenAddress);
            const receipt = await tx.wait();
            
            logger.info('Ritiro di emergenza completato', {
                txHash: receipt.transactionHash,
                tokenAddress
            });
            
        } catch (error) {
            logger.error('Errore durante ritiro di emergenza:', {
                error: error.message,
                stack: error.stack,
                tokenAddress
            });
        }
    }
}

// Gestione graceful shutdown
process.on('SIGINT', () => {
    logger.info('Ricevuto SIGINT, arresto bot...');
    if (global.bot) {
        global.bot.stop();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Ricevuto SIGTERM, arresto bot...');
    if (global.bot) {
        global.bot.stop();
    }
    process.exit(0);
});

// Avvio bot
async function main() {
    try {
        logger.info('=== AVVIO CRYPTO ARBITRAGE BOT ===');
        
        const bot = new ArbitrageBot();
        global.bot = bot;
        
        await bot.initialize();
        await bot.startMonitoring();
        
        logger.info('Bot avviato con successo e in esecuzione...');
        
    } catch (error) {
        logger.error('Errore fatale durante avvio:', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
    main();
}

module.exports = { ArbitrageBot }; 