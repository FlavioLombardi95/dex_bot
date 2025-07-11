# 🧪 Guida Testnet Completa - Polygon PoS Amoy

Guida dettagliata per testare il bot di arbitraggio crypto su **Polygon PoS Amoy testnet** con analisi costi e configurazione ottimale.

## 🎯 Vantaggi Testnet

### 💰 **Costi Zero**
- **Gas fees**: Gratuite o quasi
- **Testing**: Senza rischi finanziari
- **Sviluppo**: Ambiente sicuro
- **Debugging**: Completo

### 🔒 **Sicurezza**
- **Nessun rischio**: Fondi reali
- **Test completi**: Tutte le funzionalità
- **Debugging**: Esteso
- **Validazione**: Configurazione

## 📊 Configurazione Testnet

### 🔧 **Setup Polygon PoS Amoy**

#### **Configurazione .env**
```env
# Testnet Configuration
NETWORK=amoy
CHAIN_ID=80002

# RPC Configuration
RPC_URL=https://rpc-amoy.polygon.technology

# Wallet Configuration
PRIVATE_KEY=your_amoy_private_key_here

# Bot Configuration
MIN_PROFIT_THRESHOLD=0.001  # 0.1% per testnet
MAX_SLIPPAGE=0.05           # 5% per testnet
DRY_RUN=true
LOG_LEVEL=debug

# Gas Configuration (Testnet)
GAS_LIMIT=1000000
GAS_PRICE=30000000000       # 30 gwei
```

#### **Token Testnet**
```env
# Testnet Tokens
WMATIC=0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889
USDC=0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747
USDT=0xA02f6adc7926efeBBd59Fd43A84f1E0C1232Fa2D
DAI=0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F
```

#### **DEX Testnet**
```env
# Uniswap V2 Amoy
UNISWAP_ROUTER=0x8954AfA98594b838b254aa3828C70f1E5b6Ec4eA
UNISWAP_FACTORY=0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f

# SushiSwap Amoy
SUSHISWAP_ROUTER=0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506
SUSHISWAP_FACTORY=0xc35DADB65012eC5796536bD9864eD8773aBc74C4
```

## 🚀 Setup Testnet

### 1️⃣ **Ottieni POL Testnet**
```bash
# Faucet Polygon PoS Amoy
# https://faucet.polygon.technology/

# Seleziona "Amoy" dal dropdown
# Incolla il tuo indirizzo wallet
# Clicca "Submit" per ricevere POL
```

### 2️⃣ **Configurazione Wallet**
```bash
# Crea file .env per testnet
cp polygon-amoy.env .env

# Modifica configurazione
nano .env
```

### 3️⃣ **Test Connessione**
```bash
# Test connessione RPC
npm run test:connection

# Test wallet
npm run test:wallet

# Test contratti
npm run test:contracts
```

## 🧪 Test Suite Completa

### 🔍 **Test Sistema**
```bash
# Test completo sistema
npm run test:polygon

# Test configurazione
npm run test:config

# Test connessione
npm run test:connection
```

### 📊 **Analisi Costi Testnet**
```bash
# Analisi costi testnet
npm run polygon-costs:testnet

# Simulazione costi
npm run simulate:costs

# Analisi profittabilità
npm run profitability:testnet
```

### 🔍 **Analisi Opportunità**
```bash
# Analisi opportunità testnet
npm run analyze:testnet

# Monitoraggio testnet
npm run real-data:monitor:testnet

# Simulazione dati
npm run simulate:data
```

## 📊 Monitoraggio Testnet

### 📋 **Logging Testnet**
```bash
# Monitora log testnet
tail -f logs/amoy-arbitrage.log

# Cerca errori testnet
grep "ERROR" logs/amoy-arbitrage.log

# Cerca opportunità testnet
grep "opportunità" logs/amoy-arbitrage.log
```

### 🔧 **Debugging Testnet**
```bash
# Debug completo testnet
LOG_LEVEL=debug npm run start:polygon:testnet

# Test connessione RPC
npm run test:rpc:testnet

# Verifica configurazione
node -e "console.log(require('./bot/config.js'))"
```

## 💰 Analisi Costi Testnet

### 📈 **Confronto Testnet vs Mainnet**

| Costo | Testnet | Mainnet | Vantaggio |
|-------|---------|---------|-----------|
| **Gas Cost** | $0.00 | $0.03 | **Gratuito** |
| **Flash Loan Fee** | 0.09% | 0.09% | Stesso |
| **Infrastruttura** | $0.00 | $16.33/giorno | **Gratuito** |
| **Totale per Trade** | $0.00 | $0.12 | **Gratuito** |

### 🎯 **Soglie Testnet**

| Trade Size | Spread Minimo | Status | Profitto Netto |
|------------|---------------|---------|----------------|
| $1,000     | **>0.01%**   | ✅ **POSSIBILE** | $0.10 |
| $5,000     | **>0.01%**   | ✅ **POSSIBILE** | $0.50 |
| $10,000    | **>0.01%**   | ✅ **POSSIBILE** | $1.00 |
| $25,000    | **>0.01%**   | ✅ **POSSIBILE** | $2.50 |
| $50,000    | **>0.01%**   | ✅ **POSSIBILE** | $5.00 |
| $100,000   | **>0.01%**   | ✅ **POSSIBILE** | $10.00 |

## 🛠️ Script Testnet

