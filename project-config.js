#!/usr/bin/env node

/**
 * PROJECT CONFIGURATION - DEX ARBITRAGE BOT
 * =========================================
 * 
 * Configurazione unificata multi-network per arbitraggio DEX
 * Supporta BSC Testnet, Polygon Amoy e futuro scaling
 */

const path = require('path');
const fs = require('fs');

class ProjectConfig {
    constructor() {
        this.projectRoot = __dirname;
        this.networks = this.initializeNetworks();
        this.sharedConfig = this.initializeSharedConfig();
    }

    initializeNetworks() {
        return {
            'bsc-testnet': {
                name: 'BSC Testnet',
                chainId: 97,
                currency: 'BNB',
                path: 'BNB-Testnet',
                rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
                explorer: 'https://testnet.bscscan.com',
                dex: {
                    pancakeswap: {
                        name: 'PancakeSwap',
                        router: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
                        factory: '0x6725F303b657a9451d8BA641348b6761A6CC7a17',
                        initCodeHash: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f'
                    }
                },
                tokens: {
                    WBNB: {
                        address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
                        symbol: 'WBNB',
                        decimals: 18
                    },
                    USDT: {
                        address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
                        symbol: 'USDT',
                        decimals: 6
                    },
                    BUSD: {
                        address: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
                        symbol: 'BUSD',
                        decimals: 18
                    }
                },
                faucets: [
                    'https://testnet.binance.org/faucet-smart'
                ],
                status: 'active'
            },
            'polygon-amoy': {
                name: 'Polygon Amoy',
                chainId: 80002,
                currency: 'POL',
                path: 'POL-Amoy',
                rpc: 'https://rpc-amoy.polygon.technology',
                explorer: 'https://www.oklink.com/amoy',
                dex: {
                    quickswap: {
                        name: 'QuickSwap',
                        router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
                        factory: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
                        initCodeHash: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f'
                    }
                },
                tokens: {
                    WMATIC: {
                        address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
                        symbol: 'WMATIC',
                        decimals: 18
                    },
                    USDC: {
                        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                        symbol: 'USDC',
                        decimals: 6
                    },
                    USDT: {
                        address: '0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756',
                        symbol: 'USDT',
                        decimals: 6
                    }
                },
                faucets: [
                    'https://faucet.polygon.technology'
                ],
                status: 'active'
            },
            // Preparato per future network
            'ethereum-mainnet': {
                name: 'Ethereum Mainnet',
                chainId: 1,
                currency: 'ETH',
                path: 'ETH-Mainnet',
                rpc: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
                explorer: 'https://etherscan.io',
                dex: {
                    uniswap: {
                        name: 'Uniswap V2',
                        router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
                        factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
                        initCodeHash: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f'
                    },
                    sushiswap: {
                        name: 'SushiSwap',
                        router: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
                        factory: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
                        initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303'
                    }
                },
                tokens: {
                    WETH: {
                        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                        symbol: 'WETH',
                        decimals: 18
                    },
                    USDC: {
                        address: '0xA0b86a33E6417c0c1B44d1e4a95d8E93f6B7b4F6',
                        symbol: 'USDC',
                        decimals: 6
                    },
                    USDT: {
                        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                        symbol: 'USDT',
                        decimals: 6
                    }
                },
                faucets: [],
                status: 'future'
            },
            'arbitrum-one': {
                name: 'Arbitrum One',
                chainId: 42161,
                currency: 'ETH',
                path: 'ARB-One',
                rpc: 'https://arb1.arbitrum.io/rpc',
                explorer: 'https://arbiscan.io',
                dex: {
                    uniswap: {
                        name: 'Uniswap V3',
                        router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
                        factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
                        initCodeHash: '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54'
                    }
                },
                tokens: {
                    WETH: {
                        address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
                        symbol: 'WETH',
                        decimals: 18
                    },
                    USDC: {
                        address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
                        symbol: 'USDC',
                        decimals: 6
                    }
                },
                faucets: [],
                status: 'future'
            }
        };
    }

    initializeSharedConfig() {
        return {
            // Trading defaults
            trading: {
                slippage: 0.5,
                gasLimit: 300000,
                gasPrice: 20,
                mevProtection: true,
                maxTradeSize: 10,
                minProfitUSD: 1
            },
            
            // Monitoring defaults
            monitoring: {
                scanInterval: 5000,
                healthCheckInterval: 30000,
                logLevel: 'info',
                maxRetries: 3,
                timeout: 10000
            },
            
            // API defaults
            api: {
                port: 3000,
                rateLimit: 100,
                cors: true,
                auth: false
            },
            
            // Database defaults
            database: {
                type: 'sqlite',
                sqlite: {
                    path: './bot-data.db'
                },
                redis: {
                    host: 'localhost',
                    port: 6379,
                    password: null
                }
            },
            
            // Notification defaults
            notifications: {
                telegram: {
                    enabled: false,
                    botToken: null,
                    chatId: null
                },
                discord: {
                    enabled: false,
                    webhookUrl: null
                },
                email: {
                    enabled: false,
                    smtp: {
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false,
                        user: null,
                        password: null
                    }
                }
            },
            
            // Security defaults
            security: {
                encryptPrivateKeys: true,
                useHardwareWallet: false,
                multisigRequired: false,
                maxSlippage: 5,
                emergencyStop: true
            }
        };
    }

