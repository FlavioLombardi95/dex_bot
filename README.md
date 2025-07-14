# DEX Bot - Arbitraggio Multi-Network Ottimizzato

Bot di arbitraggio automatico per DEX (Decentralized Exchanges) con **architettura scalabile** e **infrastruttura production-ready**.

## 🚀 Funzionalità Principali

- **🔄 Arbitraggio Triangolare**: Rileva opportunità di arbitraggio su 3 token
- **🌐 Multi-Network**: Supporta BSC Testnet, Polygon Amoy, e future network
- **📊 Monitoring Real-time**: Scansione continua con API REST
- **💰 Analisi Profittabilità**: Calcolo automatico considerando gas fees e slippage
- **🔐 Sicurezza**: Controlli di sicurezza integrati e gestione errori robusta
- **📈 Analytics**: Database SQLite per tracking performance
- **⚡ Performance**: Connection pooling e caching ottimizzato

## 🏗️ Architettura Ottimizzata

### Core Infrastructure

```
dex_bot-main/
├── 🛠️ project-config.js         # Configurazione unificata multi-network
├── 🚀 deployment-manager.js     # Gestione deploy multi-network
├── 📊 package.json              # Script di gestione progetto
├── 🌐 BNB-Testnet/             # BSC Testnet (Production Ready)
│   ├── 🔧 core/                 # Infrastruttura core
│   │   ├── config.js           # ConfigManager centralizzato
│   │   ├── logger.js           # Winston logger strutturato
│   │   ├── connection-pool.js  # Pool connessioni con failover
│   │   └── base-scanner.js     # Classe base per scanner
│   ├── 📱 app.js               # Applicazione principale con API
│   ├── 🔍 scanners/            # Scanner specializzati
│   │   └── triangular-scanner.js
│   ├── 🛠️ scripts/             # Script ottimizzati
│   │   ├── deploy-optimized.js
│   │   ├── setup-optimized.js
│   │   └── profitability-analyzer.js
│   └── 📊 reports/             # Analytics e report
└── 🔮 POL-Amoy/               # Polygon Amoy (Struttura parallela)
    └── [Stessa struttura ottimizzata]
```

## 🚀 Setup Rapido

### 1. Panoramica Progetto
```bash
# Visualizza panoramica completa
npm run project:overview

# Sincronizza struttura
npm run project:sync
```

### 2. Setup Completo Automatico
```bash
# Setup completo di tutto il progetto
npm run setup:full
```

### 3. Setup Manuale Per Network

#### BSC Testnet
```bash
# Setup ottimizzato
npm run bsc:setup

# Deploy ottimizzato
npm run bsc:deploy

# Analisi profittabilità
npm run bsc:analyze

# Avvia bot
npm run bsc:start
```

#### Polygon Amoy
```bash
# Setup ottimizzato
npm run amoy:setup

# Deploy ottimizzato
npm run amoy:deploy

# Analisi profittabilità
npm run amoy:analyze

# Avvia bot
npm run amoy:start
```

## 📊 Gestione e Monitoring

### Status e Monitoring
```bash
# Mostra status completo
npm run status

# Visualizza logs unificati
npm run logs

# Health check tutti i servizi
npm run health
```

### Deploy Multi-Network
```bash
# Deploy su tutti i network
npm run deploy:all

# Deploy su network specifico
npm run deploy:single bsc-testnet

# Verifica tutti i deploy
npm run verify:deployments
```

### Analisi e Report
```bash
# Analisi profittabilità network specifico
npm run analyze:single bsc-testnet

# Sincronizza struttura progetto
npm run sync:structure
```

## 🔧 Caratteristiche Tecniche

### ConfigManager Unificato
- **Multi-network**: Gestisce configurazioni per tutte le reti
- **Validazione**: Controlli automatici di configurazione
- **Ambiente**: Supporto per testnet/mainnet
- **Sicurezza**: Gestione sicura di private keys

### Logger Strutturato
- **Winston**: Logging professionale con rotazione
- **Categorizzazione**: Log separati per opportunità, profitti, errori
- **Context**: Logging con context per debugging
- **Performance**: Track performance e metriche

### Connection Pool
- **Failover**: Multiple RPC URLs con switching automatico
- **Health Check**: Monitoring connessioni ogni minuto
- **Load Balancing**: Distribuzione carico tra provider
- **Retry Logic**: Gestione automatica errori rete

### Scanner Modulari
- **Base Class**: Classe base per tutti i scanner
- **Specializzati**: Scanner triangolare, new tokens, profit scanner
- **Caching**: Cache intelligente per performance
- **Analytics**: Tracking opportunità e performance

### API REST
- **Endpoints**: `/api/health`, `/api/scanners`, `/api/opportunities`
- **Rate Limiting**: Protezione contro spam
- **CORS**: Supporto per frontend
- **Monitoring**: Health check e metriche

### Database Analytics
- **SQLite**: Persistenza opportunità ed esecuzioni
- **Performance**: Tracking performance storica
- **Report**: Generazione report automatici
- **Backup**: Sistema backup automatico

## 🌟 Funzionalità Avanzate

### Arbitraggio Triangolare
- **Volatilità**: Calcolo volatilità per prioritizzazione
- **Multi-amount**: Test con diverse dimensioni trade
- **Filtering**: Filtri avanzati per opportunità
- **Execution**: Esecuzione automatica sicura

### Analisi Profittabilità
- **Real-time**: Condizioni mercato in tempo reale
- **Costi**: Calcolo preciso gas fees e slippage
- **Scenari**: Simulazione diversi scenari di mercato
- **Raccomandazioni**: Suggerimenti automatici

### Sicurezza
- **MEV Protection**: Protezione contro MEV attacks
- **Slippage Control**: Controllo slippage massimo
- **Emergency Stop**: Sistema di arresto emergenza
- **Audit Trail**: Log completo di tutte le operazioni

## 📈 Performance

### Ottimizzazioni
- **Connection Pooling**: Riduce latenza connessioni
- **Caching**: Cache intelligente per dati frecuenti
- **Async/Await**: Operazioni asincrone ottimizzate
- **Batch Processing**: Elaborazione batch per efficienza

### Monitoring
- **Metriche**: Tracking performance real-time
- **Alerts**: Notifiche per anomalie
- **Reports**: Report performance automatici
- **Dashboard**: Dashboard web per monitoring

## 🔮 Scalabilità Futura

### Network Supportati
- ✅ **BSC Testnet** (Attivo)
- ✅ **Polygon Amoy** (Attivo)
- ⏳ **Ethereum Mainnet** (Futuro)
- ⏳ **Arbitrum One** (Futuro)

### Estensibilità
- **Plugin System**: Architettura plugin per nuove feature
- **Multi-DEX**: Supporto per nuovi DEX
- **Strategies**: Nuove strategie di arbitraggio
- **Integrations**: Integrazioni con servizi esterni

## 🤝 Contribuire

1. Fork del repository
2. Crea un branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📚 Documentazione

- [Setup Dettagliato](SETUP.md)
- [Changelog](CHANGELOG.md)
- [BSC Testnet Guide](BNB-Testnet/README.md)
- [Polygon Amoy Guide](POL-Amoy/README.md)

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT - vedi il file [LICENSE](LICENSE) per i dettagli.

---

**🎯 Risultato**: Infrastruttura DEX Bot completamente ottimizzata, scalabile e production-ready con supporto multi-network e architettura modulare per future espansioni.
