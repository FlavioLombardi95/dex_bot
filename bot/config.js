const dotenv = require('dotenv');
dotenv.config();

const config = {
    // Configurazione blockchain
    network: {
        name: process.env.NETWORK || 'mumbai', // Default a Mumbai testnet
        rpcUrl: process.env.RPC_URL || 'https://rpc-mumbai.maticvigil.com',
        chainId: process.env.CHAIN_ID || 80001 // Mumbai testnet
    },
    
    // Configurazione wallet
    wallet: {
        privateKey: process.env.PRIVATE_KEY,
        address: process.env.WALLET_ADDRESS
    },
    
    // Indirizzi smart contract
    contracts: {
        arbitrage: process.env.ARBITRAGE_CONTRACT_ADDRESS,
        balancerVault: process.env.BALANCER_VAULT_ADDRESS || '0xBA12222222228d8Ba445958a75a0704d566BF2C8' // Balancer Vault
    },
    
    // Router DEX per Polygon/Mumbai
    dexRouters: {
        uniswap: process.env.UNISWAP_ROUTER || '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', // Uniswap V2 Router
        sushiswap: process.env.SUSHISWAP_ROUTER || '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506' // SushiSwap Router
    },
    
    // Factory DEX per Polygon/Mumbai
    dexFactories: {
        uniswap: process.env.UNISWAP_FACTORY || '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        sushiswap: process.env.SUSHISWAP_FACTORY || '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
    },
    
    // Token supportati per Polygon/Mumbai
    tokens: {
        WMATIC: {
            address: process.env.WMATIC_ADDRESS || '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889', // Mumbai WMATIC
            symbol: 'WMATIC',
            decimals: 18
        },
        USDC: {
            address: process.env.USDC_ADDRESS || '0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747', // Mumbai USDC
            symbol: 'USDC',
            decimals: 6
        },
        USDT: {
            address: process.env.USDT_ADDRESS || '0xA02f6adc7926efeBBd59Fd43A84f1E0C1232Fa2D', // Mumbai USDT
            symbol: 'USDT',
            decimals: 6
        },
        DAI: {
            address: process.env.DAI_ADDRESS || '0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F', // Mumbai DAI
            symbol: 'DAI',
            decimals: 18
        }
    },
    
    // Coppie di trading da monitorare (ottimizzate per Polygon)
    tradingPairs: [
        { tokenA: 'WMATIC', tokenB: 'USDC' },
        { tokenA: 'WMATIC', tokenB: 'USDT' },
        { tokenA: 'USDC', tokenB: 'USDT' },
        { tokenA: 'WMATIC', tokenB: 'DAI' },
        { tokenA: 'USDC', tokenB: 'DAI' }
    ],
    
    // Parametri arbitraggio ottimizzati per Polygon
    arbitrage: {
        minProfitThreshold: 0.005, // 0.5% minimo di profitto (più basso per L2)
        maxSlippage: 0.02, // 2% slippage massimo (più basso per L2)
        gasLimit: 500000, // Gas limit più alto per L2
        gasPrice: 30000000000, // 30 gwei (più alto per L2)
        monitoringInterval: 5000, // 5 secondi (più frequente per L2)
        flashLoanAmount: '1000000000000000000' // 1 MATIC in wei
    },
    
    // Configurazione logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: 'logs/polygon-arbitrage.log',
        maxSize: '10m',
        maxFiles: 5
    }
};

// Configurazioni specifiche per rete
const networkConfigs = {
    // Mumbai Testnet (Polygon)
    mumbai: {
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        chainId: 80001,
        balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
        uniswapRouter: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
        sushiswapRouter: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
        tokens: {
            WMATIC: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
            USDC: '0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747',
            USDT: '0xA02f6adc7926efeBBd59Fd43A84f1E0C1232Fa2D',
            DAI: '0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F'
        }
    },
    
    // Polygon Mainnet
    polygon: {
        rpcUrl: 'https://polygon-rpc.com',
        chainId: 137,
        balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
        uniswapRouter: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
        sushiswapRouter: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
        tokens: {
            WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
            USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
        }
    }
};

// Funzione per caricare configurazione specifica per rete
function loadNetworkConfig(networkName) {
    const networkConfig = networkConfigs[networkName];
    if (networkConfig) {
        config.network.rpcUrl = networkConfig.rpcUrl;
        config.network.chainId = networkConfig.chainId;
        config.contracts.balancerVault = networkConfig.balancerVault;
        config.dexRouters.uniswap = networkConfig.uniswapRouter;
        config.dexRouters.sushiswap = networkConfig.sushiswapRouter;
        
        // Aggiorna indirizzi token
        Object.keys(networkConfig.tokens).forEach(tokenSymbol => {
            if (config.tokens[tokenSymbol]) {
                config.tokens[tokenSymbol].address = networkConfig.tokens[tokenSymbol];
            }
        });
        
        console.log(`Configurazione caricata per rete: ${networkName}`);
    }
}

// Carica configurazione specifica per rete se specificata
if (process.env.NETWORK && networkConfigs[process.env.NETWORK]) {
    loadNetworkConfig(process.env.NETWORK);
}

// Validazione configurazione
function validateConfig() {
    const requiredEnvVars = ['PRIVATE_KEY', 'RPC_URL'];
    
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Variabile d'ambiente mancante: ${envVar}`);
        }
    }
    
    if (!config.wallet.privateKey.startsWith('0x')) {
        config.wallet.privateKey = '0x' + config.wallet.privateKey;
    }
}

module.exports = { config, validateConfig, networkConfigs, loadNetworkConfig }; 