    getAvailableNetworks() {
        return Object.entries(this.networks)
            .filter(([key, config]) => config.status === 'active')
            .map(([key, config]) => ({
                key,
                name: config.name,
                chainId: config.chainId,
                currency: config.currency,
                path: config.path
            }));
    }

    getNetworkConfig(networkKey) {
        if (!this.networks[networkKey]) {
            throw new Error(`Network non supportato: ${networkKey}`);
        }
        
        return {
            ...this.networks[networkKey],
            shared: this.sharedConfig
        };
    }

    getNetworkPath(networkKey) {
        const config = this.getNetworkConfig(networkKey);
        return path.join(this.projectRoot, config.path);
    }

    validateNetwork(networkKey) {
        const config = this.getNetworkConfig(networkKey);
        const networkPath = this.getNetworkPath(networkKey);
        
        const errors = [];
        
        // Verifica esistenza directory
        if (!fs.existsSync(networkPath)) {
            errors.push(`Directory non trovata: ${networkPath}`);
        }
        
        // Verifica file essenziali
        const requiredFiles = [
            'package.json',
            'hardhat.config.js',
            'README.md',
            'core/config.js',
            'core/logger.js',
            'bot/index.js'
        ];
        
        requiredFiles.forEach(file => {
            const filePath = path.join(networkPath, file);
            if (!fs.existsSync(filePath)) {
                errors.push(`File mancante: ${file}`);
            }
        });
        
        return {
            valid: errors.length === 0,
            errors,
            networkPath
        };
    }

    async initializeNetwork(networkKey) {
        console.log(`🚀 Inizializzazione network: ${networkKey}`);
        
        const config = this.getNetworkConfig(networkKey);
        const networkPath = this.getNetworkPath(networkKey);
        
        // Crea directory se non esiste
        if (!fs.existsSync(networkPath)) {
            fs.mkdirSync(networkPath, { recursive: true });
            console.log(`📁 Creata directory: ${networkPath}`);
        }
        
        // Crea struttura base
        const directories = [
            'core',
            'bot',
            'scripts',
            'contracts',
            'test',
            'reports',
            'scanners'
        ];
        
        directories.forEach(dir => {
            const dirPath = path.join(networkPath, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`📁 Creata directory: ${dir}`);
            }
        });
        
        // Crea file di configurazione specifici
        await this.createNetworkFiles(networkKey, config);
        
