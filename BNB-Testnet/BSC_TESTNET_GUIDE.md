# BSC Testnet Guide - DEX Arbitrage Bot

## Panoramica
Questa guida ti aiuterà a configurare e utilizzare il bot di arbitraggio DEX su **BSC Testnet** (Binance Smart Chain Testnet).

## Configurazione di Rete

### Dettagli BSC Testnet
- **Nome Rete**: BSC Testnet
- **Chain ID**: 97
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545
- **Simbolo Valuta**: BNB
- **Block Explorer**: https://testnet.bscscan.com

### Configurazione MetaMask
1. Apri MetaMask
2. Clicca su "Add Network" 
3. Seleziona "Add a network manually"
4. Inserisci i seguenti dettagli:
   - **Network Name**: BSC Testnet
   - **New RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545
   - **Chain ID**: 97
   - **Currency Symbol**: BNB
   - **Block Explorer URL**: https://testnet.bscscan.com

## Ottenere BNB Testnet

### Faucet Ufficiali
- **Binance Academy Faucet**: https://testnet.binance.org/faucet-smart
- **BNB Faucet**: https://testnet.bnbchain.org/faucet-smart

### Procedure
1. Vai al faucet ufficiale
2. Inserisci il tuo indirizzo wallet
3. Completa la verifica (se richiesta)
4. Ricevi 0.5-1 BNB testnet

## DEX Supportati

### PancakeSwap V2 (Principale)
- **Router**: 0xD99D1c33F9fC3444f8101754aBC46c52416550D1
- **Factory**: 0x6725f303b657a9451d8ba641348b6761a6cc7a17
- **Coppie Popolari**: WBNB/BUSD, WBNB/USDT, BUSD/USDT

### BakerySwap
- **Router**: 0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F
- **Factory**: 0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7

## Token Supportati

### Token Principali
- **BNB**: Token nativo
- **WBNB**: 0xae13d989dac2f0debff460ac112a837c89baa7cd
- **BUSD**: 0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee
- **USDT**: 0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684

### Coppie di Trading
- WBNB/BUSD
- WBNB/USDT
- BUSD/USDT

## Configurazione Bot

### File di Configurazione
Il bot utilizza i seguenti file per BSC Testnet:
- `bot/config.js` - Configurazione principale
- `hardhat.config.js` - Configurazione Hardhat
- `bsc-testnet.env` - Variabili d'ambiente

### Variabili d'Ambiente (.env)
```
PRIVATE_KEY=la_tua_chiave_privata
WALLET_ADDRESS=il_tuo_indirizzo_wallet
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
BSC_CHAIN_ID=97
```

## Costi e Gas

### Costi Tipici
- **Gas Price**: ~5-10 gwei
- **Deploy Contract**: ~0.01-0.02 BNB
- **Transazione Arbitraggio**: ~0.001-0.005 BNB

### Ottimizzazioni
- Gas limit ottimizzato per BSC
- Monitoraggio continuo dei prezzi gas
- Calcolo automatico della profittabilità

## Comandi Principali

### Deploy del Contratto
```bash
cd BNB-Testnet
npm run deploy:bsc
```

### Avvio del Bot
```bash
cd BNB-Testnet
npm run start:bsc
```

### Test del Sistema
```bash
cd BNB-Testnet
npm run test:bsc
```

## Monitoraggio e Logging

### File di Log
- `bsc-arbitrage.log` - Log delle operazioni
- `bsc-error.log` - Log degli errori
- `bsc-profit.log` - Log dei profitti

### Metriche Monitorate
- Opportunità di arbitraggio in tempo reale
- Prezzi su diversi DEX
- Costi di transazione
- Profittabilità netta

## Risoluzione Problemi

### Problemi Comuni
1. **"Insufficient Balance"**
   - Verifica di avere abbastanza BNB per gas
   - Controlla il saldo del wallet

2. **"Transaction Failed"**
   - Aumenta il gas limit
   - Verifica la connessione RPC

3. **"No Arbitrage Opportunities"**
   - Normale in periodi di bassa volatilità
   - Controlla che i DEX siano sincronizzati

### Debugging
```bash
# Verifica configurazione
npm run config:check

# Test connessione
npm run test:connection

# Analisi costi
npm run analyze:costs
```

## Sicurezza

### Best Practices
- Non condividere mai la chiave privata
- Usa un wallet dedicato per il testnet
- Monitora sempre le transazioni
- Testa sempre prima di usare fondi reali

### Limiti del Testnet
- Solo per testing, non per profitti reali
- Token testnet non hanno valore
- Possibili reset della blockchain

## Supporto e Community

### Risorse
- **BSC Docs**: https://docs.bnbchain.org/
- **PancakeSwap Docs**: https://docs.pancakeswap.finance/
- **Testnet Explorer**: https://testnet.bscscan.com

### Community
- **BSC Community**: https://community.bnbchain.org/
- **PancakeSwap Discord**: https://discord.gg/pancakeswap

---

## Prossimi Passi

1. Configura MetaMask per BSC Testnet
2. Ottieni BNB testnet dal faucet
3. Configura le variabili d'ambiente
4. Esegui il deploy del contratto
5. Avvia il bot e monitora le operazioni

**Buon trading su BSC Testnet! 🚀** 