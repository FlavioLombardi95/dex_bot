const { ethers } = require('ethers');
const config = require('./testnet-config');

async function testBasicConnection() {
  console.log('🔧 Test Base Connessione Testnet BSC');
  console.log('=====================================');
  
  try {
    // Test connessione RPC
    console.log('1. Test connessione RPC...');
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrls.primary);
    const network = await provider.getNetwork();
    console.log(`✅ Connesso a: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Test blocco corrente
    console.log('\n2. Test blocco corrente...');
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Blocco corrente: ${blockNumber}`);
    
    // Test gas price
    console.log('\n3. Test gas price...');
    const gasPrice = await provider.getGasPrice();
    console.log(`✅ Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} GWEI`);
    
    // Test balance (se wallet configurato)
    if (config.wallet.privateKey && config.wallet.privateKey !== 'your_testnet_private_key_here') {
      console.log('\n4. Test wallet balance...');
      const wallet = new ethers.Wallet(config.wallet.privateKey, provider);
      const balance = await wallet.getBalance();
      console.log(`✅ Balance: ${ethers.utils.formatEther(balance)} BNB`);
      console.log(`✅ Address: ${wallet.address}`);
    } else {
      console.log('\n4. ⚠️  Wallet sicuro configurato');
      console.log(`   Indirizzo: ${config.wallet.address}`);
      console.log('   Usa: node simple-wallet.js per accesso sicuro');
    }
    
    // Test contratti PancakeSwap
    console.log('\n5. Test contratti PancakeSwap...');
    const factoryABI = [
      "function allPairsLength() view returns (uint256)",
      "function getPair(address tokenA, address tokenB) view returns (address)"
    ];
    
    const factory = new ethers.Contract(config.contracts.pancakeFactory, factoryABI, provider);
    const pairsLength = await factory.allPairsLength();
    console.log(`✅ Pancake Factory: ${pairsLength} coppie disponibili`);
    
    console.log('\n🎉 Test completato con successo!');
    console.log('\nProssimi passi:');
    console.log('1. Usa: node simple-wallet.js per accesso sicuro');
    console.log('2. Ottieni BNB testnet dal faucet');
    console.log('3. Esegui: npm run test:scanner');
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
    console.log('\nSoluzioni possibili:');
    console.log('1. Verifica connessione internet');
    console.log('2. Controlla RPC URLs in testnet-config.js');
    console.log('3. Assicurati che le dipendenze siano installate');
  }
}

// Avvia test
testBasicConnection().catch(console.error); 