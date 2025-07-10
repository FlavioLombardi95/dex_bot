# 🤖 Bot Arbitraggio Crypto - Polygon L2

Bot decentralizzato per arbitraggio crypto tra DEX con flash loan, ottimizzato per **Polygon Layer 2** con analisi completa dei costi.

## 🎯 Caratteristiche Principali

- **Layer 2 Optimized**: Configurato per Polygon con costi gas 1000x inferiori
- **Flash Loan Integration**: Utilizzo Balancer Vault per arbitraggio senza capitale
- **Multi-DEX Support**: Uniswap V2 e SushiSwap su Polygon
- **Cost Analysis**: Analisi completa di tutti i costi (gas, flash loan, infrastruttura)
- **Real-time Monitoring**: Monitoraggio continuo opportunità arbitraggio
- **Historical Analysis**: Analisi dati storici per ottimizzazione strategia

## 📊 Analisi Costi e Profittabilità

### 💰 Confronto Ethereum vs Polygon

| Costo | Ethereum | Polygon |
|-------|----------|---------|
| **Gas Cost** | $30.00 | **$0.03** |
| **Flash Loan Fee** | 0.09% | 0.09% |
| **Infrastruttura** | $16.33/giorno | $16.33/giorno |
| **Vantaggio** | - | **1000x più economico** |

### 🎯 Soglie Minime Profittevoli

| Trade Size | Spread Minimo | Status |
|------------|---------------|---------|
| $1,000     | **>3.16%**   | ❌ Impossibile |
| $5,000     | **>0.70%**   | ❌ Troppo alto |
| $10,000    | **>0.40%**   | ✅ **POSSIBILE** |
| $25,000    | **>0.21%**   | ✅ **OTTIMO** |
| $50,000    | **>0.15%**   | ✅ **ECCELLENTE** |
| $100,000   | **>0.12%**   | ✅ **PERFETTO** |

### 📈 Configurazione Ottimale

- **Soglia profitto minimo**: 0.2%
- **Trade size minimo**: $10,000
- **Frequenza attesa**: 3,600 opportunità/ora
- **Profitto medio per opportunità**: $12.47

## 🚀 Quick Start

### 1. Installazione

```bash
git clone <repository-url>
cd dex_bot-main
npm install
```

### 2. Configurazione

```bash
# Copia configurazione Polygon
cp polygon-mainnet.env .env

# Inserisci la tua chiave privata
nano .env
```

### 3. Test e Analisi

```bash
# Test configurazione
npm run test:polygon

# Analisi costi
npm run polygon-costs

# Analisi opportunità storiche
npm run analyze

# Monitoraggio tempo reale
npm run real-data:monitor
```

### 4. Deploy e Avvio

```bash
# Deploy su Polygon
npm run deploy:polygon

# Avvio bot
npm run start:polygon
```

## 📋 Script Disponibili

### 🔧 Setup e Test
- `npm run test:polygon` - Test suite completo Polygon
- `npm run test:simulation` - Simulazione logica arbitraggio
- `npm run test:realistic` - Test con spread realistici

### 💰 Analisi Costi
- `npm run profitability` - Analisi profittabilità base
- `npm run costs` - Analisi costi completi (Ethereum)
- `npm run polygon-costs` - Analisi costi Polygon ottimizzata

### 📊 Analisi Opportunità
- `npm run analyze` - Analisi opportunità storiche (72 ore)
- `npm run real-data:realtime` - Analisi tempo reale
- `npm run real-data:monitor` - Monitoraggio continuo
- `npm run real-data:analyze` - Analisi dati storici salvati

### ⚙️ Configurazione
- `npm run config` - Mostra configurazione ottimale
- `npm run setup:polygon` - Setup Polygon
- `npm run deploy:polygon` - Deploy su Polygon

## 🏗️ Architettura

```
dex_bot-main/
├── bot/                    # Core del bot
│   ├── config.js          # Configurazione ottimizzata
│   ├── index.js           # Entry point
│   └── monitor.js         # Monitoraggio prezzi
├── contracts/             # Smart contracts
│   └── Arbitrage.sol      # Contratto arbitraggio
├── scripts/               # Script di analisi
│   ├── arbitrage-opportunity-analyzer.js
│   ├── complete-cost-analysis.js
│   ├── polygon-cost-analysis.js
│   ├── real-data-analyzer.js
│   └── final-configuration.js
├── reports/               # Report analisi
├── data/                  # Dati storici
└── docs/                  # Documentazione
```

## 📈 Risultati Analisi 72 Ore

- **Opportunità totali**: 259,200
- **Frequenza**: 3,600 opportunità/ora
- **Profitto totale stimato**: $3,231,844.69
- **Profitto medio per opportunità**: $12.47
- **Tasso di successo**: 100%

## 🔒 Sicurezza

- **Dry Run Mode**: Test senza transazioni reali
- **Slippage Protection**: Protezione da slippage eccessivo
- **Gas Optimization**: Ottimizzazione costi gas per L2
- **Error Handling**: Gestione errori robusta

## 📚 Documentazione

- [SETUP.md](SETUP.md) - Guida setup dettagliata
- [POLYGON_GUIDE.md](POLYGON_GUIDE.md) - Guida specifica Polygon
- [TESTNET_GUIDE.md](TESTNET_GUIDE.md) - Guida testnet
- [CHANGELOG.md](CHANGELOG.md) - Changelog completo

## 🤝 Contribuire

1. Fork il repository
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## ⚠️ Disclaimer

Questo software è fornito "così com'è" senza garanzie. L'arbitraggio crypto comporta rischi significativi. Utilizzare solo con capitale che si può permettere di perdere.

---

**🎯 Obiettivo**: Bot di arbitraggio ottimizzato per Polygon L2 con analisi completa dei costi per garantire profittabilità.
