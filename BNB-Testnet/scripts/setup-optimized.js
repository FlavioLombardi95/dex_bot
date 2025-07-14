#!/usr/bin/env node

const { ethers } = require('ethers');
const ConfigManager = require('../core/config');
const Logger = require('../core/logger');
const ConnectionPool = require('../core/connection-pool');

class OptimizedSetup {
    constructor() {
        this.config = new ConfigManager();
        this.logger = Logger.getLogger('setup');
        this.pool = new ConnectionPool();
        this.testResults = [];
    }

    async runFullSetup() {
        this.logger.info('🚀 Avvio setup completo DEX Arbitrage Bot');
        
        try {
            // Tests di base
            await this.testConfiguration();
            await this.testNetworkConnection();
            await this.testWalletSetup();
            await this.testDEXConnections();
            await this.testTokenContracts();
            await this.testGasEstimation();
            
            // Test avanzati
            await this.testArbitrageContract();
            await this.testPriceFeeds();
            await this.testDatabaseConnection();
            
            // Genera report finale
            const report = this.generateSetupReport();
            await this.saveSetupReport(report);
            
            this.printSetupSummary(report);
            
            return report;
            
        } catch (error) {
            this.logger.error('❌ Setup fallito', { 
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async testConfiguration() {
        this.logger.info('📋 Test configurazione...');
        
        const test = {
            name: 'Configuration',
            status: 'success',
            details: [],
            errors: []
        };
        
        try {
            // Valida configurazione
            const errors = this.config.validate();
            if (errors.length > 0) {
                test.status = 'error';
                test.errors = errors;
                this.logger.error('❌ Errori di configurazione', { errors });
            } else {
                this.logger.info('✅ Configurazione valida');
                test.details.push('Configurazione valida');
            }
            
            // Verifica variabili ambiente
            const envVars = ['PRIVATE_KEY', 'BSC_TESTNET_RPC_URL'];
            const missingVars = envVars.filter(v => !process.env[v]);
            
            if (missingVars.length > 0) {
                test.status = 'error';
                test.errors.push(`Variabili ambiente mancanti: ${missingVars.join(', ')}`);
                this.logger.error('❌ Variabili ambiente mancanti', { missingVars });
            } else {
                test.details.push('Variabili ambiente configurate');
            }
            
        } catch (error) {
            test.status = 'error';
            test.errors.push(error.message);
            this.logger.error('❌ Errore test configurazione', { error: error.message });
        }
        
        this.testResults.push(test);
    }

    async testNetworkConnection() {
        this.logger.info('🔗 Test connessione network...');
        
        const test = {
            name: 'Network Connection',
            status: 'success',
            details: [],
            errors: []
        };
        
        try {
            const provider = this.pool.getProvider();
            const network = await provider.getNetwork();
            
            this.logger.info('✅ Connesso alla rete', {
                name: network.name,
                chainId: network.chainId,
                expectedChainId: this.config.network.chainId
            });
            
            // Verifica chain ID corretto
            if (network.chainId !== this.config.network.chainId) {
                test.status = 'error';
                test.errors.push(`Chain ID non corretto: ${network.chainId} vs ${this.config.network.chainId}`);
            } else {
                test.details.push(`Network: ${network.name} (${network.chainId})`);
            }
            
            // Test latenza
            const startTime = Date.now();
            await provider.getBlockNumber();
            const latency = Date.now() - startTime;
            
            test.details.push(`Latenza: ${latency}ms`);
            
            if (latency > 1000) {
                test.status = 'warning';
                test.errors.push('Latenza elevata (>1000ms)');
            }
            
        } catch (error) {
            test.status = 'error';
            test.errors.push(error.message);
            this.logger.error('❌ Errore connessione network', { error: error.message });
        }
        
        this.testResults.push(test);
    }

    async testWalletSetup() {
        this.logger.info('💳 Test wallet...');
        
        const test = {
            name: 'Wallet Setup',
            status: 'success',
            details: [],
            errors: []
        };
        
        try {
            const provider = this.pool.getProvider();
            const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
            
            this.logger.info('✅ Wallet configurato', { 
                address: wallet.address 
            });
            
            // Verifica saldo
            const balance = await provider.getBalance(wallet.address);
            const balanceFormatted = ethers.utils.formatEther(balance);
            
            test.details.push(`Indirizzo: ${wallet.address}`);
            test.details.push(`Saldo: ${balanceFormatted} ${this.config.network.currency}`);
            
            // Verifica saldo minimo
            const minBalance = 0.01; // Minimum balance richiesto
            if (parseFloat(balanceFormatted) < minBalance) {
                test.status = 'warning';
                test.errors.push(`Saldo basso: ${balanceFormatted} ${this.config.network.currency} (min: ${minBalance})`);
                this.logger.warn('⚠️ Saldo basso', { 
                    balance: balanceFormatted,
                    minimum: minBalance,
                    currency: this.config.network.currency
                });
            }
            
        } catch (error) {
            test.status = 'error';
            test.errors.push(error.message);
            this.logger.error('❌ Errore wallet setup', { error: error.message });
        }
        
        this.testResults.push(test);
    }

    async testDEXConnections() {
        this.logger.info('🔄 Test connessioni DEX...');
        
        const test = {
            name: 'DEX Connections',
            status: 'success',
            details: [],
            errors: []
        };
        
        try {
            const provider = this.pool.getProvider();
            
            for (const [dexName, dexConfig] of Object.entries(this.config.dex)) {
                this.logger.info(`🔍 Test ${dexName}...`, { 
                    router: dexConfig.router,
                    factory: dexConfig.factory
                });
                
                try {
                    // Test router contract
                    const routerContract = new ethers.Contract(
                        dexConfig.router,
                        [
                            'function factory() view returns (address)',
                            'function WETH() view returns (address)',
                            'function getAmountsOut(uint256 amountIn, address[] calldata path) view returns (uint256[] memory amounts)'
                        ],
                        provider
                    );
                    
                    const factory = await routerContract.factory();
                    const weth = await routerContract.WETH();
                    
                    test.details.push(`${dexName}: Router OK`);
                    test.details.push(`  Factory: ${factory}`);
                    test.details.push(`  WETH: ${weth}`);
                    
                    // Test factory contract
                    const factoryContract = new ethers.Contract(
                        factory,
                        [
                            'function allPairsLength() view returns (uint256)',
                            'function getPair(address tokenA, address tokenB) view returns (address pair)'
                        ],
                        provider
                    );
                    
                    const pairsLength = await factoryContract.allPairsLength();
                    test.details.push(`  Pairs: ${pairsLength}`);
                    
                    this.logger.info(`✅ ${dexName} connesso`, {
                        factory: factory,
                        weth: weth,
                        pairs: pairsLength.toString()
                    });
                    
                } catch (error) {
                    test.status = 'error';
                    test.errors.push(`${dexName}: ${error.message}`);
                    this.logger.error(`❌ Errore ${dexName}`, { error: error.message });
                }
            }
            
        } catch (error) {
            test.status = 'error';
            test.errors.push(error.message);
            this.logger.error('❌ Errore test DEX', { error: error.message });
        }
        
        this.testResults.push(test);
    }

    async testTokenContracts() {
        this.logger.info('🪙 Test contratti token...');
        
        const test = {
            name: 'Token Contracts',
            status: 'success',
            details: [],
            errors: []
        };
        
        try {
            const provider = this.pool.getProvider();
            
            for (const [tokenSymbol, tokenConfig] of Object.entries(this.config.tokens)) {
                this.logger.info(`🔍 Test token ${tokenSymbol}...`, { 
                    address: tokenConfig.address 
                });
                
                try {
                    const tokenContract = new ethers.Contract(
                        tokenConfig.address,
                        [
                            'function name() view returns (string)',
                            'function symbol() view returns (string)',
                            'function decimals() view returns (uint8)',
                            'function totalSupply() view returns (uint256)'
                        ],
                        provider
                    );
                    
                    const name = await tokenContract.name();
                    const symbol = await tokenContract.symbol();
                    const decimals = await tokenContract.decimals();
                    const totalSupply = await tokenContract.totalSupply();
                    
                    test.details.push(`${tokenSymbol}: ${name} (${symbol})`);
                    test.details.push(`  Decimals: ${decimals}`);
                    test.details.push(`  Supply: ${ethers.utils.formatUnits(totalSupply, decimals)}`);
                    
                    this.logger.info(`✅ Token ${tokenSymbol} valido`, {
                        name: name,
                        symbol: symbol,
                        decimals: decimals
                    });
                    
                } catch (error) {
                    test.status = 'error';
                    test.errors.push(`${tokenSymbol}: ${error.message}`);
                    this.logger.error(`❌ Errore token ${tokenSymbol}`, { error: error.message });
                }
            }
            
        } catch (error) {
            test.status = 'error';
            test.errors.push(error.message);
            this.logger.error('❌ Errore test token', { error: error.message });
        }
        
        this.testResults.push(test);
    }

    async testGasEstimation() {
        this.logger.info('⛽ Test stima gas...');
        
        const test = {
            name: 'Gas Estimation',
            status: 'success',
            details: [],
            errors: []
        };
        
        try {
            const provider = this.pool.getProvider();
            const gasPrice = await provider.getGasPrice();
            const gasPriceGwei = ethers.utils.formatUnits(gasPrice, 'gwei');
            
            test.details.push(`Gas Price: ${gasPriceGwei} gwei`);
            test.details.push(`Gas Limit: ${this.config.trading.gasLimit}`);
            
            // Calcola costo stimato
            const estimatedCost = gasPrice.mul(this.config.trading.gasLimit);
            const costFormatted = ethers.utils.formatEther(estimatedCost);
            
            test.details.push(`Costo stimato: ${costFormatted} ${this.config.network.currency}`);
            
            // Verifica gas price ragionevole
            const maxGasPrice = 50; // 50 gwei max
            if (parseFloat(gasPriceGwei) > maxGasPrice) {
                test.status = 'warning';
                test.errors.push(`Gas price elevato: ${gasPriceGwei} gwei (max consigliato: ${maxGasPrice})`);
            }
            
            this.logger.info('✅ Gas estimation OK', {
                gasPrice: gasPriceGwei + ' gwei',
                gasLimit: this.config.trading.gasLimit,
                estimatedCost: costFormatted + ' ' + this.config.network.currency
            });
            
        } catch (error) {
            test.status = 'error';
            test.errors.push(error.message);
            this.logger.error('❌ Errore gas estimation', { error: error.message });
        }
        
        this.testResults.push(test);
    }

    async testArbitrageContract() {
        this.logger.info('📄 Test contratto arbitraggio...');
        
        const test = {
            name: 'Arbitrage Contract',
            status: 'success',
            details: [],
            errors: []
        };
        
        try {
            const fs = require('fs');
            const path = require('path');
            const contractPath = path.join(__dirname, '..', 'deployed-contracts.json');
            
            if (!fs.existsSync(contractPath)) {
                test.status = 'warning';
                test.errors.push('Contratto non ancora deployato');
                this.logger.warn('⚠️ Contratto non deployato');
            } else {
                const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
                const networkContract = contractData[this.config.network.name];
                
                if (!networkContract) {
                    test.status = 'warning';
                    test.errors.push('Contratto non deployato per questa rete');
                } else {
                    test.details.push(`Indirizzo: ${networkContract.address}`);
                    test.details.push(`Deploy: ${networkContract.deployedAt}`);
                    
                    // Test contratto
                    const provider = this.pool.getProvider();
                    const code = await provider.getCode(networkContract.address);
                    
                    if (code === '0x') {
                        test.status = 'error';
                        test.errors.push('Contratto non trovato alla blockchain');
                    } else {
                        test.details.push(`Code size: ${code.length} bytes`);
                        this.logger.info('✅ Contratto arbitraggio OK', {
                            address: networkContract.address,
                            codeSize: code.length
                        });
                    }
                }
            }
            
        } catch (error) {
            test.status = 'error';
            test.errors.push(error.message);
            this.logger.error('❌ Errore test contratto', { error: error.message });
        }
        
        this.testResults.push(test);
    }

    async testPriceFeeds() {
        this.logger.info('💰 Test price feeds...');
        
        const test = {
            name: 'Price Feeds',
            status: 'success',
            details: [],
            errors: []
        };
        
        try {
            // Test semplice di ottenimento prezzi
            const provider = this.pool.getProvider();
            const routerAddress = this.config.dex.pancakeswap.router;
            
            const routerContract = new ethers.Contract(
                routerAddress,
                [
                    'function getAmountsOut(uint256 amountIn, address[] calldata path) view returns (uint256[] memory amounts)'
                ],
                provider
            );
            
            // Test path WBNB -> USDT
            const wbnbAddress = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd';
            const usdtAddress = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
            const amountIn = ethers.utils.parseEther('1'); // 1 WBNB
            
            const amounts = await routerContract.getAmountsOut(amountIn, [wbnbAddress, usdtAddress]);
            const priceOut = ethers.utils.formatUnits(amounts[1], 6); // USDT ha 6 decimali
            
            test.details.push(`Test price: 1 WBNB = ${priceOut} USDT`);
            
            this.logger.info('✅ Price feeds OK', {
                testPrice: `1 WBNB = ${priceOut} USDT`
            });
            
        } catch (error) {
            test.status = 'error';
            test.errors.push(error.message);
            this.logger.error('❌ Errore price feeds', { error: error.message });
        }
        
        this.testResults.push(test);
    }

    async testDatabaseConnection() {
        this.logger.info('🗄️ Test database...');
        
        const test = {
            name: 'Database Connection',
            status: 'success',
            details: [],
            errors: []
        };
        
        try {
            const dbConfig = this.config.database;
            
            if (dbConfig.type === 'sqlite') {
                const sqlite3 = require('sqlite3').verbose();
                const db = new sqlite3.Database(dbConfig.sqlite.path);
                
                // Test query
                await new Promise((resolve, reject) => {
                    db.get('SELECT 1', (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
                
                test.details.push(`SQLite: ${dbConfig.sqlite.path}`);
                db.close();
                
                this.logger.info('✅ Database SQLite OK');
            }
            
        } catch (error) {
            test.status = 'error';
            test.errors.push(error.message);
            this.logger.error('❌ Errore database', { error: error.message });
        }
        
        this.testResults.push(test);
    }

    generateSetupReport() {
        const successCount = this.testResults.filter(t => t.status === 'success').length;
        const warningCount = this.testResults.filter(t => t.status === 'warning').length;
        const errorCount = this.testResults.filter(t => t.status === 'error').length;
        
        return {
            timestamp: new Date().toISOString(),
            network: this.config.network.name,
            summary: {
                total: this.testResults.length,
                success: successCount,
                warnings: warningCount,
                errors: errorCount,
                overallStatus: errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'success'
            },
            tests: this.testResults
        };
    }

    async saveSetupReport(report) {
        const fs = require('fs');
        const path = require('path');
        
        const reportsDir = path.join(__dirname, '..', 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        const filename = `setup-report-${Date.now()}.json`;
        const filepath = path.join(reportsDir, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
        
        this.logger.info('📁 Report setup salvato', { path: filepath });
    }

    printSetupSummary(report) {
        console.log('\n🎯 RIASSUNTO SETUP');
        console.log('==================');
        console.log(`⏰ Timestamp: ${report.timestamp}`);
        console.log(`🌐 Network: ${report.network}`);
        console.log(`✅ Successi: ${report.summary.success}`);
        console.log(`⚠️ Warnings: ${report.summary.warnings}`);
        console.log(`❌ Errori: ${report.summary.errors}`);
        
        const statusIcon = report.summary.overallStatus === 'success' ? '✅' : 
                          report.summary.overallStatus === 'warning' ? '⚠️' : '❌';
        console.log(`${statusIcon} Status: ${report.summary.overallStatus.toUpperCase()}`);
        
        if (report.summary.errors > 0) {
            console.log('\n❌ ERRORI DA RISOLVERE:');
            report.tests.filter(t => t.status === 'error').forEach(test => {
                console.log(`  • ${test.name}: ${test.errors.join(', ')}`);
            });
        }
        
        if (report.summary.warnings > 0) {
            console.log('\n⚠️ WARNINGS:');
            report.tests.filter(t => t.status === 'warning').forEach(test => {
                console.log(`  • ${test.name}: ${test.errors.join(', ')}`);
            });
        }
    }
}

async function main() {
    const setup = new OptimizedSetup();
    
    try {
        console.log('🔧 Avvio Setup DEX Arbitrage Bot\n');
        
        const report = await setup.runFullSetup();
        
        if (report.summary.overallStatus === 'success') {
            console.log('\n🎉 Setup completato con successo!');
            console.log('🚀 Il bot è pronto per essere avviato');
        } else {
            console.log('\n⚠️ Setup completato con problemi');
            console.log('🔧 Risolvi i problemi evidenziati prima di avviare il bot');
        }
        
        console.log('📊 Report dettagliato salvato in ./reports/');
        
    } catch (error) {
        console.error('💥 Setup fallito:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { OptimizedSetup }; 