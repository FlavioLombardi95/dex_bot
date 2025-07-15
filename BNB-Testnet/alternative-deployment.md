# 💰 OPZIONI DEPLOY ALTERNATIVE - ECONOMICHE

## 🆓 OPZIONI GRATUITE

### **1. Railway (Raccomandato)**
- **Costo**: Gratuito (500 ore/mese)
- **RAM**: 512MB
- **CPU**: Condivisa
- **Storage**: 1GB

#### **Setup Railway:**
```bash
# 1. Vai su railway.app
# 2. Connetti GitHub
# 3. Seleziona repository dex_bot
# 4. Configura variabili ambiente
# 5. Deploy automatico
```

#### **Variabili Ambiente Railway:**
```
NODE_ENV=production
SCAN_INTERVAL=5000
MIN_PROFIT=0.1
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
```

### **2. Render**
- **Costo**: Gratuito (750 ore/mese)
- **RAM**: 512MB
- **CPU**: Condivisa
- **Storage**: 1GB

#### **Setup Render:**
```bash
# 1. Vai su render.com
# 2. Connetti GitHub
# 3. Crea Web Service
# 4. Build Command: npm install
# 5. Start Command: node advanced-opportunity-scanner.js
```

### **3. Heroku**
- **Costo**: Gratuito (550 ore/mese)
- **RAM**: 512MB
- **CPU**: Condivisa
- **Storage**: 1GB

#### **Setup Heroku:**
```bash
# Installa Heroku CLI
npm install -g heroku

# Login e deploy
heroku login
heroku create your-dex-bot
git push heroku main

# Configura variabili
heroku config:set NODE_ENV=production
heroku config:set SCAN_INTERVAL=5000
```

---

## 💸 OPZIONI ECONOMICHE ($1-5/mese)

### **1. Oracle Cloud Free Tier**
- **Costo**: Gratuito per sempre
- **RAM**: 1GB
- **CPU**: 1 core ARM
- **Storage**: 20GB

#### **Setup Oracle:**
```bash
# 1. Crea account Oracle Cloud
# 2. Crea VM ARM (Ampere)
# 3. Usa script deploy-server.sh
# 4. Configura PM2
```

### **2. Google Cloud Free Tier**
- **Costo**: Gratuito (f1-micro)
- **RAM**: 0.6GB
- **CPU**: 1 core
- **Storage**: 30GB

#### **Setup Google Cloud:**
```bash
# Installa gcloud CLI
gcloud init
gcloud compute instances create dex-bot \
  --machine-type=f1-micro \
  --zone=us-central1-a \
  --image-family=ubuntu-2004-lts

# Connetti e deploy
gcloud compute ssh dex-bot
# Esegui deploy-server.sh
```

### **3. AWS Free Tier**
- **Costo**: Gratuito (12 mesi)
- **RAM**: 1GB
- **CPU**: 1 core
- **Storage**: 30GB

#### **Setup AWS:**
```bash
# Crea EC2 t2.micro
# Usa Ubuntu 22.04
# Connetti via SSH
# Esegui deploy-server.sh
```

---

## 🏠 OPZIONI LOCALI (Macchina Sempre Accesa)

### **1. Raspberry Pi 4**
- **Costo**: €50-100 (una tantum)
- **RAM**: 2-8GB
- **CPU**: ARM 4-core
- **Consumo**: 5-10W

#### **Setup Raspberry Pi:**
```bash
# Installa Raspberry Pi OS
# Installa Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clona e setup progetto
git clone https://github.com/FlavioLombardi95/dex_bot.git
cd dex_bot/BNB-Testnet
npm install

# Configura PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **2. PC Windows/Linux Sempre Acceso**
- **Costo**: €0 (già posseduto)
- **RAM**: 4-16GB
- **CPU**: Multi-core
- **Consumo**: 50-200W

#### **Setup PC:**
```bash
# Windows: Installa WSL2
# Linux: Usa direttamente

