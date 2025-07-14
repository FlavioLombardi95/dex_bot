const dotenv = require('dotenv');
dotenv.config();

const config = {
    // Configurazione blockchain
    network: {
        name: process.env.NETWORK || 'bscTestnet', // Default a BSC testnet
        rpcUrl: process.env.RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
        chainId: process.env.CHAIN_ID || 97 // BSC testnet
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
    
    // Router DEX per BSC Testnet
    dexRouters: {
        pancakeswap: process.env.PANCAKESWAP_ROUTER || '0xD99D1c33F9fC3444f8101754aBC46c52416550D1', // PancakeSwap V2 Router
        bakeryswap: process.env.BAKERYSWAP_ROUTER || '0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F' // BakerySwap Router  
    },
    
    // Factory DEX per BSC Testnet
    dexFactories: {
        pancakeswap: process.env.PANCAKESWAP_FACTORY || '0x6725F303b657a9451d8BA641348b6761A6CC7a17', // PancakeSwap V2 Factory
        bakeryswap: process.env.BAKERYSWAP_FACTORY || '0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7' // BakerySwap Factory
    },
    
    // Token supportati per BSC Testnet
    tokens: {
        BNB: {
            address: '0x0000000000000000000000000000000000000000', // Native BNB
            symbol: 'BNB',
            decimals: 18
        },
        WBNB: {
            address: process.env.WBNB_ADDRESS || '0xae13d989dac2f0debff460ac112a837c89baa7cd', // WBNB testnet
            symbol: 'WBNB', 
            decimals: 18
        },
        BUSD: {
            address: process.env.BUSD_ADDRESS || '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee', // BUSD testnet
            symbol: 'BUSD',
            decimals: 18
        },
        USDT: {
            address: process.env.USDT_ADDRESS || '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684', // USDT testnet
            symbol: 'USDT',
            decimals: 18
        }
    },
    
    // Coppie di trading da monitorare (BSC testnet)
    tradingPairs: [
        { tokenA: 'WBNB', tokenB: 'BUSD' }, // WBNB vs BUSD - coppia principale
        { tokenA: 'WBNB', tokenB: 'USDT' }, // WBNB vs USDT - coppia secondaria
        { tokenA: 'BUSD', tokenB: 'USDT' }  // BUSD vs USDT - stablecoin pair
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
        file: 'logs/bsc-arbitrage.log',
        maxSize: '10m',
        maxFiles: 5
    }
};

// Configurazioni specifiche per rete
const networkConfigs = {
    // BSC Testnet - PRINCIPALE
    bscTestnet: {
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        chainId: 97,
        balancerVault: null, // Non disponibile su BSC testnet
        pancakeswapRouter: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
        bakeryswapRouter: '0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F',
        tokens: {
            BNB: '0x0000000000000000000000000000000000000000', // Native BNB
            WBNB: '0xae13d989dac2f0debff460ac112a837c89baa7cd', // WBNB testnet
            BUSD: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee', // BUSD testnet
            USDT: '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684'  // USDT testnet
        }
    },
    
    // Polygon PoS Amoy Testnet (BACKUP)
    amoy: {
        rpcUrl: 'https://rpc-amoy.polygon.technology',
        chainId: 80002,
        balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
        pancakeswapRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        bakeryswapRouter: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
        tokens: {
            BNB: '0x0000000000000000000000000000000000000000', // Native POL
            WBNB: '0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9' // WMATIC su Amoy
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