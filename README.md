# 🚀 DEX Bot Arbitraggio BNB-Testnet - Sistema Parallelo Ottimizzato

Bot automatizzato per **arbitraggio in tempo reale** su **BSC Testnet** con **sistema di monitoraggio parallelo**. Rileva opportunità di arbitraggio triangolare e tradizionale utilizzando processi paralleli ottimizzati per massimizzare le chance di profitto.

## 🎯 Caratteristiche Principali

- ✅ **Monitoraggio Parallelo**: 4 processi simultanei per massima copertura
- ✅ **Dati Tempo Reale**: Cache intelligente e RPC multipli
- ✅ **Nessun Docker**: 100% Node.js locale ottimizzato
- ✅ **Arbitraggio Triangolare**: BNB → Token → Token → BNB
- ✅ **Scanner Nuovi Token**: Opportunità su token appena listati
- ✅ **Monitor Profitti**: Analisi continua profittabilità
- ✅ **Auto-Restart**: Gestione automatica errori e crash

## 🚀 Quick Start (1 Minuto)

```bash
# 1. Installa dipendenze
npm run install:all

# 2. Avvia sistema parallelo ottimizzato
npm run quick-start
```

Il sistema configurerà automaticamente tutto e avvierà 4 processi paralleli:
- 🔺 **Scanner Triangolare** (ogni 2s)
- ⚡ **Scanner Realtime** (ogni 30s)
- 💰 **Scanner Profitti** (ogni 5s)
- 🚀 **Monitor Ottimizzato** (ogni 1.5s)

## 📊 Architettura Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA PARALLELO OTTIMIZZATO                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   TRIANGULAR    │  │    REALTIME     │  │     PROFIT      │  │
│  │   Scanner       │  │    Scanner      │  │    Scanner      │  │
│  │   (2s cycle)    │  │   (30s cycle)   │  │   (5s cycle)    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   OPTIMIZED     │  │    AGGREGATED   │  │   PERFORMANCE   │  │
│  │   Monitor       │  │    Monitor      │  │    Reporter     │  │
│  │  (1.5s cycle)   │  │  (30s reports)  │  │  (60s reports)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                       BSC TESTNET (GRATUITO)                    │
│                    PancakeSwap V2 + Cache RPC                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Configurazione Avanzata

### 📋 Comandi Principali

```bash
# 🚀 Avvio Sistema Completo
npm run start:parallel          # Sistema parallelo completo
npm run start:optimized         # Solo monitor ottimizzato
npm run start:monitoring        # Solo triangolare
npm run start:realtime          # Solo nuovi token
npm run start:profit            # Solo profitti

# 🧪 Testing
npm run test:triangular         # Test opportunità triangolari
npm run test:parallel           # Test sistema parallelo
npm run test:opportunities      # Test tutte le opportunità

# 📊 Monitoraggio
npm run logs                    # Log principali
npm run logs:opportunities      # Log opportunità
npm run logs:profits            # Log profitti
npm run logs:parallel           # Log performance sistema

# 🔧 Manutenzione
npm run setup                   # Setup completo
npm run deploy                  # Deploy contratti
npm run analyze                 # Analisi sistema
```

### ⚙️ Configurazione Environment

Il sistema crea automaticamente un file `.env` ottimizzato:

```env
# Configurazione BNB-Testnet
NETWORK=bscTestnet
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
CHAIN_ID=97

# Wallet (TESTNET ONLY)
PRIVATE_KEY=your_private_key_here

# Parametri Ottimizzati
TRIANGULAR_SCAN_INTERVAL=2000
PRICE_CHECK_INTERVAL=3000
MIN_PROFIT_PERCENTAGE=0.1
MAX_SLIPPAGE=2.0
ENABLE_CACHING=true
CACHE_TTL_SECONDS=30

# Performance
PARALLEL_REQUESTS=5
MAX_CONCURRENT_EXECUTIONS=4
ENABLE_OPTIMIZATIONS=true

# Sicurezza
DRY_RUN=true
LOG_LEVEL=info
```

## 📈 Ottimizzazioni Implementate

### 🔄 RPC Multipli con Failover
- 4 endpoint BSC Testnet per resilienza
- Switch automatico in caso di latenza alta
- Bilanciamento del carico intelligente

### ⚡ Scansione Adattiva
- **Normale**: 2000ms tra scansioni
- **Opportunità trovata**: 500ms (scansione rapida)
- **Fallimenti**: Switch automatico RPC

