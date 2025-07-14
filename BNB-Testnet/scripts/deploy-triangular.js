const { ethers } = require('hardhat');
const config = require('../bot/config');

async function main() {
    console.log('🚀 Avvio deploy contratto Arbitraggio Triangolare su BSC Testnet...');
    
    // Verifica rete
    const network = await ethers.provider.getNetwork();
    console.log('📊 Rete corrente:', {
        nome: network.name,
        chainId: network.chainId,
        attesa: 97 // BSC Testnet
    });
    
    if (network.chainId !== 97) {
        throw new Error('⚠️ Errore: Deploy deve essere eseguito su BSC Testnet (Chain ID 97)');
    }
    
    // Ottieni account deployer
    const [deployer] = await ethers.getSigners();
    const balance = await deployer.getBalance();
    
    console.log('👤 Account deployer:', {
        indirizzo: deployer.address,
        saldo: ethers.utils.formatEther(balance) + ' BNB'
    });
    
    if (balance.lt(ethers.utils.parseEther('0.01'))) {
        throw new Error('⚠️ Saldo insufficiente per il deploy. Minimo 0.01 BNB richiesto.');
    }
    
    // Verifica configurazione tokens
    console.log('🔍 Verifica configurazione token...');
    const tokens = config.tokens;
    console.log('📋 Token configurati:', {
        WBNB: tokens.WBNB.address,
        BUSD: tokens.BUSD.address,
        USDT: tokens.USDT.address,
        USDC: tokens.USDC.address
    });
    
    // Verifica PancakeSwap router
    console.log('🔍 Verifica PancakeSwap router...');
    const pancakeRouter = config.dexes.pancakeswap.router;
    console.log('🥞 PancakeSwap Router:', pancakeRouter);
    
    // Deploy del contratto
    console.log('📝 Compilazione contratto...');
    const ArbitrageFactory = await ethers.getContractFactory('Arbitrage');
    
    console.log('🚀 Deploy in corso...');
    const arbitrageContract = await ArbitrageFactory.deploy();
    
    console.log('⏳ Attendo conferma transazione...');
    await arbitrageContract.deployed();
    
    console.log('✅ Contratto deployato con successo!');
    console.log('📋 Dettagli deploy:', {
        indirizzo: arbitrageContract.address,
        hash: arbitrageContract.deployTransaction.hash,
        gas: arbitrageContract.deployTransaction.gasLimit?.toString(),
        gasPrice: arbitrageContract.deployTransaction.gasPrice?.toString()
    });
    
    // Verifica configurazione contratto
    console.log('🔍 Verifica configurazione contratto...');
    
    try {
        const wbnbAddress = await arbitrageContract.WBNB();
        const busdAddress = await arbitrageContract.BUSD();
        const usdtAddress = await arbitrageContract.USDT();
        const usdcAddress = await arbitrageContract.USDC();
        
        console.log('✅ Indirizzi token nel contratto:', {
            WBNB: wbnbAddress,
            BUSD: busdAddress,
            USDT: usdtAddress,
            USDC: usdcAddress
        });
        
        // Verifica percorsi triangolari
        const triangularPaths = await arbitrageContract.getAllTriangularPaths();
        console.log('📊 Percorsi triangolari configurati:', triangularPaths.length);
        
        for (let i = 0; i < triangularPaths.length; i++) {
            const path = triangularPaths[i];
            console.log(`  ${i}: ${path.name} (${path.tokenA} → ${path.tokenB} → ${path.tokenC})`);
        }
        
    } catch (error) {
        console.error('❌ Errore nella verifica configurazione:', error.message);
    }
    
    // Test di una funzione di lettura
    console.log('🧪 Test funzioni di lettura...');
    try {
        const testAmount = ethers.utils.parseEther('0.001');
        console.log('📊 Test calcolo opportunità per 0.001 BNB...');
        
        const opportunity = await arbitrageContract.calculateTriangularOpportunity(0, testAmount);
        console.log('💰 Risultato test:', {
            profittevole: opportunity.profitable,
            profittoStimato: ethers.utils.formatEther(opportunity.estimatedProfit),
            amountB: ethers.utils.formatEther(opportunity.amountB),
            amountC: ethers.utils.formatEther(opportunity.amountC),
            amountFinale: ethers.utils.formatEther(opportunity.finalAmount)
        });
        
    } catch (error) {
        console.warn('⚠️ Test funzioni fallito (normale se non c\'è liquidità):', error.message);
    }
    
    // Salva configurazione
    console.log('💾 Salvataggio configurazione...');
    
    const deploymentInfo = {
        network: {
            name: network.name,
            chainId: network.chainId
        },
        contract: {
            address: arbitrageContract.address,
            deploymentHash: arbitrageContract.deployTransaction.hash,
            deployer: deployer.address
        },
        timestamp: new Date().toISOString(),
        pancakeRouter: pancakeRouter,
        tokens: {
            WBNB: tokens.WBNB.address,
            BUSD: tokens.BUSD.address,
            USDT: tokens.USDT.address,
            USDC: tokens.USDC.address
        }
    };
    
    const fs = require('fs');
    const path = require('path');
    
    // Salva nel file di configurazione
    const deploymentPath = path.join(__dirname, '../deployment-info.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log('✅ Configurazione salvata in:', deploymentPath);
    
    // Aggiorna config.js
    console.log('🔄 Aggiornamento config.js...');
    const configPath = path.join(__dirname, '../bot/config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Sostituisci l'indirizzo del contratto
    configContent = configContent.replace(
        /arbitrage: null/g,
        `arbitrage: '${arbitrageContract.address}'`
    );
    
    fs.writeFileSync(configPath, configContent);
    
    console.log('✅ Config.js aggiornato con indirizzo contratto');
    
    // Istruzioni finali
    console.log('\n🎉 DEPLOY COMPLETATO CON SUCCESSO!');
    console.log('📋 Riepilogo:');
    console.log('  • Contratto:', arbitrageContract.address);
    console.log('  • Rete: BSC Testnet');
    console.log('  • Percorsi triangolari: 4');
    console.log('  • Gas utilizzato:', arbitrageContract.deployTransaction.gasLimit?.toString());
    
    console.log('\n🔗 Link utili:');
    console.log('  • BSCScan:', `https://testnet.bscscan.com/address/${arbitrageContract.address}`);
    console.log('  • Transazione:', `https://testnet.bscscan.com/tx/${arbitrageContract.deployTransaction.hash}`);
    
    console.log('\n🚀 Prossimi passi:');
    console.log('  1. Verifica il contratto su BSCScan');
    console.log('  2. Deposita alcuni token nel contratto per i test');
    console.log('  3. Avvia il monitoraggio con: npm run start:triangular');
    console.log('  4. Controlla le opportunità con: npm run test:triangular');
    
    return arbitrageContract.address;
}

// Esegui il deploy
if (require.main === module) {
    main()
        .then((address) => {
            console.log(`\n✅ Deploy completato: ${address}`);
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Errore durante il deploy:', error);
            process.exit(1);
        });
}

module.exports = { main }; 