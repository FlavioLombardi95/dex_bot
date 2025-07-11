# 🚀 Guida Setup Completa - Polygon L2

Guida dettagliata per configurare e avviare il bot di arbitraggio crypto su **Polygon Layer 2** con analisi completa dei costi.

## 📋 Prerequisiti

### 💻 **Sistema**
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: Versione 16.0.0 o superiore
- **npm**: Versione 8.0.0 o superiore
- **Git**: Versione 2.30.0 o superiore

### 🔧 **Verifica Prerequisiti**
```bash
# Verifica Node.js
node --version  # Deve essere >= 16.0.0

# Verifica npm
npm --version   # Deve essere >= 8.0.0

# Verifica Git
git --version   # Deve essere >= 2.30.0
```

## 🎯 Installazione

### 1️⃣ **Clone Repository**
```bash
# Clona il repository
git clone https://github.com/FlavioLombardi95/dex_bot.git
cd dex_bot

# Verifica struttura
ls -la
```

### 2️⃣ **Installazione Dipendenze**
```bash
# Installa dipendenze
npm install

# Verifica installazione
npm list --depth=0
```

### 3️⃣ **Configurazione Ambiente**

#### 🔑 **Setup Wallet**
```bash
# Crea file .env
cp polygon-mainnet.env .env

# Modifica configurazione
nano .env
```

#### 📝 **Configurazione .env**
```env
# Wallet Configuration
PRIVATE_KEY=your_polygon_private_key_here

# Polygon RPC Configuration
RPC_URL=https://polygon-rpc.com
CHAIN_ID=137

# Bot Configuration
MIN_PROFIT_THRESHOLD=0.002
MAX_SLIPPAGE=0.02
DRY_RUN=true
LOG_LEVEL=info

# DEX Configuration
UNISWAP_ROUTER=0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff
SUSHISWAP_ROUTER=0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506

# Flash Loan Configuration
BALANCER_VAULT=0xBA12222222228d8Ba445958a75a0704d566BF2C8
FLASH_LOAN_FEE=0.0009

# Gas Configuration (Polygon L2)
GAS_LIMIT=500000
GAS_PRICE=30000000000  # 30 gwei
```

## 🧪 Test e Validazione

### 🔍 **Test Sistema Base**
```bash
# Test configurazione
npm run test:polygon

# Verifica connessione
npm run test:connection

# Test contratti
npm run test:contracts
```

### 📊 **Analisi Costi**
```bash
# Analisi costi Polygon
npm run polygon-costs

# Confronto Ethereum vs Polygon
npm run costs

# Analisi profittabilità
npm run profitability
```

### 🔍 **Analisi Opportunità**
```bash
# Analisi opportunità storiche
npm run analyze

# Monitoraggio tempo reale
npm run real-data:monitor

# Analisi dati salvati
npm run real-data:analyze
```

## 🚀 Deploy e Avvio

### 1️⃣ **Deploy Smart Contract**
```bash
# Deploy su Polygon
npm run deploy:polygon

# Verifica deploy
npm run verify:contract
```

### 2️⃣ **Configurazione Finale**
```bash
# Mostra configurazione ottimale
npm run config

# Setup Polygon
npm run setup:polygon
```

### 3️⃣ **Avvio Bot**
```bash
# Avvio in modalità test
npm run start:polygon

# Avvio con logging dettagliato
LOG_LEVEL=debug npm run start:polygon

# Avvio in background
nohup npm run start:polygon > bot.log 2>&1 &
```

## 📊 Monitoraggio e Debug

### 📋 **Logging**
```bash
# Monitora log in tempo reale
tail -f logs/polygon-arbitrage.log

# Cerca errori
grep "ERROR" logs/polygon-arbitrage.log

# Cerca opportunità
grep "opportunità" logs/polygon-arbitrage.log
```

### 🔧 **Debugging**
```bash
# Debug completo
LOG_LEVEL=debug npm run start:polygon

# Test connessione RPC
npm run test:rpc

# Verifica configurazione
node -e "console.log(require('./bot/config.js'))"
```

## 💰 Configurazione Ottimale

### 🎯 **Parametri Raccomandati**
- **Soglia profitto minimo**: 0.2%
- **Trade size minimo**: $10,000
- **Gas price**: 30 gwei (Polygon)
- **Slippage massimo**: 2%
- **Frequenza controllo**: 1 secondo

### 📈 **Analisi Costi Polygon**
| Trade Size | Spread Minimo | Profitto Netto |
|------------|---------------|----------------|
| $1,000     | 3.16%        | -$31.60        |
| $5,000     | 0.70%        | -$35.00        |
| $10,000    | 0.40%        | $5.00          |
| $25,000    | 0.21%        | $27.50         |
| $50,000    | 0.15%        | $62.50         |
| $100,000   | 0.12%        | $107.50        |

## 🔒 Sicurezza

### 🛡️ **Best Practices**
- **Usa sempre testnet** prima di mainnet
- **Mantieni DRY_RUN=true** inizialmente
- **Monitora i log** continuamente
- **Testa con piccoli importi**
- **Aggiorna regolarmente** le dipendenze

### ⚠️ **Controlli Sicurezza**
```bash
# Verifica configurazione sicurezza
npm run security:check

# Test funzioni di emergenza
npm run test:emergency

# Verifica accessi
npm run verify:access
```

## 📚 Risorse Utili

### 🔗 **Link Importanti**
- [Polygon Faucet](https://faucet.polygon.technology/)
- [Polygon Explorer](https://polygonscan.com/)
- [Polygon RPC](https://polygon-rpc.com/)
- [Uniswap Polygon](https://app.uniswap.org/)
- [SushiSwap Polygon](https://app.sushi.com/)

### 📖 **Documentazione**
- [README.md](README.md) - Guida principale
- [POLYGON_GUIDE.md](POLYGON_GUIDE.md) - Guida Polygon
- [TESTNET_GUIDE.md](TESTNET_GUIDE.md) - Guida testnet
- [CHANGELOG.md](CHANGELOG.md) - Changelog completo

## 🆘 Troubleshooting

### ❌ **Problemi Comuni**

#### **Errore Connessione RPC**
```bash
# Prova endpoint alternativi
RPC_URL=https://rpc-mainnet.maticvigil.com npm run start:polygon
RPC_URL=https://polygon-rpc.com npm run start:polygon
```

#### **Errore Gas**
```bash
# Aumenta gas limit
GAS_LIMIT=1000000 npm run start:polygon

# Aumenta gas price
GAS_PRICE=50000000000 npm run start:polygon
```

#### **Errore Wallet**
```bash
# Verifica chiave privata
node -e "console.log(require('ethers').Wallet.createRandom().privateKey)"

# Verifica saldo
npm run check:balance
```

### 🔧 **Comandi Diagnostici**
```bash
# Diagnosi completa
npm run diagnose

# Test connessione
npm run test:connection

# Verifica contratti
npm run verify:contracts

# Controllo configurazione
npm run check:config
```

## 🎯 Configurazione Finale

### ✅ **Checklist Pre-Avvio**
- [ ] Node.js 16+ installato
- [ ] Dipendenze installate
- [ ] File .env configurato
- [ ] Chiave privata inserita
- [ ] Saldo MATIC sufficiente
- [ ] Test sistema passati
- [ ] Analisi costi completata
- [ ] Configurazione ottimale applicata

### 🚀 **Comando Avvio Finale**
```bash
# Avvio ottimale per Polygon
npm run start:polygon:optimized
```

---

**🎯 Obiettivo**: Setup completo e ottimizzato per Polygon L2 con analisi costi e configurazione profittevole. 