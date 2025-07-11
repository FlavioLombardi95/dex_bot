# 🛠️ Setup Guide - DEX Arbitrage Bot Multi-Network

## 🚀 Panoramica Setup

Guida completa per configurare il DEX Arbitrage Bot su multiple blockchain testnet. Il progetto è organizzato in configurazioni separate per massimizzare l'efficienza e la chiarezza.

## 📁 Struttura Progetto

```
DEX Bot/
├── 📁 BNB-Testnet/        # Configurazione BSC Testnet (Raccomandato per iniziare)
├── 📁 POL-Amoy/           # Configurazione Polygon PoS Amoy (Avanzato)
├── 📋 README.md           # Guida generale 
├── ⚙️ package.json        # Configurazione multi-network
├── 📝 SETUP.md            # Questa guida
└── 📜 CHANGELOG.md        # Cronologia modifiche
```

## 🎯 Quale Configurazione Scegliere?

### 🟡 BNB-Testnet (Raccomandato per Iniziare)
- ✅ **DEX funzionali**: PancakeSwap e BakerySwap attivi
- ✅ **Liquidità reale**: Coppie token esistenti e trading
- ✅ **Arbitraggio immediato**: Opportunità reali su testnet
- ✅ **Costi bassi**: ~0.001 BNB per transazione
- 🎯 **Ideale per**: Prime prove, test realistici, validazione logica

### 💜 POL-Amoy (Per Testing Avanzato L2)
- ✅ **Costi ultra-bassi**: Gas 1000x più economico
- ✅ **Flash loans**: Integrazione Balancer per capital efficiency
- ✅ **Layer 2**: Tecnologia Polygon per alta velocità
- ⚠️ **DEX limitati**: Liquidità testnet limitata
- 🎯 **Ideale per**: Analisi costi L2, flash loan testing, ricerca

## 🚀 Setup Rapido

### Opzione A: BNB-Testnet (Raccomandato)

```bash
# 1. Vai nella configurazione BNB
cd BNB-Testnet

# 2. Installa dipendenze
npm install

# 3. Configura ambiente
cp bsc-testnet.env .env
nano .env  # Inserisci PRIVATE_KEY e WALLET_ADDRESS

# 4. Ottieni BNB testnet
# Vai su: https://testnet.binance.org/faucet-smart

# 5. Test setup
npm run setup:bsc

# 6. Deploy contratto
npm run deploy:bsc

# 7. Avvia bot
npm run start:bsc
```

### Opzione B: POL-Amoy (Avanzato)

```bash
# 1. Vai nella configurazione Polygon
cd POL-Amoy

# 2. Installa dipendenze
npm install

# 3. Configura ambiente
cp polygon-amoy.env .env
nano .env  # Inserisci PRIVATE_KEY e WALLET_ADDRESS

# 4. Ottieni POL testnet
# Vai su: https://faucet.polygon.technology/

# 5. Test setup
npm run setup:polygon

# 6. Deploy contratto
npm run deploy:polygon

# 7. Avvia bot
npm run start:polygon
```

## 🔧 Setup Dettagliato

### 1. Prerequisiti Sistema

#### Software Richiesto
```bash
# Node.js v16+
node --version  # >= 16.0.0

# npm v8+
npm --version   # >= 8.0.0

# Git
git --version
```

#### Installazione Node.js (se necessario)
```bash
# macOS (con Homebrew)
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows
# Scarica da: https://nodejs.org/
```

### 2. Clone Repository

```bash
# Clone del progetto
git clone https://github.com/FlavioLombardi95/dex_bot.git
cd "DEX Bot"

# Verifica struttura
ls -la
# Dovresti vedere: BNB-Testnet/ POL-Amoy/ README.md package.json
```

### 3. Configurazione Wallet

#### Crea Wallet Testnet (Raccomandato)
```bash
# Genera nuova chiave privata per testnet
node -e "console.log('Private Key:', require('crypto').randomBytes(32).toString('hex'))"

# Ricava indirizzo da chiave privata
node -e "const ethers = require('ethers'); const wallet = new ethers.Wallet('0x' + process.argv[1]); console.log('Address:', wallet.address)" YOUR_PRIVATE_KEY
```

#### O Usa Wallet Esistente
- Esporta chiave privata da MetaMask
- ⚠️ **IMPORTANTE**: Usa solo wallet dedicato per testnet
- ⚠️ **MAI** condividere la chiave privata

### 4. Configurazione MetaMask

#### BNB-Testnet
```
Network Name: BSC Testnet
RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
Chain ID: 97
Symbol: BNB
Explorer: https://testnet.bscscan.com
```

#### POL-Amoy
```
Network Name: Polygon Amoy
RPC URL: https://rpc-amoy.polygon.technology
Chain ID: 80002
Symbol: POL
Explorer: https://www.oklink.com/amoy
```

### 5. Ottenere Token Testnet

#### BNB Testnet
1. Vai su: https://testnet.binance.org/faucet-smart
2. Inserisci il tuo indirizzo wallet
3. Completa verifica (se richiesta)
4. Ricevi 0.5-1 BNB testnet

#### POL Testnet
1. Vai su: https://faucet.polygon.technology/
2. Seleziona "Amoy"
3. Inserisci il tuo indirizzo wallet
4. Ricevi 1-10 POL testnet

### 6. Configurazione Ambiente

