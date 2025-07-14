require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: './bsc-testnet.env' });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // BSC Testnet (Primary)
    bscTestnet: {
      url: process.env.RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 10000000000, // 10 gwei
      gas: 3000000,
      timeout: 60000,
      confirmations: 2,
      skipDryRun: true
    },
    // Alternative BSC Testnet RPC
    bscTestnetAlt: {
      url: "https://data-seed-prebsc-2-s1.binance.org:8545",
      chainId: 97,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 10000000000,
      gas: 3000000,
      timeout: 60000,
      confirmations: 2,
      skipDryRun: true
    },
    // BSC Mainnet (per deploy futuro)
    bscMainnet: {
      url: "https://bsc-dataseed1.binance.org",
      chainId: 56,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 5000000000, // 5 gwei
      gas: 3000000,
      timeout: 60000,
      confirmations: 3,
      skipDryRun: false
    },
    // Hardhat Local Network
    hardhat: {
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 10,
        accountsBalance: "10000000000000000000000"
      }
    },
    // Localhost
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    // BscScan API per verificare contratti
    apiKey: {
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "bscTestnet",
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "BNB",
    gasPriceApi: "https://api.bscscan.com/api?module=proxy&action=eth_gasPrice"
  },
  mocha: {
    timeout: 60000
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  // Configurazione per debug e sviluppo
  debug: {
    enabled: process.env.DEBUG === "true",
    verbose: process.env.DEBUG_VERBOSE === "true"
  },
  // Configurazione per ottimizzazioni BSC
  bscOptimizations: {
    gasOptimization: true,
    skipContractSizeCheck: false,
    enableContractSizeOptimization: true
  }
}; 