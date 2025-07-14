# 🔺 Bot Arbitraggio Triangolare BSC Testnet

Bot automatizzato per **arbitraggio triangolare** su **PancakeSwap** (BSC Testnet). Sfrutta le inefficienze di prezzo tra tre token in un ciclo chiuso per generare profitti senza rischi di mercato.

## 🎯 Cos'è l'Arbitraggio Triangolare?

L'arbitraggio triangolare è una strategia che sfrutta le differenze di prezzo tra tre criptovalute all'interno dello stesso exchange. Il bot esegue una sequenza di 3 scambi:

```
💡 Esempio: BNB → BUSD → USDT → BNB
```

**Vantaggi:**
- ✅ **Nessun flash loan necessario** - Usa il tuo capitale
- ✅ **Rischio minimo** - Operazioni immediate
- ✅ **Educativo** - Perfetto per imparare l'arbitraggio
- ✅ **Testnet gratuito** - Nessun costo reale

## 🏗️ Architettura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Monitor Bot   │ ←→ │ PancakeSwap V2  │ ←→ │  Smart Contract │
│  (Trova Opport) │    │   (Prezzi)      │    │   (Esegue)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Setup Rapido

### 1. Installa Dipendenze
```bash
cd BNB-Testnet
npm install
```

### 2. Configura Environment
```bash
cp ../bsc-testnet.env .env
# Modifica le tue chiavi private
```

### 3. Compila Contratti
```bash
npm run compile
```

### 4. Deploy su BSC Testnet
```bash
npm run deploy:triangular
```

### 5. Avvia Monitoraggio
```bash
npm run start:triangular
```

## 📊 Percorsi Triangolari Supportati

Il bot monitora automaticamente questi percorsi profittevoli:

| ID | Percorso | Descrizione |
|----|----------|-------------|
| 0 | `BNB → BUSD → USDT → BNB` | Partenza da BNB |
| 1 | `BNB → USDT → BUSD → BNB` | Percorso inverso |
| 2 | `BUSD → USDT → BNB → BUSD` | Partenza da BUSD |
| 3 | `USDT → BUSD → BNB → USDT` | Partenza da USDT |

## 🎮 Comandi Principali

### Monitoraggio
```bash
# Avvia monitoraggio continuo
npm run start:triangular

# Test opportunità attuali
npm run test:triangular

# Analisi profittabilità
npm run analyze:triangular
```

### Deploy & Setup
```bash
# Deploy contratto
npm run deploy:triangular

# Setup completo BSC
npm run setup:bsc
```

### Logging
```bash
# Visualizza log opportunità
npm run logs:opportunities

# Visualizza log profitti
npm run logs:profit

# Visualizza log errori
npm run logs:error
```

## 💰 Come Funziona

### 1. Scansione Automatica
Il bot scansiona continuamente i prezzi su PancakeSwap per identificare opportunità:

```javascript
// Esempio di calcolo
Input: 0.1 BNB
Step 1: 0.1 BNB → 28.5 BUSD
Step 2: 28.5 BUSD → 28.6 USDT  
Step 3: 28.6 USDT → 0.1005 BNB
Profitto: 0.0005 BNB (0.5%)
```

### 2. Esecuzione Automatica
Quando trova un'opportunità profittevole:
- ✅ Verifica liquidità sufficiente
- ✅ Calcola gas ottimale
- ✅ Esegue transazione
- ✅ Log del risultato

### 3. Gestione Rischi
- 🛡️ Slippage protection
- 🛡️ MEV protection
- 🛡️ Emergency stop
- 🛡️ Retry automatico

## 🔧 Configurazione

### Parametri Principali
```javascript
// bot/config.js
triangularArbitrage: {
  minAmount: 0.001,          // BNB minimo per trade
  maxAmount: 1.0,            // BNB massimo per trade
  minProfitPercentage: 0.1,  // Profitto minimo 0.1%
  maxSlippage: 2.0           // Slippage massimo 2%
}
```

### Monitoraggio
```javascript
monitoring: {
  triangularScanInterval: 3000,  // Scansione ogni 3 secondi
  enableCaching: true,           // Cache prezzi
  cacheTTL: 30                   // Cache 30 secondi
}
```

## 🧪 Testing

