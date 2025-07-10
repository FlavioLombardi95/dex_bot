const dotenv = require('dotenv');
dotenv.config();

const config = {
    // Configurazione blockchain
    network: {
        name: process.env.NETWORK || 'goerli',
        rpcUrl: process.env.RPC_URL || 'https://rpc.ankr.com/eth_goerli',
        chainId: process.env.CHAIN_ID || 5
    },
    
    // Configurazione wallet
    wallet: {
        privateKey: process.env.PRIVATE_KEY,
        address: process.env.WALLET_ADDRESS
    },
    
    // Indirizzi smart contract
    contracts: {
        arbitrage: process.env.ARBITRAGE_CONTRACT_ADDRESS,
        balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8'
    },
    
    // Router DEX (Goerli testnet)
    dexRouters: {
        uniswap: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        sushiswap: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'
    },
    
    // Factory DEX
    dexFactories: {
        uniswap: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        sushiswap: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
    },
    
    // Token supportati (Goerli)
    tokens: {
        WETH: {
            address: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
            symbol: 'WETH',
            decimals: 18
        },
        USDC: {
            address: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
            symbol: 'USDC',
            decimals: 6
        },
        USDT: {
            address: '0x509Ee0d083DdF8AC028f2a56731412edD63223B9',
            symbol: 'USDT',
            decimals: 6
        },
        DAI: {
            address: '0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844',
            symbol: 'DAI',
            decimals: 18
        }
    },
    
    // Coppie di trading da monitorare
    tradingPairs: [
        { tokenA: 'WETH', tokenB: 'USDC' },
        { tokenA: 'WETH', tokenB: 'USDT' },
        { tokenA: 'USDC', tokenB: 'USDT' },
        { tokenA: 'WETH', tokenB: 'DAI' }
    ],
    
    // Parametri arbitraggio
    arbitrage: {
        minProfitThreshold: 0.01, // 1% minimo di profitto
        maxSlippage: 0.03, // 3% slippage massimo
        gasLimit: 300000,
        gasPrice: 20000000000, // 20 gwei
        monitoringInterval: 10000, // 10 secondi
        flashLoanAmount: '1000000000000000000' // 1 ETH in wei
    },
    
    // Configurazione logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: 'logs/arbitrage.log',
        maxSize: '10m',
        maxFiles: 5
    }
};

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

module.exports = { config, validateConfig }; 