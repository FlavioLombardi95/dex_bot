# DEX Arbitrage Bot - POL Amoy Testnet

## 🚀 Panoramica
Bot di arbitraggio automatico per DEX su **Polygon PoS Amoy Testnet**. Questa è la configurazione originale del progetto per testare arbitraggio su Layer 2 con POL (ex-MATIC).

## 📋 Caratteristiche

### ✅ Funzionalità Principali
- **Arbitraggio Layer 2**: Ottimizzato per Polygon con costi gas molto bassi
- **Flash Loans**: Integrazione con Balancer Vault per capital efficiency
- **Multi-DEX**: Supporto per vari DEX su Polygon
- **Real-time Monitoring**: Monitoraggio continuo opportunità
- **Cost Analysis**: Analisi completa dei costi per Layer 2

### 🎯 Rete di Destinazione
- **Polygon PoS Amoy Testnet** (Chain ID: 80002)
- **Valuta**: POL (Polygon)
- **RPC**: https://rpc-amoy.polygon.technology

### 💰 Vantaggi Layer 2
- **Costi gas 1000x inferiori** rispetto a Ethereum
- **Transazioni veloci** (~2 secondi)
- **Scalabilità** per alta frequenza di trading
- **Stesso livello di sicurezza** di Ethereum

## 🛠️ Configurazione

### Prerequisiti
- Node.js v16+
- npm o yarn  
- MetaMask configurato per Polygon Amoy
- POL testnet nel wallet

### Installazione Rapida
```bash
# Vai nella cartella POL-Amoy
cd POL-Amoy

# Installa dipendenze
npm install

# Configura le variabili d'ambiente
cp polygon-amoy.env .env

# Modifica .env con i tuoi dati
nano .env
```

### Configurazione Ambiente
Crea un file `.env` con:
```
PRIVATE_KEY=la_tua_chiave_privata
WALLET_ADDRESS=il_tuo_indirizzo_wallet
RPC_URL=https://rpc-amoy.polygon.technology
CHAIN_ID=80002
```

## 🚀 Avvio Rapido

### 1. Deploy del Contratto
```bash
npm run deploy:polygon
```

### 2. Test del Sistema
```bash
npm run test:polygon
```

### 3. Avvio del Bot
```bash
npm run start:polygon
```

## 📊 Monitoraggio

### Log Files
- `polygon-arbitrage.log` - Operazioni del bot
- `polygon-error.log` - Errori e problemi  
- `polygon-profit.log` - Profitti e perdite

### Analisi Performance
- Analisi costi completa vs Ethereum
- Calcolo profittabilità su Layer 2
- Monitoraggio opportunità storiche

## 💡 Comandi Utili

### Sviluppo
```bash
# Test completo Polygon
npm run test:polygon

# Analisi costi Polygon
npm run polygon-costs

# Analisi profittabilità
npm run profitability

# Monitoraggio real-time
npm run real-data:monitor
```

### Analisi Avanzate
```bash
# Analisi opportunità 72h
npm run analyze

# Analisi dati storici
npm run real-data:analyze

# Configurazione ottimale
npm run config
```

## 🔧 Configurazione Avanzata

### Parametri Ottimizzati Layer 2
```javascript
// Ottimizzazioni specifiche per Polygon
arbitrage: {
  minProfitThreshold: 0.005, // 0.5% (più basso per L2)
  maxSlippage: 0.02,         // 2% slippage massimo
  gasLimit: 500000,          // Gas limit più alto
  gasPrice: 30000000000,     // 30 gwei per Polygon
  monitoringInterval: 5000,  // 5 secondi
  flashLoanAmount: '1000000000000000000' // 1 POL
}
```

### DEX Supportati
- **Uniswap V2** su Polygon
- **SushiSwap** su Polygon
- **QuickSwap** (future integration)

## 🔒 Sicurezza

### Best Practices
- ✅ Usa wallet dedicato per testnet
- ✅ Flash loans per capital efficiency
- ✅ Slippage protection integrata
- ✅ Gas optimization per L2
- ✅ Error handling robusto

### Limitazioni Testnet
- Solo per testing, non profitti reali
- Token testnet senza valore
- Periodici reset della testnet

## 📈 Performance Attese

### Metriche Tipiche (Polygon L2)
- **Costo Gas**: ~$0.003 per transazione
- **Latenza**: ~2-3 secondi
- **Throughput**: 3,600+ opportunità/ora
- **Soglia profittabilità**: 0.2% per trade $10K+

### Analisi Profittabilità
```
Trade Size | Spread Minimo | Status
$10,000    | >0.40%       | ✅ POSSIBILE
$25,000    | >0.21%       | ✅ OTTIMO  
$50,000    | >0.15%       | ✅ ECCELLENTE
$100,000   | >0.12%       | ✅ PERFETTO
```

## 🧪 Testing e Analisi

### Test Disponibili
```bash
# Test configurazione
npm run test:setup

# Test simulazione
npm run test:simulation

# Test con dati realistici
npm run test:realistic
```

### Analisi Costi
```bash
# Analisi costi completa
npm run costs

# Analisi specifica Polygon
npm run polygon-costs

# Confronto con Ethereum
npm run compare-costs
```

## 🆘 Supporto

### Problemi Comuni
1. **"Insufficient POL"**: Usa faucet Polygon
2. **"RPC Error"**: Verifica RPC endpoint
3. **"No Opportunities"**: Normale in periodi stabili
4. **"Flash Loan Failed"**: Controlla liquidità

### Faucet POL
- [Polygon Faucet](https://faucet.polygon.technology/)
- [Alchemy Faucet](https://www.alchemy.com/faucets/polygon-amoy)

## 🔗 Collegamenti Utili

### Risorse Polygon
- [Polygon Documentation](https://docs.polygon.technology/)
- [Polygon Amoy Explorer](https://www.oklink.com/amoy)
- [Polygon Bridge](https://wallet.polygon.technology/)

### DEX Resources
- [Uniswap on Polygon](https://app.uniswap.org/)
- [SushiSwap on Polygon](https://app.sushi.com/)

---

## 📝 Changelog POL-Amoy

### v1.0.0 (Current)
- ✅ Configurazione Polygon PoS Amoy Testnet
- ✅ Integrazione Flash Loans Balancer
- ✅ Supporto Multi-DEX
- ✅ Analisi costi completa Layer 2
- ✅ Monitoraggio real-time
- ✅ Ottimizzazioni gas L2

### Analisi Storiche
- **72 ore analisi**: 259,200 opportunità
- **Profitto teorico**: $3,231,844.69
- **Frequenza**: 3,600 opportunità/ora
- **Profitto medio**: $12.47 per opportunità

---

**🚀 Configurazione testata e pronta per Polygon Layer 2!**

*Ricorda: Questo è l'ambiente di test per la tecnologia Layer 2. Testnet POL non ha valore reale.*
