# 🚀 GUIDA DEPLOY SERVER CLOUD - MONITORAGGIO CONTINUO

## 🌐 OPZIONI SERVER CLOUD

### **1. VPS (Virtual Private Server) - RACCOMANDATO**

#### **Provider Popolari:**
- **DigitalOcean**: $5-10/mese (Droplet)
- **Linode**: $5-10/mese (Nanode)
- **Vultr**: $5-10/mese (Cloud Compute)
- **AWS EC2**: $10-20/mese (t3.micro)
- **Google Cloud**: $10-20/mese (e2-micro)

#### **Specifiche Minime:**
- **CPU**: 1-2 cores
- **RAM**: 1-2 GB
- **Storage**: 20-40 GB SSD
- **Bandwidth**: Illimitato
- **OS**: Ubuntu 20.04/22.04

### **2. SERVERLESS (Alternativa)**

#### **Provider:**
- **Railway**: $5/mese
- **Render**: $7/mese
- **Heroku**: $7/mese
- **Vercel**: Gratuito (limitato)

---

## 🛠️ SETUP VPS COMPLETO

### **Step 1: Creazione VPS**

```bash
# 1. Crea VPS su DigitalOcean/Linode/Vultr
# 2. Scegli Ubuntu 22.04 LTS
# 3. Seleziona piano $5-10/mese
# 4. Configura SSH key
```

### **Step 2: Connessione e Setup Base**

```bash
# Connetti al server
ssh root@YOUR_SERVER_IP

# Aggiorna sistema
apt update && apt upgrade -y

# Installa dipendenze
apt install -y curl wget git build-essential

# Installa Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verifica installazione
node --version
npm --version
```

### **Step 3: Setup Progetto**

```bash
# Crea directory progetto
mkdir -p /opt/dex-bot
cd /opt/dex-bot

# Clona repository
git clone https://github.com/FlavioLombardi95/dex_bot.git .
cd BNB-Testnet

# Installa dipendenze
npm install

# Configura variabili ambiente
cp .env.example .env
nano .env
```

### **Step 4: Configurazione PM2 (Process Manager)**

```bash
# Installa PM2 globalmente
npm install -g pm2

# Crea file configurazione PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'advanced-scanner',
      script: 'advanced-opportunity-scanner.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        SCAN_INTERVAL: '2000',
        MIN_PROFIT: '0.1'
      },
      error_file: './logs/advanced-scanner-error.log',
      out_file: './logs/advanced-scanner-out.log',
      log_file: './logs/advanced-scanner-combined.log'
    },
    {
      name: 'new-token-scanner',
      script: 'new-token-opportunity-scanner.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        SCAN_INTERVAL: '5000',
        MIN_LIQUIDITY: '0.01'
      },
      error_file: './logs/new-token-scanner-error.log',
      out_file: './logs/new-token-scanner-out.log',
      log_file: './logs/new-token-scanner-combined.log'
    },
    {
      name: 'parallel-monitor',
      script: 'parallel-monitor.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/parallel-monitor-error.log',
      out_file: './logs/parallel-monitor-out.log',
      log_file: './logs/parallel-monitor-combined.log'
    }
  ]
};
EOF

# Crea directory logs
mkdir -p logs

# Avvia processi
pm2 start ecosystem.config.js

# Salva configurazione PM2
pm2 save

# Configura avvio automatico
pm2 startup
```

### **Step 5: Configurazione Telegram**

```bash
# Configura bot Telegram
node telegram-notifier.js --setup

# Test notifiche
node telegram-notifier.js --test
```

### **Step 6: Monitoraggio e Logs**

```bash
# Comandi PM2 utili
pm2 status                    # Stato processi
pm2 logs                      # Logs in tempo reale
pm2 restart all              # Riavvia tutti
pm2 stop all                 # Ferma tutti
pm2 delete all               # Elimina tutti

# Monitoraggio risorse
pm2 monit                    # Monitor risorse
htop                         # Monitor sistema
```

---

## 🔧 CONFIGURAZIONE AVANZATA

### **1. Firewall e Sicurezza**

```bash
# Configura firewall
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable

# Installa fail2ban
apt install -y fail2ban
systemctl enable fail2ban
```

### **2. Backup Automatico**

```bash
# Crea script backup
cat > /opt/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /opt/backup/dex-bot-$DATE.tar.gz /opt/dex-bot
find /opt/backup -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /opt/backup.sh

# Aggiungi a crontab (backup giornaliero)
crontab -e
# Aggiungi: 0 2 * * * /opt/backup.sh
```

### **3. Monitoraggio Sistema**

```bash
# Installa monitoring tools
apt install -y htop iotop nethogs

# Script monitoraggio
cat > /opt/monitor.sh << 'EOF'
#!/bin/bash
echo "=== DEX BOT STATUS ==="
pm2 status
echo ""
echo "=== SYSTEM RESOURCES ==="
free -h
echo ""
df -h
echo ""
echo "=== PROCESSES ==="
ps aux | grep node | grep -v grep
EOF

chmod +x /opt/monitor.sh
```

---

## 📊 MONITORAGGIO E ALERT

### **1. Telegram Bot Commands**

```bash
# Aggiungi comandi al bot Telegram
# /status - Stato processi
# /restart - Riavvia scanner
# /logs - Ultimi logs
# /stats - Statistiche
```

### **2. Dashboard Web (Opzionale)**

```bash
# Installa dashboard PM2
pm2 install pm2-server-monit

# Accesso: http://YOUR_SERVER_IP:9615
```

---

## 💰 COSTI STIMATI

### **VPS Base:**
- **DigitalOcean**: $5-10/mese
- **Linode**: $5-10/mese
- **Vultr**: $5-10/mese

### **Serverless:**
- **Railway**: $5/mese
- **Render**: $7/mese

### **Totale Annuo:**
- **VPS**: $60-120/anno
- **Serverless**: $60-84/anno

---

## 🚀 DEPLOY RAPIDO

### **Script Automatico:**

```bash
# Crea script deploy
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploy DEX Bot su VPS..."

# Aggiorna sistema
apt update && apt upgrade -y

# Installa Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Installa PM2
npm install -g pm2

# Clona progetto
cd /opt
git clone https://github.com/FlavioLombardi95/dex_bot.git dex-bot
cd dex-bot/BNB-Testnet

# Installa dipendenze
npm install

# Configura PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Deploy completato!"
echo "📊 Controlla: pm2 status"
EOF

chmod +x deploy.sh
./deploy.sh
```

---

## 🔍 TROUBLESHOOTING

### **Problemi Comuni:**

1. **Processi che si fermano**
   ```bash
   pm2 logs advanced-scanner
   pm2 restart advanced-scanner
   ```

2. **Memoria insufficiente**
   ```bash
   pm2 restart all
   # Oppure aumenta RAM VPS
   ```

3. **Connessione RPC instabile**
   ```bash
   # Modifica endpoint in config.js
   nano core/config.js
   ```

4. **Notifiche Telegram non funzionano**
   ```bash
   node telegram-notifier.js --test
   # Verifica token e chat ID
   ```

---

## 📈 SCALABILITÀ

### **Quando Scalare:**

1. **Più di 1000 scansioni/ora**
2. **CPU > 80% costante**
3. **Memoria > 1.5GB**
4. **Molte opportunità trovate**

### **Opzioni Scalabilità:**

1. **VPS più potente** (CPU/RAM)
2. **Load balancer** (più VPS)
3. **Microservizi** (scanner separati)
4. **Database esterno** (MongoDB/PostgreSQL)

---

**🎯 Con questa configurazione avrai monitoraggio 24/7 anche con macchina locale spenta!** 