#### File .env Esempio (BNB-Testnet)
```bash
# Network Configuration
NETWORK=bscTestnet
CHAIN_ID=97
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545

# Wallet Configuration
PRIVATE_KEY=la_tua_chiave_privata_senza_0x
WALLET_ADDRESS=il_tuo_indirizzo_wallet

# Bot Configuration
DRY_RUN=true
MIN_PROFIT_PERCENTAGE=0.5
MAX_SLIPPAGE=1.0
GAS_MULTIPLIER=1.2
```

#### File .env Esempio (POL-Amoy)
```bash
# Network Configuration
NETWORK=amoy
CHAIN_ID=80002
RPC_URL=https://rpc-amoy.polygon.technology

# Wallet Configuration
PRIVATE_KEY=la_tua_chiave_privata_senza_0x
WALLET_ADDRESS=il_tuo_indirizzo_wallet

# Bot Configuration
DRY_RUN=true
MIN_PROFIT_PERCENTAGE=0.2
MAX_SLIPPAGE=2.0
GAS_MULTIPLIER=1.5
```

## 🧪 Testing e Validazione

### Test Base
```bash
# Test configurazione
npm run test:config

# Test connessione RPC
npm run test:connection

# Test saldi wallet
npm run setup:bsc  # o setup:polygon
```

### Test Avanzati
```bash
# Test simulazione arbitraggio
npm run test:simulation

# Test con dati realistici
npm run test:realistic

# Analisi costi completa
npm run analyze:costs
```

### Validazione Deploy
```bash
# Compila contratti
npm run compile

# Deploy su testnet
npm run deploy:bsc  # o deploy:polygon

# Verifica contratto (opzionale)
npm run verify:bsc  # o verify:polygon
```

## 📊 Monitoraggio e Debugging

### Comandi Monitoring
```bash
# Log in tempo reale
npm run logs

# Log specifici
tail -f bsc-arbitrage.log      # BNB-Testnet
tail -f polygon-arbitrage.log  # POL-Amoy

# Statistiche profitti
npm run profit:stats
```

### Debug Comuni
```bash
# Verifica connessione
npm run test:connection

# Controlla configurazione
npm run config:validate

# Reset cache
npm run clean
```

## 🔐 Sicurezza e Best Practices

### Gestione Chiavi Private
- ✅ Usa wallet dedicato per testnet
- ✅ Non committare mai file .env
- ✅ Testa sempre con DRY_RUN=true prima
- ✅ Monitora transazioni costantemente
- ❌ Non condividere mai chiavi private
- ❌ Non usare wallet principali per testing

### File .gitignore
```bash
# Verifica che .env sia ignorato
cat .gitignore | grep .env

# Se non presente, aggiungi:
echo "*.env" >> .gitignore
echo ".env*" >> .gitignore
```

## 🆘 Risoluzione Problemi

### Problemi Comuni

#### "Network Error" / "RPC Error"
```bash
# Verifica RPC endpoint
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  https://data-seed-prebsc-1-s1.binance.org:8545

# Prova RPC alternativi
# BSC: https://data-seed-prebsc-2-s1.binance.org:8545
# Polygon: https://rpc-amoy.polygon.technology
```

#### "Insufficient Balance"
```bash
# Verifica saldi
npm run setup:bsc  # mostra saldi

# Usa faucet per ottenere token
# BSC: https://testnet.binance.org/faucet-smart
# Polygon: https://faucet.polygon.technology/
```

#### "Contract Deployment Failed"
```bash
# Verifica gas price
npm run analyze:costs

# Aumenta gas limit nel file config
# gas: { limit: 5000000 }

# Riprova deploy
npm run deploy:bsc
```

#### "No Arbitrage Opportunities"
```bash
# Normale in mercati stabili
# Verifica che DEX siano sincronizzati
npm run test:connection

# Controlla prezzi manualmente
npm run analyze:real
```

### Log e Debug
```bash
# Debug completo
DEBUG=true npm run start:bsc

# Log dettagliati
LOG_LEVEL=debug npm run start:bsc

# Analisi errori
grep "ERROR" *.log
```

## 📈 Ottimizzazione Performance

### Configurazione Gas
```bash
# BNB-Testnet
GAS_PRICE_GWEI=10
GAS_MULTIPLIER=1.2

# POL-Amoy
GAS_PRICE_GWEI=30
GAS_MULTIPLIER=1.5
```

### Parametri Trading
```bash
# Conservativo
MIN_PROFIT_PERCENTAGE=1.0
MAX_SLIPPAGE=0.5

# Aggressivo
MIN_PROFIT_PERCENTAGE=0.3
MAX_SLIPPAGE=2.0
```

## 🎯 Prossimi Passi

### Dopo Setup Iniziale
1. ✅ Testa con DRY_RUN=true
2. ✅ Monitora log per 30-60 minuti
3. ✅ Verifica opportunità rilevate
4. ✅ Ottimizza parametri se necessario
5. ✅ Gradualmente riduci DRY_RUN per test reali

### Progressione Raccomandata
1. **Inizia con BNB-Testnet** per familiarizzare
2. **Testa POL-Amoy** per analisi Layer 2
3. **Confronta performance** tra le due reti
4. **Ottimizza configurazioni** basandoti sui risultati
5. **Considera mainnet** solo dopo testing estensivo

---

## 🔗 Collegamenti Utili

### Faucet
- [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart)
- [Polygon Faucet](https://faucet.polygon.technology/)

### Explorer
- [BSC Testnet Explorer](https://testnet.bscscan.com)
- [Polygon Amoy Explorer](https://www.oklink.com/amoy)

### Documentazione
- [BSC Docs](https://docs.bnbchain.org/)
- [Polygon Docs](https://docs.polygon.technology/)

---

**🚀 Setup completato! Ora sei pronto per testare il bot di arbitraggio DEX!** 