        console.log(`✅ Network ${networkKey} inizializzato`);
    }

    async createNetworkFiles(networkKey, config) {
        const networkPath = this.getNetworkPath(networkKey);
        
        // Crea package.json specifico
        const packageJson = {
            name: `${networkKey}-arbitrage-bot`,
            version: '2.0.0',
            description: `Bot arbitraggio DEX per ${config.name}`,
            main: 'app.js',
            scripts: {
                start: 'node app.js',
                'start:prod': 'NODE_ENV=production node app.js',
                'setup:optimized': 'node scripts/setup-optimized.js',
                'deploy:optimized': 'npx hardhat run scripts/deploy-optimized.js',
                analyze: 'node scripts/profitability-analyzer.js'
            },
            dependencies: {
                ethers: '^5.7.2',
                winston: '^3.8.2',
                express: '^4.18.2',
                cors: '^2.8.5',
                sqlite3: '^5.1.6',
                redis: '^4.6.5',
                'express-rate-limit': '^6.7.0'
            }
        };
        
        fs.writeFileSync(
            path.join(networkPath, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );
        
        // Crea README specifico
        const readme = this.generateNetworkReadme(networkKey, config);
        fs.writeFileSync(
            path.join(networkPath, 'README.md'),
            readme
        );
    }

    generateNetworkReadme(networkKey, config) {
        return `# ${config.name} Arbitrage Bot

## Configurazione Network

- **Network**: ${config.name}
- **Chain ID**: ${config.chainId}
- **Currency**: ${config.currency}
- **RPC**: ${config.rpc}
- **Explorer**: ${config.explorer}

## DEX Supportati

${Object.entries(config.dex).map(([key, dex]) => `- **${dex.name}**: ${dex.router}`).join('\n')}

## Token Supportati

${Object.entries(config.tokens).map(([key, token]) => `- **${token.symbol}**: ${token.address}`).join('\n')}

## Setup Rapido

\`\`\`bash
# Installa dipendenze
npm install

# Setup ottimizzato
npm run setup:optimized

# Deploy contratto
npm run deploy:optimized

# Analisi profittabilità
npm run analyze

# Avvia bot
npm start
\`\`\`

## Faucet${config.faucets.length > 0 ? 's' : ''}

${config.faucets.map(faucet => `- ${faucet}`).join('\n') || 'N/A'}

## Struttura Progetto

\`\`\`
${networkKey}/
├── core/           # Infrastruttura core
├── bot/            # Bot principale
├── scripts/        # Script ottimizzati
├── contracts/      # Smart contracts
├── scanners/       # Scanner specializzati
├── test/           # Test suite
└── reports/        # Report e analytics
\`\`\`
`;
    }

    async synchronizeNetworks() {
        console.log('🔄 Sincronizzazione network...');
        
        const activeNetworks = this.getAvailableNetworks();
        
        for (const network of activeNetworks) {
            console.log(`🔍 Controllo ${network.key}...`);
            
            const validation = this.validateNetwork(network.key);
            
            if (!validation.valid) {
                console.log(`⚠️ Problemi trovati in ${network.key}:`);
                validation.errors.forEach(error => console.log(`  - ${error}`));
                
                // Auto-fix se possibile
                console.log(`🔧 Auto-fix ${network.key}...`);
                await this.initializeNetwork(network.key);
            } else {
                console.log(`✅ ${network.key} OK`);
            }
        }
        
        console.log('✅ Sincronizzazione completata');
    }

    getProjectStats() {
        const stats = {
            totalNetworks: Object.keys(this.networks).length,
            activeNetworks: this.getAvailableNetworks().length,
            supportedDEXs: 0,
            supportedTokens: 0,
            codebaseSize: 0
        };
        
        // Calcola statistiche
        Object.values(this.networks).forEach(config => {
            stats.supportedDEXs += Object.keys(config.dex).length;
            stats.supportedTokens += Object.keys(config.tokens).length;
        });
        
        return stats;
    }

    printProjectOverview() {
        console.log('\n🎯 PANORAMICA PROGETTO DEX BOT');
        console.log('===============================');
        
        const stats = this.getProjectStats();
        console.log(`📊 Network Totali: ${stats.totalNetworks}`);
        console.log(`✅ Network Attivi: ${stats.activeNetworks}`);
        console.log(`🔄 DEX Supportati: ${stats.supportedDEXs}`);
        console.log(`🪙 Token Supportati: ${stats.supportedTokens}`);
        
        console.log('\n🌐 NETWORK DISPONIBILI:');
        this.getAvailableNetworks().forEach(network => {
            console.log(`  ✅ ${network.name} (${network.key})`);
            console.log(`     Chain ID: ${network.chainId}`);
            console.log(`     Currency: ${network.currency}`);
            console.log(`     Path: ${network.path}`);
        });
        
        console.log('\n🔮 NETWORK FUTURI:');
        Object.entries(this.networks)
            .filter(([key, config]) => config.status === 'future')
            .forEach(([key, config]) => {
                console.log(`  ⏳ ${config.name} (${key})`);
            });
    }
}

// CLI Support
async function main() {
    const projectConfig = new ProjectConfig();
    
    const command = process.argv[2];
    const networkKey = process.argv[3];
    
    switch (command) {
        case 'overview':
            projectConfig.printProjectOverview();
            break;
            
        case 'sync':
            await projectConfig.synchronizeNetworks();
            break;
            
        case 'init':
            if (!networkKey) {
                console.error('❌ Specificare network key');
                process.exit(1);
            }
            await projectConfig.initializeNetwork(networkKey);
            break;
            
        case 'validate':
            if (!networkKey) {
                console.error('❌ Specificare network key');
                process.exit(1);
            }
            const validation = projectConfig.validateNetwork(networkKey);
            if (validation.valid) {
                console.log(`✅ ${networkKey} è valido`);
            } else {
                console.log(`❌ ${networkKey} ha problemi:`);
                validation.errors.forEach(error => console.log(`  - ${error}`));
            }
            break;
            
        case 'config':
            if (!networkKey) {
                console.error('❌ Specificare network key');
                process.exit(1);
            }
            const config = projectConfig.getNetworkConfig(networkKey);
            console.log(JSON.stringify(config, null, 2));
            break;
            
        default:
            console.log('🚀 DEX Bot Project Configuration');
            console.log('================================');
            console.log('Usage: node project-config.js <command> [network]');
            console.log('');
            console.log('Commands:');
            console.log('  overview              - Mostra panoramica progetto');
            console.log('  sync                  - Sincronizza tutti i network');
            console.log('  init <network>        - Inizializza network');
            console.log('  validate <network>    - Valida network');
            console.log('  config <network>      - Mostra configurazione network');
            console.log('');
            console.log('Available networks:');
            projectConfig.getAvailableNetworks().forEach(network => {
                console.log(`  - ${network.key} (${network.name})`);
            });
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = ProjectConfig; 