# Installa Node.js
# Clona progetto
# Configura PM2
# Avvia automatico
```

---

## 📱 OPZIONI MOBILE

### **1. Android (Termux)**
- **Costo**: €0
- **RAM**: 2-8GB
- **CPU**: ARM
- **Batteria**: Limitata

#### **Setup Termux:**
```bash
# Installa Termux da F-Droid
pkg update
pkg install nodejs git

# Clona progetto
git clone https://github.com/FlavioLombardi95/dex_bot.git
cd dex_bot/BNB-Testnet
npm install

# Avvia scanner
node advanced-opportunity-scanner.js
```

### **2. iPhone (iSH)**
- **Costo**: €0
- **RAM**: Limitata
- **CPU**: ARM
- **Batteria**: Limitata

#### **Setup iSH:**
```bash
# Installa iSH da App Store
apk update
apk add nodejs npm git

# Clona e setup progetto
git clone https://github.com/FlavioLombardi95/dex_bot.git
cd dex_bot/BNB-Testnet
npm install
```

---

## 🔧 CONFIGURAZIONI OTTIMIZZATE

### **Configurazione Lightweight (per risorse limitate):**
```javascript
// ecosystem-lightweight.config.js
module.exports = {
  apps: [
    {
      name: 'light-scanner',
      script: 'advanced-opportunity-scanner.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        SCAN_INTERVAL: '10000',  // 10 secondi
        MIN_PROFIT: '0.5',       // Profitto più alto
        MAX_CONCURRENT: '2'      // Meno concorrenza
      }
    }
  ]
};
```

### **Configurazione Aggressiva (per risorse abbondanti):**
```javascript
// ecosystem-aggressive.config.js
module.exports = {
  apps: [
    {
      name: 'aggressive-scanner',
      script: 'advanced-opportunity-scanner.js',
      instances: 2,
      autorestart: true,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        SCAN_INTERVAL: '1000',   // 1 secondo
        MIN_PROFIT: '0.1',       // Profitto basso
        MAX_CONCURRENT: '10'     // Più concorrenza
      }
    },
    {
      name: 'new-token-scanner',
      script: 'new-token-opportunity-scanner.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G'
    }
  ]
};
```

---

## 📊 CONFRONTO COSTI

| Opzione | Costo/Mese | RAM | CPU | Affidabilità | Facilità |
|---------|------------|-----|-----|--------------|----------|
| **Railway** | €0 | 512MB | Condivisa | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Render** | €0 | 512MB | Condivisa | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Oracle Cloud** | €0 | 1GB | 1 core | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Raspberry Pi** | €0* | 2-8GB | 4 core | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **VPS Base** | €5-10 | 1-2GB | 1-2 core | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

*Costo una tantum

---

## 🎯 RACCOMANDAZIONI

### **Per Iniziare (Gratuito):**
1. **Railway** - Facile setup, affidabile
2. **Render** - Alternativa a Railway
3. **Oracle Cloud** - Più potente, setup manuale

### **Per Produzione (€5-10/mese):**
1. **VPS DigitalOcean** - Ottimo rapporto qualità/prezzo
2. **VPS Linode** - Alternativa affidabile
3. **AWS EC2** - Scalabile, più complesso

### **Per Casa (€0-100 una tantum):**
1. **Raspberry Pi 4** - Economico, controllato
2. **PC Sempre Acceso** - Potente, già posseduto

---

## 🚀 DEPLOY RAPIDO GRATUITO

### **Railway (5 minuti):**
```bash
# 1. Vai su railway.app
# 2. Login con GitHub
# 3. "New Project" → "Deploy from GitHub repo"
# 4. Seleziona: FlavioLombardi95/dex_bot
# 5. Configura variabili ambiente
# 6. Deploy automatico!
```

### **Render (5 minuti):**
```bash
# 1. Vai su render.com
# 2. Login con GitHub
# 3. "New" → "Web Service"
# 4. Connetti repository
# 5. Build Command: cd BNB-Testnet && npm install
# 6. Start Command: node advanced-opportunity-scanner.js
# 7. Deploy!
```

---

**💡 Scegli l'opzione che meglio si adatta alle tue esigenze e budget!** 