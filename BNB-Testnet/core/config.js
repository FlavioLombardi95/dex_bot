const { ethers } = require('ethers');
const path = require('path');

class ConfigManager {
    constructor() {
        this.loadEnvironment();
        this.validateConfig();
        this.initializeProviders();
    }

    loadEnvironment() {
        require('dotenv').config({ path: path.join(__dirname, '../.env') });
    }

    // Network Configuration
    getNetworkConfig() {
        return {
            bscTestnet: {
                name: 'BSC Testnet',
                chainId: 97,
                rpcUrls: [
                    'https://data-seed-prebsc-1-s1.binance.org:8545',
                    'https://data-seed-prebsc-2-s1.binance.org:8545',
                    'https://data-seed-prebsc-1-s2.binance.org:8545',
                    'https://data-seed-prebsc-2-s2.binance.org:8545'
                ],
                currency: 'BNB',
                blockExplorer: 'https://testnet.bscscan.com',
                nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18
                },
                blockTime: 3000, // 3 secondi
                finalityBlocks: 15
            },
            bscMainnet: {
                name: 'BSC Mainnet',
                chainId: 56,
                rpcUrls: [
                    'https://bsc-dataseed.binance.org/',
                    'https://bsc-dataseed1.defibit.io/',
                    'https://bsc-dataseed1.ninicoin.io/',
                    'https://bsc-dataseed2.defibit.io/'
                ],
                currency: 'BNB',
                blockExplorer: 'https://bscscan.com',
                nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18
                },
                blockTime: 3000,
                finalityBlocks: 15
            }
        };
    }

    // DEX Configuration
    getDexConfig() {
        return {
            pancakeswap: {
                name: 'PancakeSwap V2',
                router: {
                    testnet: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
                    mainnet: '0x10ED43C718714eb63d5aA57B78B54704E256024E'
                },
                factory: {
                    testnet: '0x6725f303b657a9451d8ba641348b6761a6cc7a17',
                    mainnet: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
                },
                fee: 0.0025, // 0.25%
                enabled: true
            },
            bakeryswap: {
                name: 'BakerySwap',
                router: {
                    testnet: '0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F',
                    mainnet: '0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F'
                },
                factory: {
                    testnet: '0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7',
                    mainnet: '0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7'
                },
                fee: 0.003, // 0.3%
                enabled: false
            }
        };
    }

    // Token Configuration
    getTokenConfig() {
        return {
            // Native tokens
            BNB: {
                address: '0x0000000000000000000000000000000000000000',
                symbol: 'BNB',
                name: 'Binance Coin',
                decimals: 18,
                isNative: true,
                category: 'native'
            },
            // Wrapped tokens
            WBNB: {
                address: {
                    testnet: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
                    mainnet: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
                },
                symbol: 'WBNB',
                name: 'Wrapped BNB',
                decimals: 18,
                isWrapped: true,
                category: 'wrapped'
            },
            // Stablecoins
            BUSD: {
                address: {
                    testnet: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
                    mainnet: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
                },
                symbol: 'BUSD',
                name: 'Binance USD',
                decimals: 18,
                isStable: true,
                category: 'stablecoin'
            },
            USDT: {
                address: {
                    testnet: '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684',
                    mainnet: '0x55d398326f99059fF775485246999027B3197955'
                },
                symbol: 'USDT',
                name: 'Tether USD',
                decimals: 18,
                isStable: true,
                category: 'stablecoin'
            },
            USDC: {
                address: {
                    testnet: '0x64544969ed7EBf5f083679233325356EbE738930',
                    mainnet: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
                },
                symbol: 'USDC',
                name: 'USD Coin',
                decimals: 18,
                isStable: true,
                category: 'stablecoin'
            },
            // DeFi tokens
            CAKE: {
                address: {
                    testnet: '0xFa60D973F7642B748046464e165A65B7323b0DEE',
                    mainnet: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'
                },
                symbol: 'CAKE',
                name: 'PancakeSwap Token',
                decimals: 18,
                category: 'defi'
            },
            // Alt tokens
            ADA: {
                address: {
                    testnet: '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5',
                    mainnet: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47'
                },
                symbol: 'ADA',
                name: 'Cardano',
                decimals: 18,
                category: 'alt'
            }
        };
    }

    // Trading Configuration
    getTradingConfig() {
        return {
            arbitrage: {
                triangular: {
                    enabled: true,
                    minProfitPercentage: parseFloat(process.env.MIN_TRIANGULAR_PROFIT) || 0.1,
                    maxSlippage: parseFloat(process.env.MAX_TRIANGULAR_SLIPPAGE) || 2.0,
                    minAmount: parseFloat(process.env.MIN_TRIANGULAR_AMOUNT) || 0.001,
                    maxAmount: parseFloat(process.env.MAX_TRIANGULAR_AMOUNT) || 1.0,
                    paths: [
                        {
                            id: 'bnb-cake-busd',
                            tokens: ['WBNB', 'CAKE', 'BUSD', 'WBNB'],
                            priority: 1,
                            avgLoss: 0.87,
                            enabled: true
                        },
                        {
                            id: 'bnb-busd-usdt',
                            tokens: ['WBNB', 'BUSD', 'USDT', 'WBNB'],
                            priority: 2,
                            avgLoss: 1.20,
                            enabled: true
                        },
                        {
                            id: 'cake-busd-usdt',
                            tokens: ['CAKE', 'BUSD', 'USDT', 'CAKE'],
                            priority: 3,
                            avgLoss: 0.68,
                            enabled: true
                        }
                    ]
                }
            },
            gas: {
                limit: parseInt(process.env.GAS_LIMIT) || 300000,
                price: parseInt(process.env.GAS_PRICE_GWEI) || 5,
                priorityFee: parseInt(process.env.PRIORITY_FEE_GWEI) || 1,
                multiplier: parseFloat(process.env.GAS_MULTIPLIER) || 1.2,
                maxPrice: parseInt(process.env.MAX_GAS_PRICE_GWEI) || 20
            },
            risk: {
                maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS) || 3,
                retryDelay: parseInt(process.env.RETRY_DELAY_MS) || 1000,
                maxDailyLoss: parseFloat(process.env.MAX_DAILY_LOSS) || 0.1,
                emergencyStopLoss: parseFloat(process.env.EMERGENCY_STOP_LOSS) || 0.05,
                enableSandwichProtection: process.env.ENABLE_SANDWICH_PROTECTION === 'true',
                enableMevProtection: process.env.ENABLE_MEV_PROTECTION === 'true'
            }
        };
    }

    // Monitoring Configuration
    getMonitoringConfig() {
        return {
            scanning: {
                triangularInterval: parseInt(process.env.TRIANGULAR_SCAN_INTERVAL) || 3000,
                priceCheckInterval: parseInt(process.env.PRICE_CHECK_INTERVAL) || 5000,
                newTokensInterval: parseInt(process.env.NEW_TOKENS_INTERVAL) || 30000,
                opportunityThreshold: parseFloat(process.env.OPPORTUNITY_THRESHOLD) || 0.1
            },
            caching: {
                enabled: process.env.ENABLE_CACHING === 'true',
                ttl: parseInt(process.env.CACHE_TTL_SECONDS) || 30,
                maxEntries: parseInt(process.env.MAX_CACHE_ENTRIES) || 1000
            },
            performance: {
                parallelRequests: parseInt(process.env.PARALLEL_REQUESTS) || 5,
                batchSize: parseInt(process.env.BATCH_SIZE) || 10,
                maxConcurrentExecutions: parseInt(process.env.MAX_CONCURRENT_EXECUTIONS) || 1
            }
        };
    }

    // Logging Configuration
    getLoggingConfig() {
        return {
            level: process.env.LOG_LEVEL || 'info',
            files: {
                main: process.env.LOG_FILE || 'logs/main.log',
                errors: process.env.ERROR_LOG_FILE || 'logs/errors.log',
                opportunities: process.env.OPPORTUNITY_LOG_FILE || 'logs/opportunities.log',
                profits: process.env.PROFIT_LOG_FILE || 'logs/profits.log',
                analytics: process.env.ANALYTICS_LOG_FILE || 'logs/analytics.log'
            },
            maxSize: process.env.LOG_MAX_SIZE || '10m',
            maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
            enableConsole: process.env.ENABLE_CONSOLE_LOGGING !== 'false'
        };
    }

    // Database Configuration
    getDatabaseConfig() {
        return {
            sqlite: {
                path: process.env.SQLITE_PATH || './data/arbitrage.db',
                enabled: process.env.ENABLE_SQLITE !== 'false'
            },
            redis: {
                url: process.env.REDIS_URL,
                enabled: !!process.env.REDIS_URL
            },
            mongodb: {
                url: process.env.MONGODB_URL,
                database: process.env.MONGODB_DATABASE || 'arbitrage',
                enabled: !!process.env.MONGODB_URL
            }
        };
    }

    // API Configuration
    getApiConfig() {
        return {
            external: {
                moralis: process.env.MORALIS_API_KEY,
                alchemy: process.env.ALCHEMY_API_KEY,
                infura: process.env.INFURA_PROJECT_ID,
                bscscan: process.env.BSCSCAN_API_KEY,
                coingecko: process.env.COINGECKO_API_KEY
            },
            internal: {
                port: parseInt(process.env.API_PORT) || 3000,
                enabled: process.env.ENABLE_API !== 'false',
                cors: process.env.ENABLE_CORS !== 'false',
                rateLimit: {
                    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
                    max: parseInt(process.env.RATE_LIMIT_MAX) || 100
                }
            }
        };
    }

    // Notification Configuration
    getNotificationConfig() {
        return {
            telegram: {
                botToken: process.env.TELEGRAM_BOT_TOKEN,
                chatId: process.env.TELEGRAM_CHAT_ID,
                enabled: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
            },
            discord: {
                webhookUrl: process.env.DISCORD_WEBHOOK_URL,
                enabled: !!process.env.DISCORD_WEBHOOK_URL
            },
            email: {
                smtp: {
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT) || 587,
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                },
                from: process.env.EMAIL_FROM,
                to: process.env.EMAIL_TO,
                enabled: !!(process.env.SMTP_HOST && process.env.EMAIL_FROM && process.env.EMAIL_TO)
            }
        };
    }

    // Utility Methods
    getCurrentNetwork() {
        return process.env.NETWORK || 'bscTestnet';
    }

    isMainnet() {
        return this.getCurrentNetwork().includes('mainnet');
    }

    isTestnet() {
        return this.getCurrentNetwork().includes('testnet') || this.getCurrentNetwork().includes('test');
    }

    getTokenAddress(symbol) {
        const token = this.getTokenConfig()[symbol];
        if (!token) return null;
        
        if (token.address && typeof token.address === 'object') {
            return token.address[this.isMainnet() ? 'mainnet' : 'testnet'];
        }
        return token.address;
    }

    getDexAddress(dexName, type) {
        const dex = this.getDexConfig()[dexName];
        if (!dex) return null;
        
        return dex[type][this.isMainnet() ? 'mainnet' : 'testnet'];
    }

    validateConfig() {
        const required = ['PRIVATE_KEY'];
        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        if (!process.env.PRIVATE_KEY.startsWith('0x')) {
            process.env.PRIVATE_KEY = '0x' + process.env.PRIVATE_KEY;
        }
    }

    initializeProviders() {
        const networkConfig = this.getNetworkConfig()[this.getCurrentNetwork()];
        this.providers = networkConfig.rpcUrls.map(url => 
            new ethers.providers.JsonRpcProvider(url)
        );
        this.currentProviderIndex = 0;
    }

    getProvider() {
        return this.providers[this.currentProviderIndex];
    }

    async switchProvider() {
        this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
        return this.getProvider();
    }

    getWallet() {
        return new ethers.Wallet(process.env.PRIVATE_KEY, this.getProvider());
    }

    // Get complete configuration
    getConfig() {
        return {
            network: this.getNetworkConfig()[this.getCurrentNetwork()],
            dex: this.getDexConfig(),
            tokens: this.getTokenConfig(),
            trading: this.getTradingConfig(),
            monitoring: this.getMonitoringConfig(),
            logging: this.getLoggingConfig(),
            database: this.getDatabaseConfig(),
            api: this.getApiConfig(),
            notifications: this.getNotificationConfig(),
            environment: {
                isDevelopment: process.env.NODE_ENV === 'development',
                isProduction: process.env.NODE_ENV === 'production',
                isTestnet: this.isTestnet(),
                isMainnet: this.isMainnet(),
                dryRun: process.env.DRY_RUN === 'true'
            }
        };
    }
}

module.exports = new ConfigManager(); 