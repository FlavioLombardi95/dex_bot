// Configurazione semplice per test testnet
// NON utilizzare mai in mainnet!

module.exports = {
  // Network Settings
  network: 'testnet',
  chainId: 97,
  
  // RPC URLs - BSC Testnet
  rpcUrls: {
    primary: 'https://bsc-testnet-rpc.publicnode.com',
    secondary: 'https://bsc-testnet.public.blastapi.io',
    backup: 'https://data-seed-prebsc-1-s1.binance.org:8545'
  },
  
  // Wallet Configuration - WALLET SICURO DEVELOPMENT
  wallet: {
    privateKey: process.env.TESTNET_PRIVATE_KEY || null, // Usa wallet sicuro
    address: process.env.TESTNET_WALLET_ADDRESS || '0x566474648C0DD8772040D29E46aC651dBC9A9470'
  },
  
  // Contract Addresses - PancakeSwap V2 Testnet
  contracts: {
    pancakeFactory: '0x6725F303b657a9451d8BA641348b6761A6CC7a17',
    pancakeRouter: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
    wbnb: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd'
  },
  
  // Trading Settings
  trading: {
    minProfitThreshold: 0.01,
    maxSlippage: 0.03,
    gasLimit: 300000,
    gasPrice: 5000000000,
    maxAmountBNB: 0.1 // Massimo 0.1 BNB per test
  },
  
  // Monitoring Settings
  monitoring: {
    scanInterval: 2000,
    enableLogging: true,
    logLevel: 'info',
    enableCache: true,
    cacheTTL: 30000
  },
  
  // Test Mode Settings
  testMode: {
    enabled: true,
    dryRun: true, // Non eseguire trade reali
    logOnly: true // Solo logging delle opportunità
  },
  
  // API Settings
  api: {
    enabled: true,
    port: 3000,
    host: 'localhost'
  },
  
  // Database
  database: {
    type: 'sqlite',
    path: './data/arbitrage.db'
  }
}; 