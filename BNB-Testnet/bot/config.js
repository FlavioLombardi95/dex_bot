const { ethers } = require('ethers');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../bsc-testnet.env') });

module.exports = {
  // Network Configuration
  defaultNetwork: 'bscTestnet',
  
  networks: {
    bscTestnet: {
      name: 'BSC Testnet',
      chainId: 97,
      rpcUrl: process.env.RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
      currency: 'BNB',
      blockExplorer: 'https://testnet.bscscan.com',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18
      }
    }
  },

  // Wallet Configuration
  wallet: {
    privateKey: process.env.PRIVATE_KEY,
    address: process.env.WALLET_ADDRESS
  },

  // DEX Configuration (Solo PancakeSwap per arbitraggio triangolare)
  dexes: {
    pancakeswap: {
      name: 'PancakeSwap V2',
      router: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
      factory: '0x6725f303b657a9451d8ba641348b6761a6cc7a17',
      fee: 0.0025, // 0.25%
      enabled: true
    }
  },

  // Token Configuration
  tokens: {
    BNB: {
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'BNB',
      name: 'Binance Coin',
      decimals: 18,
      isNative: true
    },
    WBNB: {
      address: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
      symbol: 'WBNB',
      name: 'Wrapped BNB',
      decimals: 18,
      isWrapped: true
    },
    BUSD: {
      address: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
      symbol: 'BUSD',
      name: 'Binance USD',
      decimals: 18,
      isStable: true
    },
    USDT: {
      address: '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 18,
      isStable: true
    },
    USDC: {
      address: '0x64544969ed7EBf5f083679233325356EbE738930',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 18,
      isStable: true
    }
  },

  // Configurazione Arbitraggio Triangolare
  triangularArbitrage: {
    enabled: true,
    // Percorsi triangolari predefiniti
    paths: [
      {
        id: 0,
        name: 'BNB-BUSD-USDT',
        tokenA: 'WBNB',
        tokenB: 'BUSD',
        tokenC: 'USDT',
        description: 'BNB → BUSD → USDT → BNB'
      },
      {
        id: 1,
        name: 'BNB-USDT-BUSD',
        tokenA: 'WBNB',
        tokenB: 'USDT',
        tokenC: 'BUSD',
        description: 'BNB → USDT → BUSD → BNB'
      },
      {
        id: 2,
        name: 'BUSD-USDT-BNB',
        tokenA: 'BUSD',
        tokenB: 'USDT',
        tokenC: 'WBNB',
        description: 'BUSD → USDT → BNB → BUSD'
      },
      {
        id: 3,
        name: 'USDT-BUSD-BNB',
        tokenA: 'USDT',
        tokenB: 'BUSD',
        tokenC: 'WBNB',
        description: 'USDT → BUSD → BNB → USDT'
      }
    ],
    // Configurazione trading
    minAmount: parseFloat(process.env.MIN_TRIANGULAR_AMOUNT) || 0.001,
    maxAmount: parseFloat(process.env.MAX_TRIANGULAR_AMOUNT) || 1.0,
    minProfitPercentage: parseFloat(process.env.MIN_TRIANGULAR_PROFIT) || 0.1,
    maxSlippage: parseFloat(process.env.MAX_TRIANGULAR_SLIPPAGE) || 2.0
  },

  // Trading Pairs (mantenuti per compatibilità)
  tradingPairs: [
    { tokenA: 'WBNB', tokenB: 'BUSD' },
    { tokenA: 'WBNB', tokenB: 'USDT' },
    { tokenA: 'BUSD', tokenB: 'USDT' },
    { tokenA: 'BUSD', tokenB: 'USDC' },
    { tokenA: 'USDT', tokenB: 'USDC' }
  ],

  // Trading Configuration
  trading: {
    minProfitPercentage: parseFloat(process.env.MIN_PROFIT_PERCENTAGE) || 0.5,
    maxSlippage: parseFloat(process.env.MAX_SLIPPAGE) || 1.0,
    gasMultiplier: parseFloat(process.env.GAS_MULTIPLIER) || 1.2,
    maxPositionSize: parseFloat(process.env.MAX_POSITION_SIZE) || 10000,
    stopLossPercentage: parseFloat(process.env.STOP_LOSS_PERCENTAGE) || 2.0,
    takeProfitPercentage: parseFloat(process.env.TAKE_PROFIT_PERCENTAGE) || 1.5
  },

  // Gas Configuration
  gas: {
    limit: parseInt(process.env.GAS_LIMIT) || 3000000,
    price: parseInt(process.env.GAS_PRICE_GWEI) || 10,
    priorityFee: parseInt(process.env.PRIORITY_FEE_GWEI) || 2,
    multiplier: parseFloat(process.env.GAS_MULTIPLIER) || 1.2
  },

  // Monitoring Configuration
  monitoring: {
    triangularScanInterval: parseInt(process.env.TRIANGULAR_SCAN_INTERVAL) || 3000,
    priceCheckInterval: parseInt(process.env.PRICE_CHECK_INTERVAL) || 5000,
    opportunityThreshold: parseFloat(process.env.OPPORTUNITY_THRESHOLD) || 0.1,
    logLevel: process.env.LOG_LEVEL || 'info',
    enableMempool: process.env.ENABLE_MEMPOOL_MONITORING === 'true',
    enableCaching: process.env.ENABLE_CACHING === 'true',
    cacheTTL: parseInt(process.env.CACHE_TTL_SECONDS) || 30
  },

  // Logging Configuration
  logging: {
    logFile: process.env.LOG_FILE || 'bsc-triangular-arbitrage.log',
    errorLogFile: process.env.ERROR_LOG_FILE || 'bsc-error.log',
    profitLogFile: process.env.PROFIT_LOG_FILE || 'bsc-profit.log',
    opportunityLogFile: process.env.OPPORTUNITY_LOG_FILE || 'bsc-opportunities.log',
    level: process.env.LOG_LEVEL || 'info'
  },

  // Risk Management
  riskManagement: {
    maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.RETRY_DELAY_MS) || 1000,
    enableSandwichProtection: process.env.ENABLE_SANDWICH_PROTECTION === 'true',
    enableMevProtection: process.env.ENABLE_MEV_PROTECTION === 'true',
    maxDailyLoss: parseFloat(process.env.MAX_DAILY_LOSS) || 0.1,
    emergencyStopLoss: parseFloat(process.env.EMERGENCY_STOP_LOSS) || 0.05
  },

  // Performance Optimization
  performance: {
    parallelPriceChecks: process.env.PARALLEL_PRICE_CHECKS === 'true',
    batchSize: parseInt(process.env.BATCH_SIZE) || 10,
    enableCaching: process.env.ENABLE_CACHING === 'true',
    maxConcurrentExecutions: parseInt(process.env.MAX_CONCURRENT_EXECUTIONS) || 1
  },

  // Bot Configuration
  bot: {
    dryRun: process.env.DRY_RUN === 'true',
    enabled: true,
    autoRestart: true,
    maxRunTime: 24 * 60 * 60 * 1000, // 24 hours
    healthCheckInterval: 60000, // 1 minute
    mode: process.env.BOT_MODE || 'triangular' // 'triangular' or 'traditional'
  },

  // API Configuration
  apis: {
    moralis: process.env.MORALIS_API_KEY,
    alchemy: process.env.ALCHEMY_API_KEY,
    infura: process.env.INFURA_PROJECT_ID,
    bscscan: process.env.BSCSCAN_API_KEY
  },

  // Notification Configuration
  notifications: {
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID,
      enabled: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
    },
    discord: {
      webhookUrl: process.env.DISCORD_WEBHOOK_URL,
      enabled: !!process.env.DISCORD_WEBHOOK_URL
    }
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    redis: process.env.REDIS_URL
  },

  // Contract Addresses (will be populated after deployment)
  contracts: {
    arbitrage: null // Will be set after deployment
  },

  // Utility functions
  getProvider() {
    return new ethers.providers.JsonRpcProvider(this.networks.bscTestnet.rpcUrl);
  },

  getWallet() {
    if (!this.wallet.privateKey) {
      throw new Error('Private key not configured');
    }
    return new ethers.Wallet(this.wallet.privateKey, this.getProvider());
  },

  getTokenBySymbol(symbol) {
    return this.tokens[symbol];
  },

  getTokenByAddress(address) {
    return Object.values(this.tokens).find(token => 
      token.address.toLowerCase() === address.toLowerCase()
    );
  },

  getDexByName(name) {
    return this.dexes[name.toLowerCase()];
  },

  // Funzioni per arbitraggio triangolare
  getTriangularPath(pathId) {
    return this.triangularArbitrage.paths.find(path => path.id === pathId);
  },

  getTriangularPathByName(name) {
    return this.triangularArbitrage.paths.find(path => path.name === name);
  },

  getAllTriangularPaths() {
    return this.triangularArbitrage.paths;
  },

  // Validation
  validate() {
    const errors = [];
    
    if (!this.wallet.privateKey) {
      errors.push('Private key is required');
    }
    
    if (!this.wallet.address) {
      errors.push('Wallet address is required');
    }
    
    if (!this.networks.bscTestnet.rpcUrl) {
      errors.push('RPC URL is required');
    }
    
    if (this.triangularArbitrage.enabled && this.triangularArbitrage.paths.length === 0) {
      errors.push('At least one triangular path is required when triangular arbitrage is enabled');
    }
    
    return errors;
  }
};

// Export current network configuration
module.exports.currentNetwork = module.exports.networks[module.exports.defaultNetwork]; 