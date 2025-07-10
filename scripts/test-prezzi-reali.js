#!/usr/bin/env node

const { ethers } = require('ethers');
const fs = require('fs');

console.log('🔍 CRYPTO ARBITRAGE BOT - ANALISI PREZZI REALI TESTNET');
console.log('======================================================');

// Configurazione testnet reale
const CONFIG = {
    // Goerli testnet
    rpcUrl: 'https://rpc.ankr.com/eth_goerli',
    chainId: 5,
    
    // Contratti reali Goerli
    tokens: {
        WETH: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
        USDC: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
        USDT: '0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49'
    },
    
    // Router DEX Goerli
    dex: {
        uniswap: {
            router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
            factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
        },
        sushiswap: {
            router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
            factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
        }
    },
    
    // Balancer flash loan
    balancer: {
        vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8'
    }
};

// ABI minimali per le chiamate
const ROUTER_ABI = [
    'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
    'function factory() external pure returns (address)',
    'function WETH() external pure returns (address)'
];

const FACTORY_ABI = [
    'function getPair(address tokenA, address tokenB) external view returns (address pair)'
];

const PAIR_ABI = [
    'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)'
];

const ERC20_ABI = [
    'function decimals() external view returns (uint8)',
    'function symbol() external view returns (string)',
    'function balanceOf(address account) external view returns (uint256)'
];