### Test Completo
```bash
# Esegui tutti i test
npm run test:triangular
```

Il test include:
- ✅ Verifica percorsi configurati
- ✅ Controllo esistenza pair
- ✅ Analisi liquidità
- ✅ Calcolo opportunità
- ✅ Scansione completa
- ✅ Statistiche performance

### Modalità Dry Run
```bash
# Test senza transazioni reali
DRY_RUN=true npm run start:triangular
```

## 📈 Strategia di Profitto

### Fattori Chiave
1. **Velocità** - Opportunità durano millisecondi
2. **Volume** - Maggiore capitale = maggiori profitti
3. **Gas** - Ottimizzazione costi transazione
4. **Liquidità** - Pair con liquidità sufficiente

### Profittabilità Attesa
- 📊 **Micro-profitti**: 0.01% - 0.1%
- 📊 **Opportunità normali**: 0.1% - 0.5%
- 📊 **Opportunità rare**: 0.5% - 2%

## 🚨 Gestione Rischi

### Controlli Automatici
```javascript
// Controlli pre-esecuzione
✅ Verifica saldo sufficiente
✅ Calcola profitto atteso
✅ Simula transazione
✅ Controlla slippage
✅ Verifica gas disponibile
```

### Limiti di Sicurezza
- 🛡️ **Stop Loss**: 5% perdita giornaliera
- 🛡️ **Max Position**: 1 BNB per trade
- 🛡️ **Timeout**: 5 minuti per transazione

## 📊 Dashboard & Monitoring

### Statistiche in Tempo Reale
```bash
📊 Report periodico - 14:30:15
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 Statistiche:
   • Scansioni totali: 1,247
   • Opportunità profittevoli: 23
   • Tasso profittabilità: 1.84%
   • Profitto medio: 0.15%
🏆 Migliore opportunità:
   • Percorso: BNB-BUSD-USDT
   • Profitto: 0.45%
   • Timestamp: 14:28:43
💾 Cache: 156 voci
```

## 🔗 Indirizzi Importanti

### BSC Testnet
- **ChainID**: 97
- **RPC**: https://data-seed-prebsc-1-s1.binance.org:8545
- **Explorer**: https://testnet.bscscan.com

### Contratti
- **PancakeSwap Router**: `0xD99D1c33F9fC3444f8101754aBC46c52416550D1`
- **PancakeSwap Factory**: `0x6725f303b657a9451d8ba641348b6761a6cc7a17`

### Token Testnet
- **WBNB**: `0xae13d989dac2f0debff460ac112a837c89baa7cd`
- **BUSD**: `0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee`
- **USDT**: `0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684`

## 🎓 Risorse Utili

### Documentazione
- [BSC Testnet Guide](./BSC_TESTNET_GUIDE.md)
- [PancakeSwap Docs](https://docs.pancakeswap.finance/)
- [Arbitrage Theory](https://academy.binance.com/en/articles/triangular-arbitrage-explained)

### Tools
- [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart)
- [PancakeSwap Testnet](https://pancake.kiemtienonline360.com/)
- [BSCScan Testnet](https://testnet.bscscan.com)

## 🆘 Troubleshooting

### Problemi Comuni

**"Nessuna opportunità trovata"**
```bash
# Riduci soglia minima di profitto
MIN_TRIANGULAR_PROFIT=0.01 npm run start:triangular
```

**"Transazione fallita"**
```bash
# Aumenta gas limit
GAS_LIMIT=500000 npm run start:triangular
```

**"Errore di connessione"**
```bash
# Verifica RPC
npm run test:connection
```

### Log Debugging
```bash
# Modalità verbose
LOG_LEVEL=debug npm run start:triangular

# Monitora errori
tail -f logs/error.log
```

## 🤝 Contribuire

1. Fork il repository
2. Crea feature branch
3. Commit changes
4. Push e crea PR

## 📝 Licenza

MIT License - Vedi [LICENSE](LICENSE) per dettagli.

## ⚠️ Disclaimer

**Solo per scopi educativi e di testing**. Utilizza fondi testnet. Non si assume responsabilità per perdite su mainnet.

---

🚀 **Buon arbitraggio!** 

Per supporto: [Issues](https://github.com/your-repo/issues)
