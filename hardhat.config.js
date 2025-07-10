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
    version: '0.8.19',
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
    
    // Polygon mainnet
    polygon: {
      url: 'https://rpc.ankr.com/polygon',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 137,
      gas: 6000000,
      gasPrice: 20000000000
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
    apiKey: process.env.ETHERSCAN_API_KEY
  }
}; 