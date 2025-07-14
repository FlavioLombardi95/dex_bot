# 🤖 DEX Arbitrage Bot - Multi-Network

## 🚀 Panoramica Progetto

Bot di arbitraggio decentralizzato per DEX con supporto multi-network. Progetto organizzato per testare e confrontare diverse blockchain testnet con focus su costi e performance.

## 📁 Struttura Progetto

```
DEX Bot/
├── 📁 POL-Amoy/          # Configurazione Polygon PoS Amoy Testnet
│   ├── bot/               # Bot core per Layer 2
│   ├── contracts/         # Smart contracts ottimizzati L2
│   ├── scripts/           # Script analisi Polygon
│   └── README.md          # Guida specifica POL-Amoy
├── 📁 BNB-Testnet/       # Configurazione BSC Testnet
│   ├── bot/               # Bot core per BSC
│   ├── contracts/         # Smart contracts BSC
│   ├── scripts/           # Script analisi BSC
│   └── README.md          # Guida specifica BNB-Testnet
└── README.md              # Questa guida generale
```

## 🌐 Configurazioni Disponibili

### 💜 POL-Amoy (Polygon PoS Amoy Testnet)
- **Focus**: Layer 2 con costi ultra-bassi
- **Valuta**: POL (ex-MATIC)
- **Vantaggi**: Gas 1000x più economico, flash loans
- **DEX**: Uniswap V2, SushiSwap
- **Stato**: ✅ Configurazione completa e testata

### 🟡 BNB-Testnet (Binance Smart Chain Testnet)
- **Focus**: DEX funzionali e alta liquidità
- **Valuta**: BNB
- **Vantaggi**: DEX reali, PancakeSwap attivo
- **DEX**: PancakeSwap V2, BakerySwap
- **Stato**: ✅ Configurazione nuova e funzionale

## 🎯 Quale Scegliere?

### 🔥 Raccomandato per Iniziare: **BNB-Testnet**
- ✅ DEX completamente funzionali
- ✅ Liquidità reale su testnet
- ✅ PancakeSwap e BakerySwap attivi
- ✅ Coppie token esistenti e trading
- ✅ Arbitraggio possibile immediatamente

### 🔬 Per Testing Avanzato: **POL-Amoy**
- ✅ Costi gas ultra-bassi
- ✅ Flash loans Balancer
- ✅ Analisi Layer 2 completa
- ⚠️ Limitata liquidità DEX su testnet

## 🚀 Quick Start

### 1. Scegli la Configurazione

#### Per BNB-Testnet (Raccomandato)
```bash
cd BNB-Testnet
npm install
npm run setup:bsc
npm run start:bsc
```

#### Per POL-Amoy (Avanzato)
```bash
cd POL-Amoy
npm install
npm run setup:polygon
npm run start:polygon
```

### 2. Ottieni Token Testnet

#### BNB Testnet
- 🔗 **Faucet**: https://testnet.binance.org/faucet-smart
- 💰 **Quantità**: 0.5-1 BNB testnet
- ⚡ **Velocità**: Istantaneo

#### POL Testnet
- 🔗 **Faucet**: https://faucet.polygon.technology/
- 💰 **Quantità**: 1-10 POL testnet
- ⚡ **Velocità**: 1-2 minuti

## 📊 Confronto Configurazioni

| Caratteristica | BNB-Testnet | POL-Amoy |
|----------------|-------------|----------|
| **Costi Gas** | ~$0.001 | ~$0.0003 |
| **Velocità** | ~3 secondi | ~2 secondi |
| **DEX Funzionali** | ✅ Sì | ⚠️ Limitati |
| **Liquidità** | ✅ Alta | ⚠️ Bassa |
| **Flash Loans** | ⚠️ Limitati | ✅ Balancer |
| **Arbitraggio Reale** | ✅ Possibile | ⚠️ Simulato |
| **Complessità** | 🟢 Bassa | 🟡 Media |

## 🛠️ Configurazione Generale

