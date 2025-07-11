const { ethers } = require('ethers');
const config = require('../bot/config');
require('dotenv').config({ path: '../bsc-testnet.env' });

async function setupBSC() {
    console.log('🚀 Setup BSC Testnet per DEX Arbitrage Bot');
    console.log('==========================================');
    
    try {
        // Test configurazione
        console.log('\n📋 Verifica configurazione...');
        const errors = config.validate();
        if (errors.length > 0) {
            console.error('❌ Errori di configurazione:');
            errors.forEach(error => console.error(`  - ${error}`));
            return;
        }
        console.log('✅ Configurazione valida');
        
        // Test connessione RPC
        console.log('\n🔗 Test connessione RPC...');
        const provider = config.getProvider();
        const network = await provider.getNetwork();
        console.log(`✅ Connesso a: ${network.name} (Chain ID: ${network.chainId})`);
        
        // Verifica che sia BSC Testnet
        if (network.chainId !== 97) {
            console.error('❌ Rete non corretta! Dovrebbe essere BSC Testnet (97)');
            return;
        }
        
        // Test wallet
        console.log('\n💳 Test wallet...');
        const wallet = config.getWallet();
        console.log(`✅ Wallet configurato: ${wallet.address}`);
        
        // Verifica saldo BNB
        const balance = await provider.getBalance(wallet.address);
        const balanceInBNB = ethers.utils.formatEther(balance);
        console.log(`💰 Saldo BNB: ${balanceInBNB} BNB`);
        
        if (parseFloat(balanceInBNB) < 0.1) {
            console.warn('⚠️ Saldo BNB basso! Ottieni BNB testnet da: https://testnet.binance.org/faucet-smart');
        }
        
        // Test DEX routers
        console.log('\n🔄 Test DEX routers...');
        
        // Test PancakeSwap
        try {
            const pancakeRouter = new ethers.Contract(
                config.dexes.pancakeswap.router,
                [
                    "function factory() external pure returns (address)",
                    "function WETH() external pure returns (address)"
                ],
                provider
            );
            
            const pancakeFactory = await pancakeRouter.factory();
            const pancakeWETH = await pancakeRouter.WETH();
            console.log(`✅ PancakeSwap Router: ${config.dexes.pancakeswap.router}`);
            console.log(`   Factory: ${pancakeFactory}`);
            console.log(`   WETH: ${pancakeWETH}`);
        } catch (error) {
            console.error('❌ Errore PancakeSwap:', error.message);
        }
        
        // Test BakerySwap
        try {
            const bakeryRouter = new ethers.Contract(
                config.dexes.bakeryswap.router,
                [
                    "function factory() external pure returns (address)",
                    "function WETH() external pure returns (address)"
                ],
                provider
            );
            
            const bakeryFactory = await bakeryRouter.factory();
            const bakeryWETH = await bakeryRouter.WETH();
            console.log(`✅ BakerySwap Router: ${config.dexes.bakeryswap.router}`);
            console.log(`   Factory: ${bakeryFactory}`);
            console.log(`   WETH: ${bakeryWETH}`);
        } catch (error) {
            console.error('❌ Errore BakerySwap:', error.message);
        }
        
        // Test token contracts
        console.log('\n🪙 Test token contracts...');
        
        for (const [symbol, token] of Object.entries(config.tokens)) {
            if (token.isNative) {
                console.log(`✅ ${symbol}: Native token (${token.address})`);
                continue;
            }
            
            try {
                const tokenContract = new ethers.Contract(
                    token.address,
                    [
                        "function symbol() view returns (string)",
                        "function name() view returns (string)",
                        "function decimals() view returns (uint8)",
                        "function totalSupply() view returns (uint256)"
                    ],
                    provider
                );
                
                const [name, decimals, totalSupply] = await Promise.all([
                    tokenContract.name(),
                    tokenContract.decimals(),
                    tokenContract.totalSupply()
                ]);
                
                console.log(`✅ ${symbol}: ${name} (${token.address})`);
                console.log(`   Decimals: ${decimals}, Total Supply: ${ethers.utils.formatUnits(totalSupply, decimals)}`);
            } catch (error) {
                console.error(`❌ Errore ${symbol}:`, error.message);
            }
        }
        
        // Test prezzi
        console.log('\n💹 Test prezzi sui DEX...');
        
        const amountToTest = ethers.utils.parseEther('1'); // 1 WBNB
        
        for (const pair of config.tradingPairs) {
            const tokenA = config.getTokenBySymbol(pair.tokenA);
            const tokenB = config.getTokenBySymbol(pair.tokenB);
            
            if (!tokenA || !tokenB) {
                console.error(`❌ Token non trovati per coppia ${pair.tokenA}/${pair.tokenB}`);
                continue;
            }
            
            console.log(`\n📊 Coppia ${pair.tokenA}/${pair.tokenB}:`);
            
            // Test PancakeSwap
            try {
                const pancakeRouter = new ethers.Contract(
                    config.dexes.pancakeswap.router,
                    [
                        "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)"
                    ],
                    provider
                );
                
                const amounts = await pancakeRouter.getAmountsOut(amountToTest, [tokenA.address, tokenB.address]);
                const price = ethers.utils.formatUnits(amounts[1], tokenB.decimals);
                console.log(`  PancakeSwap: 1 ${pair.tokenA} = ${price} ${pair.tokenB}`);
            } catch (error) {
                console.error(`  ❌ PancakeSwap ${pair.tokenA}/${pair.tokenB}: ${error.message}`);
            }
            
            // Test BakerySwap
            try {
                const bakeryRouter = new ethers.Contract(
                    config.dexes.bakeryswap.router,
                    [
                        "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)"
                    ],
                    provider
                );
                
                const amounts = await bakeryRouter.getAmountsOut(amountToTest, [tokenA.address, tokenB.address]);
                const price = ethers.utils.formatUnits(amounts[1], tokenB.decimals);
                console.log(`  BakerySwap: 1 ${pair.tokenA} = ${price} ${pair.tokenB}`);
            } catch (error) {
                console.error(`  ❌ BakerySwap ${pair.tokenA}/${pair.tokenB}: ${error.message}`);
            }
        }
        
        // Statistiche gas
        console.log('\n⛽ Statistiche gas...');
        const gasPrice = await provider.getGasPrice();
        const gasPriceInGwei = ethers.utils.formatUnits(gasPrice, 'gwei');
        console.log(`💨 Gas price corrente: ${gasPriceInGwei} gwei`);
        
        // Stima costi
        const estimatedGasForSwap = 200000;
        const estimatedCostInBNB = ethers.utils.formatEther(gasPrice.mul(estimatedGasForSwap));
        console.log(`💰 Costo stimato per swap: ${estimatedCostInBNB} BNB`);
        
        // Riepilogo
        console.log('\n📋 Riepilogo setup BSC Testnet:');
        console.log(`✅ Rete: BSC Testnet (${network.chainId})`);
        console.log(`✅ RPC: ${config.networks.bscTestnet.rpcUrl}`);
        console.log(`✅ Wallet: ${wallet.address}`);
        console.log(`✅ Saldo: ${balanceInBNB} BNB`);
        console.log(`✅ DEX configurati: ${Object.keys(config.dexes).length}`);
        console.log(`✅ Token supportati: ${Object.keys(config.tokens).length}`);
        console.log(`✅ Coppie di trading: ${config.tradingPairs.length}`);
        
        console.log('\n🎯 Prossimi passi:');
        console.log('1. Esegui deploy del contratto: npm run deploy:bsc');
        console.log('2. Testa il sistema: npm run test:bsc');
        console.log('3. Avvia il bot: npm run start:bsc');
        console.log('4. Monitora i log: npm run logs');
        
        if (parseFloat(balanceInBNB) < 0.1) {
            console.log('\n⚠️ IMPORTANTE: Ottieni BNB testnet prima di procedere!');
            console.log('🔗 Faucet: https://testnet.binance.org/faucet-smart');
        }
        
    } catch (error) {
        console.error('❌ Errore durante il setup:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

async function testConnection() {
    console.log('🔗 Test connessione BSC Testnet...');
    
    try {
        const provider = config.getProvider();
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
        
        console.log(`✅ Connesso a ${network.name} (Chain ID: ${network.chainId})`);
        console.log(`📦 Ultimo blocco: ${blockNumber}`);
        
        return true;
    } catch (error) {
        console.error('❌ Errore di connessione:', error.message);
        return false;
    }
}

async function checkTokenBalances() {
    console.log('💰 Verifica saldi token...');
    
    try {
        const provider = config.getProvider();
        const wallet = config.getWallet();
        
        // Saldo BNB
        const bnbBalance = await provider.getBalance(wallet.address);
        console.log(`BNB: ${ethers.utils.formatEther(bnbBalance)} BNB`);
        
        // Saldi token ERC20
        for (const [symbol, token] of Object.entries(config.tokens)) {
            if (token.isNative) continue;
            
            try {
                const tokenContract = new ethers.Contract(
                    token.address,
                    ["function balanceOf(address) view returns (uint256)"],
                    provider
                );
                
                const balance = await tokenContract.balanceOf(wallet.address);
                const formattedBalance = ethers.utils.formatUnits(balance, token.decimals);
                console.log(`${symbol}: ${formattedBalance} ${symbol}`);
            } catch (error) {
                console.error(`❌ Errore ${symbol}:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Errore verifica saldi:', error.message);
    }
}

// Esegui setup se chiamato direttamente
if (require.main === module) {
    const command = process.argv[2];
    
    switch (command) {
        case 'connection':
            testConnection();
            break;
        case 'balances':
            checkTokenBalances();
            break;
        default:
            setupBSC();
    }
}

module.exports = {
    setupBSC,
    testConnection,
    checkTokenBalances
}; 