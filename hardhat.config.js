require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const { PRIVATE_KEY, RPC_URL } = process.env;

if (!PRIVATE_KEY) {
  console.warn('⚠️ PRIVATE_KEY non configurata nel file .env');
}

if (!RPC_URL) {
  console.warn('⚠️ RPC_URL non configurata nel file .env');
}

module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Hardhat local network
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      gasPrice: 20000000000
    },
    
    // Goerli testnet
    goerli: {
      url: RPC_URL || 'https://rpc.ankr.com/eth_goerli',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 5,
      gas: 6000000,
      gasPrice: 20000000000
    },
    
    // Sepolia testnet
    sepolia: {
      url: 'https://rpc.ankr.com/eth_sepolia',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      gas: 6000000,
      gasPrice: 20000000000
    },
    
    // Ethereum mainnet
    mainnet: {
      url: 'https://rpc.ankr.com/eth',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 1,
      gas: 6000000,
      gasPrice: 20000000000
    },
    
    // Polygon Mumbai testnet (L2)
    mumbai: {
      url: 'https://rpc-mumbai.maticvigil.com',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80001,
      gas: 8000000, // Gas limit più alto per L2
      gasPrice: 30000000000, // 30 gwei per Polygon
      timeout: 60000 // Timeout più lungo per L2
    },
    
    // Polygon mainnet (L2)
    polygon: {
      url: 'https://polygon-rpc.com',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 137,
      gas: 8000000, // Gas limit più alto per L2
      gasPrice: 30000000000, // 30 gwei per Polygon
      timeout: 60000 // Timeout più lungo per L2
    }
  },
  
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },
  
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD'
  },
  
  etherscan: {
    apiKey: {
      // Ethereum
      mainnet: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      // Polygon
      polygon: process.env.POLYGONSCAN_API_KEY,
      mumbai: process.env.POLYGONSCAN_API_KEY
    }
  }
}; 