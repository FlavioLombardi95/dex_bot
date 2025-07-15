const { ethers } = require('ethers');
const config = require('./testnet-config');

class TestnetScanner {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrls.primary);
    this.opportunities = [];
  }

  async initialize() {
    console.log('🔍 Test Scanner Opportunità Testnet');
    console.log('===================================');
    
    try {
      // Verifica connessione
      const network = await this.provider.getNetwork();
      console.log(`✅ Connesso a: ${network.name}`);
      
      // Setup contratti
      await this.setupContracts();
      
      // Test scansione
      await this.scanOpportunities();
      
    } catch (error) {
      console.error('❌ Errore durante inizializzazione:', error.message);
    }
  }

  async setupContracts() {
    console.log('\n1. Setup contratti...');
    
    // Factory ABI
    const factoryABI = [
      "function allPairsLength() view returns (uint256)",
      "function allPairs(uint256) view returns (address)",
      "function getPair(address tokenA, address tokenB) view returns (address)"
    ];
    
    // Pair ABI
    const pairABI = [
      "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
      "function token0() view returns (address)",
      "function token1() view returns (address)"
    ];
    
    // ERC20 ABI
    const erc20ABI = [
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)"
    ];
    
    this.factory = new ethers.Contract(config.contracts.pancakeFactory, factoryABI, this.provider);
    this.pairABI = pairABI;
    this.erc20ABI = erc20ABI;
    
    const pairsLength = await this.factory.allPairsLength();
    console.log(`✅ Factory configurato: ${pairsLength} coppie disponibili`);
  }

  async scanOpportunities() {
    console.log('\n2. Scansione opportunità...');
    
    try {
      // Ottieni alcune coppie per test
      const pairsLength = await this.factory.allPairsLength();
      const maxPairs = Math.min(20, pairsLength); // Test solo prime 20 coppie
      
      console.log(`   Scansionando ${maxPairs} coppie...`);
      
      for (let i = 0; i < maxPairs; i++) {
        try {
          const pairAddress = await this.factory.allPairs(i);
          await this.analyzePair(pairAddress, i);
          
          // Progress indicator
          if (i % 5 === 0) {
            console.log(`   Progress: ${i}/${maxPairs}`);
          }
          
        } catch (error) {
          console.log(`   ⚠️  Errore coppia ${i}: ${error.message}`);
        }
      }
      
      // Mostra risultati
      this.showResults();
      
    } catch (error) {
      console.error('❌ Errore durante scansione:', error.message);
    }
  }

  async analyzePair(pairAddress, index) {
    const pair = new ethers.Contract(pairAddress, this.pairABI, this.provider);
    
    try {
      // Ottieni token addresses
      const token0Address = await pair.token0();
      const token1Address = await pair.token1();
      
      // Ottieni riserve
      const reserves = await pair.getReserves();
      
      // Ottieni simboli token
      const token0 = new ethers.Contract(token0Address, this.erc20ABI, this.provider);
      const token1 = new ethers.Contract(token1Address, this.erc20ABI, this.provider);
      
      const symbol0 = await token0.symbol();
      const symbol1 = await token1.symbol();
      
      // Calcola prezzo
      const price = reserves.reserve1.gt(0) ? 
        parseFloat(ethers.utils.formatEther(reserves.reserve0)) / 
        parseFloat(ethers.utils.formatEther(reserves.reserve1)) : 0;
      
      // Salva opportunità
      this.opportunities.push({
        index,
        pair: pairAddress,
        symbol0,
        symbol1,
        reserves0: ethers.utils.formatEther(reserves.reserve0),
        reserves1: ethers.utils.formatEther(reserves.reserve1),
        price: price.toFixed(6)
      });
      
    } catch (error) {
      // Ignora errori singoli
    }
  }

  showResults() {
    console.log('\n3. Risultati scansione:');
    console.log('=======================');
    
    if (this.opportunities.length === 0) {
      console.log('❌ Nessuna opportunità trovata');
      return;
    }
    
    console.log(`✅ ${this.opportunities.length} coppie analizzate`);
    
    // Mostra prime 10 opportunità
    const top10 = this.opportunities.slice(0, 10);
    
    console.log('\n📊 Prime 10 coppie:');
    top10.forEach((opp, i) => {
      console.log(`${i + 1}. ${opp.symbol0}/${opp.symbol1}`);
      console.log(`   Prezzo: ${opp.price} | Riserve: ${parseFloat(opp.reserves0).toFixed(4)} / ${parseFloat(opp.reserves1).toFixed(4)}`);
    });
    
    // Filtra coppie con buone riserve
    const goodLiquidity = this.opportunities.filter(opp => 
      parseFloat(opp.reserves0) > 0.01 && parseFloat(opp.reserves1) > 0.01
    );
    
    console.log(`\n💧 Coppie con buona liquidità: ${goodLiquidity.length}`);
    
    // Cerca coppie WBNB
    const wbnbPairs = this.opportunities.filter(opp => 
      opp.symbol0 === 'WBNB' || opp.symbol1 === 'WBNB'
    );
    
    console.log(`🔸 Coppie WBNB: ${wbnbPairs.length}`);
    
    if (wbnbPairs.length > 0) {
      console.log('\n🔸 Coppie WBNB trovate:');
      wbnbPairs.slice(0, 5).forEach((opp, i) => {
        console.log(`${i + 1}. ${opp.symbol0}/${opp.symbol1} - Prezzo: ${opp.price}`);
      });
    }
    
    console.log('\n🎉 Scansione completata!');
    console.log('\nProssimi passi:');
    console.log('1. Configura wallet testnet');
    console.log('2. Esegui: node test-arbitrage.js');
    console.log('3. Testa monitoraggio: node parallel-monitor.js');
  }
}

// Avvia scanner
async function runTest() {
  const scanner = new TestnetScanner();
  await scanner.initialize();
}

runTest().catch(console.error); 