### 🔧 **Setup e Test**
```bash
# Setup testnet completo
npm run setup:testnet

# Test suite testnet
npm run test:polygon:testnet

# Test connessione testnet
npm run test:connection:testnet
```

### 💰 **Analisi Costi**
```bash
# Analisi costi testnet
npm run polygon-costs:testnet

# Simulazione costi testnet
npm run simulate:costs:testnet

# Analisi profittabilità testnet
npm run profitability:testnet
```

### 📊 **Analisi Opportunità**
```bash
# Analisi opportunità testnet
npm run analyze:testnet

# Monitoraggio testnet
npm run real-data:monitor:testnet

# Simulazione dati testnet
npm run simulate:data:testnet
```

### ⚙️ **Configurazione**
```bash
# Configurazione testnet
npm run config:testnet

# Deploy testnet
npm run deploy:testnet

# Verifica contratto testnet
npm run verify:contract:testnet
```

## 🔒 Sicurezza Testnet

### 🛡️ **Best Practices Testnet**

#### **1. Ambiente Sicuro**
```bash
# Usa sempre testnet per sviluppo
npm run start:polygon:testnet

# Mantieni DRY_RUN=true
DRY_RUN=true npm run start:polygon:testnet
```

#### **2. Debugging Completo**
```env
LOG_LEVEL=debug
```

#### **3. Validazione Configurazione**
```bash
# Verifica configurazione
npm run test:config

# Test connessione
npm run test:connection

# Verifica wallet
npm run test:wallet
```

## 📊 Specifiche Rete Amoy

### 🔗 **Dettagli Rete**
- **Nome**: Polygon PoS Amoy Testnet
- **RPC URL**: `https://rpc-amoy.polygon.technology/`
- **Chain ID**: 80002
- **Currency Symbol**: POL
- **Block Explorer**: `https://amoy.polygonscan.com/`

### 🏦 **Faucet Ufficiale**
```bash
# Faucet Polygon
https://faucet.polygon.technology/

# Selezione rete: Amoy
# Token: POL (ex-MATIC)
```

### 🔧 **Configurazione Wallet**
```json
{
  "networkName": "Polygon PoS Amoy Testnet",
  "rpcUrl": "https://rpc-amoy.polygon.technology/",
  "chainId": 80002,
  "symbol": "POL",
  "blockExplorer": "https://amoy.polygonscan.com/"
}
```

## 🔄 Migrazione da Mumbai

### ⚠️ **Mumbai Deprecato**
Mumbai testnet è stato deprecato e sostituito da Amoy. Tutte le configurazioni devono essere aggiornate:

#### **Modifiche Principali**
- **Chain ID**: 80001 → 80002
- **RPC URL**: `rpc-mumbai.maticvigil.com` → `rpc-amoy.polygon.technology`
- **Currency**: MATIC → POL
- **Explorer**: `mumbai.polygonscan.com` → `amoy.polygonscan.com`

#### **Aggiornamento Configurazione**
```bash
# Aggiorna .env
NETWORK=amoy
CHAIN_ID=80002
RPC_URL=https://rpc-amoy.polygon.technology
```

## 🔧 Test Completi

### 1️⃣ **Test Connessione**
```bash
# Test RPC
node -e "
const { ethers } = require('ethers');
const provider = new ethers.providers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
provider.getNetwork().then(network => 
  console.log('Rete:', network.name, 'Chain ID:', network.chainId)
);
"
```

### 2️⃣ **Test Wallet**
```bash
# Verifica balance
npm run test:balance

# Test transazione
npm run test:transaction
```

### 3️⃣ **Test Contratti**
```bash
# Deploy test
npm run deploy:testnet

# Verifica contratto
npm run verify:contract:testnet
```

## 📚 Risorse Utili

### 🔗 **Link Importanti**
- [Polygon Amoy Faucet](https://faucet.polygon.technology/)
- [Amoy Explorer](https://amoy.polygonscan.com/)
- [Polygon RPC](https://rpc-amoy.polygon.technology/)
- [Uniswap Polygon](https://app.uniswap.org/)
- [SushiSwap Polygon](https://app.sushi.com/)

### 📖 **Documentazione**
- [README.md](README.md) - Guida principale
- [POLYGON_GUIDE.md](POLYGON_GUIDE.md) - Guida Polygon
- [SETUP.md](SETUP.md) - Guida setup completa
- [CHANGELOG.md](CHANGELOG.md) - Changelog completo

## 🆘 Troubleshooting

### ❌ **Problemi Comuni**

#### **Errore Connessione RPC**
```bash
# Verifica connessione
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  https://rpc-amoy.polygon.technology/
```

#### **Errore Gas**
```bash
# Aumenta gas limit
GAS_LIMIT=1000000 npm run start:polygon
```

#### **Errore Token**
```bash
# Verifica bilancio POL
npm run test:balance
```

### ✅ **Soluzioni**

#### **RPC Alternativo**
```env
# Se l'RPC principale non funziona
RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com
```

#### **Configurazione Gas**
```env
# Ottimizzazione gas per testnet
GAS_LIMIT=1000000
GAS_PRICE=30000000000
MAX_FEE_PER_GAS=40000000000
```

---

**🎯 Amoy è ora la testnet ufficiale di Polygon PoS. Tutte le configurazioni sono aggiornate per garantire compatibilità e funzionalità complete.** 