### Prerequisiti
- Node.js v16+
- npm o yarn
- MetaMask
- Git

### Setup Ambiente
```bash
# Clona il repository
git clone <repository-url>
cd "DEX Bot"

# Scegli la configurazione
cd BNB-Testnet  # o POL-Amoy

# Installa dipendenze
npm install
```

## 💡 Comandi Cross-Network

### Sviluppo
```bash
# Test completo
npm run test:full

# Analisi costi
npm run analyze:costs

# Monitoraggio
npm run logs
```

### Deploy
```bash
# BNB-Testnet
npm run deploy:bsc

# POL-Amoy
npm run deploy:polygon
```

## 📈 Performance Attese

### BNB-Testnet
- **Opportunità**: 100-500/ora
- **Costo transazione**: ~0.001 BNB
- **Profitto minimo**: 0.5%
- **Successo**: 85-95%

### POL-Amoy
- **Opportunità**: 1000-3600/ora
- **Costo transazione**: ~0.0003 POL
- **Profitto minimo**: 0.2%
- **Successo**: 90-98%

## 🔧 Configurazione Avanzata

### Variabili d'Ambiente
Ogni configurazione ha il suo file `.env`:

#### BNB-Testnet
```bash
# File: BNB-Testnet/bsc-testnet.env
PRIVATE_KEY=your_private_key
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
CHAIN_ID=97
```

#### POL-Amoy  
```bash
# File: POL-Amoy/polygon-amoy.env
PRIVATE_KEY=your_private_key
RPC_URL=https://rpc-amoy.polygon.technology
CHAIN_ID=80002
```

## 🔒 Sicurezza

### Best Practices
- ✅ Usa wallet dedicati per testnet
- ✅ Non condividere mai chiavi private
- ✅ Testa sempre prima di mainnet
- ✅ Monitora transazioni
- ✅ Usa DRY_RUN=true inizialmente

### Gestione Chiavi
```bash
# Genera nuova chiave per testnet
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Verifica indirizzo
node -e "const ethers = require('ethers'); const wallet = new ethers.Wallet('0x' + process.argv[1]); console.log(wallet.address)" YOUR_PRIVATE_KEY
```

## 🆘 Supporto

### Problemi Comuni
1. **"Network Error"**: Verifica RPC endpoint
2. **"Insufficient Balance"**: Usa faucet per token
3. **"Contract Error"**: Ricompila e re-deploy
4. **"No Opportunities"**: Normale in mercati stabili

### Debug
```bash
# Verifica connessione
npm run test:connection

# Controlla configurazione
npm run config:check

# Visualizza log
npm run logs
```

## 🔗 Collegamenti Utili

### Faucet
- [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart)
- [Polygon Faucet](https://faucet.polygon.technology/)

### Explorer
- [BSC Testnet Explorer](https://testnet.bscscan.com)
- [Polygon Amoy Explorer](https://www.oklink.com/amoy)

### DEX
- [PancakeSwap](https://pancakeswap.finance/)
- [Uniswap](https://app.uniswap.org/)

---

## 📝 Changelog Generale

### v2.0.0 (Current)
- ✅ Organizzazione multi-network
- ✅ Configurazione BNB-Testnet
- ✅ Configurazione POL-Amoy separata
- ✅ Guide specifiche per rete
- ✅ Script ottimizzati per rete

### v1.0.0 (Previous)
- ✅ Configurazione Polygon unica
- ✅ Analisi costi completa
- ✅ Flash loans integration

---

## 🎯 Roadmap

### Immediato
- [ ] Test completo BNB-Testnet
- [ ] Ottimizzazioni gas
- [ ] Documentazione aggiornata

### Futuro
- [ ] Arbitrum Testnet
- [ ] Ethereum Sepolia
- [ ] Configurazione mainnet
- [ ] GUI per monitoring

---

**🚀 Progetto pronto per testing multi-network!**

*Inizia con BNB-Testnet per un'esperienza immediata, poi sperimenta con POL-Amoy per analisi Layer 2.*
