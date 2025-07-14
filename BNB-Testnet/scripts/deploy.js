const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('=== DEPLOY ARBITRAGE CONTRACT ===');
    
    try {
        // Ottieni signers
        const [deployer] = await ethers.getSigners();
        console.log('📝 Deploying con account:', deployer.address);
        
        // Verifica saldo
        const balance = await deployer.getBalance();
        console.log('💰 Saldo account:', ethers.utils.formatEther(balance), 'ETH');
        
        if (balance.lt(ethers.utils.parseEther('0.01'))) {
            console.warn('⚠️  Saldo basso per deploy e gas fees');
        }
        
        // Indirizzi router per network corrente
        const network = await ethers.provider.getNetwork();
        console.log('🌐 Network:', network.name, `(chainId: ${network.chainId})`);
        
        let uniswapRouter, sushiswapRouter;
        
        switch (network.chainId) {
            case 1: // Mainnet
                uniswapRouter = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
                sushiswapRouter = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';
                break;
            case 5: // Goerli
                uniswapRouter = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
                sushiswapRouter = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
                break;
            case 80002: // Polygon PoS Amoy Testnet
                uniswapRouter = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'; // QuickSwap
                sushiswapRouter = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
                break;
            case 137: // Polygon
                uniswapRouter = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'; // QuickSwap
                sushiswapRouter = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
                break;
            default:
                throw new Error(`Network non supportato: ${network.name} (${network.chainId})`);
        }
        
        console.log('🔧 Router configurati:');
        console.log('   Uniswap:', uniswapRouter);
        console.log('   Sushiswap:', sushiswapRouter);
        
        // Compila contratto
        console.log('🔨 Compilazione contratto...');
        const ArbitrageFactory = await ethers.getContractFactory('Arbitrage');
        
        // Stima gas per deploy
        const deployData = ArbitrageFactory.getDeployTransaction(uniswapRouter, sushiswapRouter);
        const gasEstimate = await ethers.provider.estimateGas(deployData);
        const gasPrice = await ethers.provider.getGasPrice();
        
        console.log('⛽ Stima gas:');
        console.log('   Gas limit:', gasEstimate.toString());
        console.log('   Gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei');
        console.log('   Costo stimato:', ethers.utils.formatEther(gasEstimate.mul(gasPrice)), 'ETH');
        
        // Deploy contratto
        console.log('🚀 Deploy in corso...');
        const arbitrageContract = await ArbitrageFactory.deploy(
            uniswapRouter,
            sushiswapRouter,
            {
                gasLimit: gasEstimate.mul(120).div(100), // +20% buffer
                gasPrice: gasPrice
            }
        );
        
        console.log('⏳ Attendo conferma deploy...');
        await arbitrageContract.deployed();
        
        console.log('✅ Contratto deployato con successo!');
        console.log('📍 Indirizzo contratto:', arbitrageContract.address);
        console.log('🔗 Transaction hash:', arbitrageContract.deployTransaction.hash);
        
        // Verifica proprietà
        const owner = await arbitrageContract.owner();
        console.log('👤 Proprietario contratto:', owner);
        
        if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
            throw new Error('Errore: deployer non è il proprietario del contratto');
        }
        
        // Salva informazioni deploy
        const deployInfo = {
            contractAddress: arbitrageContract.address,
            deployerAddress: deployer.address,
            transactionHash: arbitrageContract.deployTransaction.hash,
            network: network.name,
            chainId: network.chainId,
            blockNumber: arbitrageContract.deployTransaction.blockNumber,
            gasUsed: arbitrageContract.deployTransaction.gasLimit?.toString(),
            gasPrice: arbitrageContract.deployTransaction.gasPrice?.toString(),
            uniswapRouter,
            sushiswapRouter,
            timestamp: new Date().toISOString()
        };
        
        // Crea directory logs se non esiste
        const logsDir = path.join(__dirname, '..', 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        
        // Salva file di deploy
        const deployFile = path.join(logsDir, `deploy-${network.name}-${Date.now()}.json`);
        fs.writeFileSync(deployFile, JSON.stringify(deployInfo, null, 2));
        console.log('📄 Informazioni deploy salvate in:', deployFile);
        
        // Aggiorna file .env
        const envFile = path.join(__dirname, '..', '.env');
        let envContent = '';
        
        if (fs.existsSync(envFile)) {
            envContent = fs.readFileSync(envFile, 'utf8');
        }
        
        // Aggiorna o aggiungi indirizzo contratto
        if (envContent.includes('ARBITRAGE_CONTRACT_ADDRESS=')) {
            envContent = envContent.replace(
                /ARBITRAGE_CONTRACT_ADDRESS=.*/,
                `ARBITRAGE_CONTRACT_ADDRESS=${arbitrageContract.address}`
            );
        } else {
            envContent += `\nARBITRAGE_CONTRACT_ADDRESS=${arbitrageContract.address}\n`;
        }
        
        fs.writeFileSync(envFile, envContent);
        console.log('📝 File .env aggiornato con indirizzo contratto');
        
        // Verifica contratto su blockchain
        console.log('🔍 Verifica contratto su blockchain...');
        const code = await ethers.provider.getCode(arbitrageContract.address);
        if (code === '0x') {
            throw new Error('Errore: contratto non trovato su blockchain');
        }
        console.log('✅ Contratto verificato su blockchain');
        
        // Suggerimenti post-deploy
        console.log('\n📋 PROSSIMI PASSI:');
        console.log('1. Aggiungi ETH al contratto per gas fees');
        console.log('2. Aggiorna ARBITRAGE_CONTRACT_ADDRESS nel file .env');
        console.log('3. Testa il contratto con testnet prima di usare mainnet');
        console.log('4. Avvia il bot con: npm start');
        console.log('5. Monitora i logs per verificare il funzionamento');
        
        console.log('\n🎉 Deploy completato con successo!');
        
    } catch (error) {
        console.error('❌ Errore durante deploy:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Gestione errori non catturati
process.on('unhandledRejection', (error) => {
    console.error('❌ Errore non gestito:', error);
    process.exit(1);
});

main(); 