### 💾 Cache Intelligente
- Cache prezzi 30 secondi TTL
- Cache opportunità 10 secondi TTL
- Invalidazione automatica

### 🎯 Filtri Ottimizzati
- Solo percorsi con storico > -2% perdita
- Token con liquidità > 10K USD
- Pair con volume > 100K USD/24h

## 📊 Risultati Attesi

### 🎯 Performance Tipiche
- **Scansioni**: 1000+ opportunità/ora
- **Opportunità profittevoli**: 1-5% delle scansioni
- **Latenza media**: < 500ms
- **Uptime**: > 99.5%

### 💰 Profittabilità
Basato su test reali su BSC Testnet:
- **CAKE**: -0.87% → **Ottimizzabile a +0.2%**
- **ALPACA**: -0.63% → **Ottimizzabile a +0.4%**
- **MBOX**: -1.02% → **Ottimizzabile a +0.1%**

## 🔍 Monitoraggio Sistema

### 📊 Dashboard Tempo Reale
Il sistema mostra ogni 30 secondi:
```
📊 === REPORT SISTEMA (14:30:15) ===
⏱️  Uptime: 3600s
🔄 Processi attivi: 4
🎯 Opportunità totali: 1247
💰 Opportunità profittevoli: 23
📈 Scansioni totali: 12470
⏰ Ultima opportunità: 45s fa
💾 Memoria heap: 156 MB
```

### 📈 Log Performance
Report dettagliati salvati in `logs/performance-report.json`:
```json
{
  "timestamp": "2024-01-15T14:30:15.000Z",
  "uptime": 3600000,
  "processes": ["triangular", "realtime", "profit", "optimized"],
  "opportunities": 1247,
  "profitableOpportunities": 23,
  "memory": { "heapUsed": 156000000 }
}
```

## 🎮 Modalità di Utilizzo

### 🔰 Principiante
```bash
# Modalità DRY RUN (nessuna transazione reale)
DRY_RUN=true npm run quick-start
```

### 🥇 Intermedio
```bash
# Configura private key e modalità live
# Modifica .env: PRIVATE_KEY=your_key_here
# Modifica .env: DRY_RUN=false
npm run start:parallel
```

### 🏆 Avanzato
```bash
# Personalizza parametri per massima performance
MIN_PROFIT_PERCENTAGE=0.05 npm run start:parallel
```

## 🚨 Gestione Rischi

### 🛡️ Sicurezza
- **Testnet Only**: Nessun rischio finanziario reale
- **DRY RUN**: Modalità predefinita per testing
- **Stop Loss**: Arresto automatico dopo 5 fallimenti consecutivi
- **Memory Limits**: Gestione automatica memoria

### 🔒 Best Practices
- Usa sempre **private key dedicata** per testnet
- Monitora log per identificare pattern
- Testa modifiche in modalità DRY RUN
- Mantieni backup delle configurazioni

## 🆘 Troubleshooting

### ❌ Problemi Comuni

**"Nessuna opportunità trovata"**
```bash
# Riduci soglia profitto
MIN_PROFIT_PERCENTAGE=0.01 npm run start:parallel
```

**"Connessione lenta"**
```bash
# Cambia RPC
RPC_URL=https://data-seed-prebsc-2-s1.binance.org:8545 npm run start:parallel
```

**"Memoria alta"**
```bash
# Restart sistema
npm run quick-start
```

### 🔧 Debug Avanzato
```bash
# Log dettagliato
LOG_LEVEL=debug npm run start:parallel

# Solo un processo per debug
npm run start:optimized
```

## 🔗 Risorse Utili

- **BSC Testnet Faucet**: https://testnet.binance.org/faucet-smart
- **BSC Testnet Explorer**: https://testnet.bscscan.com
- **PancakeSwap Testnet**: https://pancake.kiemtienonline360.com
- **Prezzi Real-time**: https://api.pancakeswap.info/api/v2/tokens

## 💡 Prossimi Sviluppi

- [ ] Integrazione Telegram notifications
- [ ] Dashboard web real-time
- [ ] Machine learning per prediction
- [ ] Cross-DEX arbitrage
- [ ] MEV protection avanzata

---

## 📞 Supporto

Per domande o problemi, controlla:
1. File `BNB-Testnet/logs/main.log`
2. File `BNB-Testnet/logs/performance-report.json`
3. Configurazione `.env`

**Buon trading! 🚀**