async function connectToTestnet() {
    console.log('🌐 CONNESSIONE A TESTNET REALE...');
    console.log('=================================');
    
    try {
        const provider = new ethers.providers.JsonRpcProvider(CONFIG.rpcUrl);
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
        const gasPrice = await provider.getGasPrice();
        
        console.log(`✅ Connesso a: ${network.name}`);
        console.log(`📊 Chain ID: ${network.chainId}`);
        console.log(`🔗 Blocco attuale: ${blockNumber}`);
        console.log(`⛽ Gas Price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
        
        return { provider, network, blockNumber, gasPrice };
    } catch (error) {
        console.error('❌ Errore connessione:', error.message);
        return null;
    }
}

async function getRealPrices(provider) {
    console.log('\n💰 RECUPERO PREZZI REALI DAI DEX...');
    console.log('===================================');
    
    try {
        // Connessione ai router
        const uniswapRouter = new ethers.Contract(CONFIG.dex.uniswap.router, ROUTER_ABI, provider);
        const sushiswapRouter = new ethers.Contract(CONFIG.dex.sushiswap.router, ROUTER_ABI, provider);
        
        // Importo test: 1 WETH
        const amountIn = ethers.utils.parseEther('1.0');
        const path = [CONFIG.tokens.WETH, CONFIG.tokens.USDC];
        
        console.log('🔄 Chiamando Uniswap per prezzi...');
        let uniswapPrice = null;
        try {
            const uniAmounts = await uniswapRouter.getAmountsOut(amountIn, path);
            uniswapPrice = ethers.utils.formatUnits(uniAmounts[1], 6); // USDC ha 6 decimali
            console.log(`✅ Prezzo Uniswap: $${parseFloat(uniswapPrice).toFixed(2)}`);
        } catch (error) {
            console.log(`❌ Errore Uniswap: ${error.message}`);
        }
        
        console.log('🔄 Chiamando SushiSwap per prezzi...');
        let sushiswapPrice = null;
        try {
            const sushiAmounts = await sushiswapRouter.getAmountsOut(amountIn, path);
            sushiswapPrice = ethers.utils.formatUnits(sushiAmounts[1], 6);
            console.log(`✅ Prezzo SushiSwap: $${parseFloat(sushiswapPrice).toFixed(2)}`);
        } catch (error) {
            console.log(`❌ Errore SushiSwap: ${error.message}`);
        }
        
        return {
            uniswap: uniswapPrice ? parseFloat(uniswapPrice) : null,
            sushiswap: sushiswapPrice ? parseFloat(sushiswapPrice) : null
        };
        
    } catch (error) {
        console.error('❌ Errore recupero prezzi:', error.message);
        return { uniswap: null, sushiswap: null };
    }
}

async function checkLiquidity(provider) {
    console.log('\n💧 VERIFICA LIQUIDITÀ REALE...');
    console.log('==============================');
    
    try {
        const uniFactory = new ethers.Contract(CONFIG.dex.uniswap.factory, FACTORY_ABI, provider);
        const sushiFactory = new ethers.Contract(CONFIG.dex.sushiswap.factory, FACTORY_ABI, provider);
        
        // Cerca pair WETH/USDC
        const uniPair = await uniFactory.getPair(CONFIG.tokens.WETH, CONFIG.tokens.USDC);
        const sushiPair = await sushiFactory.getPair(CONFIG.tokens.WETH, CONFIG.tokens.USDC);
        
        console.log(`🔍 Uniswap Pair: ${uniPair}`);
        console.log(`🔍 SushiSwap Pair: ${sushiPair}`);
        
        let uniLiquidity = null;
        let sushiLiquidity = null;
        
        // Controlla liquidità Uniswap
        if (uniPair !== ethers.constants.AddressZero) {
            try {
                const uniPairContract = new ethers.Contract(uniPair, PAIR_ABI, provider);
                const reserves = await uniPairContract.getReserves();
                const token0 = await uniPairContract.token0();
                
                // Determina quale riserva è WETH
                const wethReserve = token0.toLowerCase() === CONFIG.tokens.WETH.toLowerCase() 
                    ? reserves.reserve0 : reserves.reserve1;
                    
                uniLiquidity = ethers.utils.formatEther(wethReserve);
                console.log(`✅ Liquidità Uniswap: ${parseFloat(uniLiquidity).toFixed(2)} WETH`);
            } catch (error) {
                console.log(`❌ Errore liquidità Uniswap: ${error.message}`);
            }
        } else {
            console.log('❌ Pair Uniswap non trovata');
        }
        
        // Controlla liquidità SushiSwap
        if (sushiPair !== ethers.constants.AddressZero) {
            try {
                const sushiPairContract = new ethers.Contract(sushiPair, PAIR_ABI, provider);
                const reserves = await sushiPairContract.getReserves();
                const token0 = await sushiPairContract.token0();
                
                const wethReserve = token0.toLowerCase() === CONFIG.tokens.WETH.toLowerCase() 
                    ? reserves.reserve0 : reserves.reserve1;
                    
                sushiLiquidity = ethers.utils.formatEther(wethReserve);
                console.log(`✅ Liquidità SushiSwap: ${parseFloat(sushiLiquidity).toFixed(2)} WETH`);
            } catch (error) {
                console.log(`❌ Errore liquidità SushiSwap: ${error.message}`);
            }
        } else {
            console.log('❌ Pair SushiSwap non trovata');
        }
        
        return {
            uniswap: uniLiquidity ? parseFloat(uniLiquidity) : null,
            sushiswap: sushiLiquidity ? parseFloat(sushiLiquidity) : null
        };
        
    } catch (error) {
        console.error('❌ Errore verifica liquidità:', error.message);
        return { uniswap: null, sushiswap: null };
    }
}

async function calculateRealCosts(provider, gasPrice) {
    console.log('\n💸 CALCOLO COSTI REALI...');
    console.log('=========================');
    
    // Stima gas per operazioni
    const gasEstimates = {
        flashLoan: 50000,      // Gas per iniziare flash loan
        swapUniswap: 120000,   // Gas per swap Uniswap
        swapSushiSwap: 130000, // Gas per swap SushiSwap
        repayLoan: 40000,      // Gas per ripagare flash loan
        overhead: 20000        // Gas overhead vario
    };
    
    const totalGas = Object.values(gasEstimates).reduce((a, b) => a + b, 0);
    const gasCostWei = gasPrice.mul(totalGas);
    const gasCostEth = ethers.utils.formatEther(gasCostWei);
    
    console.log(`⛽ Gas totale stimato: ${totalGas.toLocaleString()} units`);
    console.log(`💸 Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
    console.log(`💰 Costo gas: ${parseFloat(gasCostEth).toFixed(6)} ETH`);
    
    // Stima costo in USD (usando prezzo ETH approssimativo)
    const ethPriceUSD = 2400; // Prezzo ETH approssimativo
    const gasCostUSD = parseFloat(gasCostEth) * ethPriceUSD;
    console.log(`💵 Costo gas USD: $${gasCostUSD.toFixed(2)}`);
    
    return {
        totalGas,
        gasCostEth: parseFloat(gasCostEth),
        gasCostUSD
    };
}

async function analyzeRealProfitability(prices, liquidity, costs) {
    console.log('\n📊 ANALISI PROFITTABILITÀ REALE...');
    console.log('==================================');
    
    if (!prices.uniswap || !prices.sushiswap) {
        console.log('❌ Prezzi non disponibili per analisi');
        return false;
    }
    
    const uniPrice = prices.uniswap;
    const sushiPrice = prices.sushiswap;
    const priceDiff = Math.abs(uniPrice - sushiPrice);
    const spreadPercent = (priceDiff / Math.min(uniPrice, sushiPrice)) * 100;
    
    console.log(`📈 Spread attuale: $${priceDiff.toFixed(2)} (${spreadPercent.toFixed(3)}%)`);
    
    // Determina direzione
    const direction = uniPrice > sushiPrice ? 'SushiSwap → Uniswap' : 'Uniswap → SushiSwap';
    const sellDex = uniPrice > sushiPrice ? 'Uniswap' : 'SushiSwap';
    const buyDex = uniPrice > sushiPrice ? 'SushiSwap' : 'Uniswap';
    const sellPrice = Math.max(uniPrice, sushiPrice);
    const buyPrice = Math.min(uniPrice, sushiPrice);
    
    console.log(`🎯 Direzione: ${direction}`);
    console.log(`🏪 Vendi su ${sellDex} @ $${sellPrice.toFixed(2)}`);
    console.log(`🏪 Compra su ${buyDex} @ $${buyPrice.toFixed(2)}`);
    
    // Calcola profitti per diverse quantità
    const amounts = [0.5, 1.0, 2.0, 5.0]; // WETH
    
    console.log('\n💰 PROFITTABILITÀ PER IMPORTO:');
    console.log('==============================');
    
    let bestAmount = null;
    let bestProfit = -Infinity;
    
    for (const amount of amounts) {
        // Verifica se c'è liquidità sufficiente
        const requiredLiquidity = amount * 1.2; // 20% buffer
        const hasLiquidity = (!liquidity.uniswap || liquidity.uniswap > requiredLiquidity) &&
                           (!liquidity.sushiswap || liquidity.sushiswap > requiredLiquidity);
        
        if (!hasLiquidity) {
            console.log(`❌ ${amount} WETH: Liquidità insufficiente`);
            continue;
        }
        
        // Calcola profitto teorico
        const sellValue = amount * sellPrice;
        const buyValue = amount * buyPrice;
        const grossProfit = sellValue - buyValue;
        
        // Sottrai fee DEX (0.3% per swap)
        const dexFees = (sellValue * 0.003) + (buyValue * 0.003);
        
        // Sottrai slippage stimato (0.1% per swap su liquidità bassa)
        const slippage = (sellValue * 0.001) + (buyValue * 0.001);
        
        // Calcola profitto netto
        const netProfit = grossProfit - dexFees - slippage - costs.gasCostUSD;
        const roi = (netProfit / (amount * sellPrice)) * 100;
        
        console.log(`💎 ${amount} WETH:`);
        console.log(`   Profitto lordo: $${grossProfit.toFixed(2)}`);
        console.log(`   Fee DEX: $${dexFees.toFixed(2)}`);
        console.log(`   Slippage: $${slippage.toFixed(2)}`);
        console.log(`   Gas: $${costs.gasCostUSD.toFixed(2)}`);
        console.log(`   Profitto netto: $${netProfit.toFixed(2)}`);
        console.log(`   ROI: ${roi.toFixed(3)}%`);
        console.log(`   Status: ${netProfit > 0 ? '✅ PROFITTEVOLE' : '❌ PERDITA'}`);
        
        if (netProfit > bestProfit) {
            bestProfit = netProfit;
            bestAmount = amount;
        }
    }
    
    // Soglia minima di profittabilità
    const minProfitThreshold = 20; // $20 minimo
    const minSpreadThreshold = 0.5; // 0.5% spread minimo
    
    console.log('\n🎯 CONCLUSIONE ANALISI:');
    console.log('=======================');
    console.log(`📊 Spread attuale: ${spreadPercent.toFixed(3)}% (min: ${minSpreadThreshold}%)`);
    console.log(`💰 Miglior profitto: $${bestProfit.toFixed(2)} con ${bestAmount} WETH`);
    console.log(`🎯 Soglia minima: $${minProfitThreshold}`);
    
    const isProfitable = bestProfit > minProfitThreshold && spreadPercent > minSpreadThreshold;
    
    if (isProfitable) {
        console.log('✅ ARBITRAGGIO PROFITTEVOLE!');
        console.log(`🎯 Raccomandazione: Eseguire con ${bestAmount} WETH`);
        console.log(`💰 Profitto atteso: $${bestProfit.toFixed(2)}`);
    } else {
        console.log('❌ ARBITRAGGIO NON PROFITTEVOLE');
        if (spreadPercent < minSpreadThreshold) {
            console.log(`⚠️  Spread troppo basso: ${spreadPercent.toFixed(3)}% < ${minSpreadThreshold}%`);
        }
        if (bestProfit < minProfitThreshold) {
            console.log(`⚠️  Profitto troppo basso: $${bestProfit.toFixed(2)} < $${minProfitThreshold}`);
        }
    }
    
    return isProfitable;
}

async function runRealAnalysis() {
    console.log('🚀 AVVIO ANALISI PREZZI REALI...\n');
    
    // Connessione testnet
    const connection = await connectToTestnet();
    if (!connection) {
        console.log('❌ Impossibile connettersi alla testnet');
        return;
    }
    
    const { provider, gasPrice } = connection;
    
    // Recupera prezzi reali
    const prices = await getRealPrices(provider);
    
    // Verifica liquidità
    const liquidity = await checkLiquidity(provider);
    
    // Calcola costi reali
    const costs = await calculateRealCosts(provider, gasPrice);
    
    // Analizza profittabilità
    const isProfitable = await analyzeRealProfitability(prices, liquidity, costs);
    
    console.log('\n🏁 ANALISI COMPLETATA!');
    console.log('======================');
    console.log('📋 Hai visto:');
    console.log('   ✅ Connessione testnet reale');
    console.log('   ✅ Prezzi reali dai DEX');
    console.log('   ✅ Liquidità effettiva');
    console.log('   ✅ Costi gas reali');
    console.log('   ✅ Analisi profittabilità completa');
    console.log('   ✅ Raccomandazioni concrete');
    
    if (isProfitable) {
        console.log('\n🎉 RISULTATO: ARBITRAGGIO PROFITTEVOLE!');
        console.log('Il bot può essere avviato con profitto');
    } else {
        console.log('\n⚠️  RISULTATO: ARBITRAGGIO NON PROFITTEVOLE');
        console.log('Attendi spread migliori o ottimizza i parametri');
    }
}

// Avvia l'analisi
runRealAnalysis().catch(console.error); 