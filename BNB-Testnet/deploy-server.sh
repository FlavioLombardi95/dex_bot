#!/bin/bash

echo "🚀 DEPLOY DEX BOT SU SERVER CLOUD"
echo "=================================="

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per log colorato
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verifica se siamo root
if [ "$EUID" -ne 0 ]; then
    log_error "Questo script deve essere eseguito come root"
    exit 1
fi

# Step 1: Aggiorna sistema
log_info "Aggiornamento sistema..."
apt update && apt upgrade -y
if [ $? -eq 0 ]; then
    log_success "Sistema aggiornato"
else
    log_error "Errore aggiornamento sistema"
    exit 1
fi

# Step 2: Installa dipendenze base
log_info "Installazione dipendenze base..."
apt install -y curl wget git build-essential htop iotop nethogs
if [ $? -eq 0 ]; then
    log_success "Dipendenze base installate"
else
    log_error "Errore installazione dipendenze"
    exit 1
fi

# Step 3: Installa Node.js 18
log_info "Installazione Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
if [ $? -eq 0 ]; then
    log_success "Node.js installato: $(node --version)"
else
    log_error "Errore installazione Node.js"
    exit 1
fi

# Step 4: Installa PM2
log_info "Installazione PM2..."
npm install -g pm2
if [ $? -eq 0 ]; then
    log_success "PM2 installato: $(pm2 --version)"
else
    log_error "Errore installazione PM2"
    exit 1
fi

# Step 5: Crea directory progetto
log_info "Setup directory progetto..."
mkdir -p /opt/dex-bot
cd /opt/dex-bot

# Step 6: Clona repository
log_info "Clonazione repository..."
if [ -d ".git" ]; then
    log_warning "Repository già presente, aggiornamento..."
    git pull origin main
else
    git clone https://github.com/FlavioLombardi95/dex_bot.git .
fi

if [ $? -eq 0 ]; then
    log_success "Repository clonato/aggiornato"
else
    log_error "Errore clonazione repository"
    exit 1
fi

# Step 7: Setup progetto BNB-Testnet
cd BNB-Testnet
log_info "Installazione dipendenze Node.js..."
npm install
if [ $? -eq 0 ]; then
    log_success "Dipendenze installate"
else
    log_error "Errore installazione dipendenze"
    exit 1
fi

# Step 8: Crea directory logs
log_info "Setup directory logs..."
mkdir -p logs
chmod 755 logs

# Step 9: Configura Telegram (se necessario)
if [ ! -f "telegram-config.json" ]; then
    log_warning "Configurazione Telegram non trovata"
    log_info "Esegui: node telegram-notifier.js --setup"
else
    log_success "Configurazione Telegram trovata"
fi

# Step 10: Avvia processi con PM2
log_info "Avvio processi con PM2..."
pm2 start ecosystem.config.js
if [ $? -eq 0 ]; then
    log_success "Processi avviati"
else
    log_error "Errore avvio processi"
    exit 1
fi

# Step 11: Salva configurazione PM2
log_info "Salvataggio configurazione PM2..."
pm2 save
if [ $? -eq 0 ]; then
    log_success "Configurazione PM2 salvata"
else
    log_error "Errore salvataggio configurazione"
fi

# Step 12: Configura avvio automatico
log_info "Configurazione avvio automatico..."
pm2 startup
if [ $? -eq 0 ]; then
    log_success "Avvio automatico configurato"
else
    log_warning "Avvio automatico non configurato (esegui manualmente)"
fi

# Step 13: Configura firewall
log_info "Configurazione firewall..."
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable
if [ $? -eq 0 ]; then
    log_success "Firewall configurato"
else
    log_warning "Firewall non configurato"
fi

# Step 14: Crea script monitoraggio
log_info "Creazione script monitoraggio..."
cat > /opt/monitor-dex-bot.sh << 'EOF'
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
echo ""
echo "=== LOGS (ultimi 10 righe) ==="
pm2 logs --lines 10
EOF

chmod +x /opt/monitor-dex-bot.sh
log_success "Script monitoraggio creato: /opt/monitor-dex-bot.sh"

# Step 15: Crea script backup
log_info "Creazione script backup..."
mkdir -p /opt/backup
cat > /opt/backup-dex-bot.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /opt/backup/dex-bot-$DATE.tar.gz /opt/dex-bot
find /opt/backup -name "*.tar.gz" -mtime +7 -delete
echo "Backup completato: dex-bot-$DATE.tar.gz"
EOF

chmod +x /opt/backup-dex-bot.sh
log_success "Script backup creato: /opt/backup-dex-bot.sh"

# Step 16: Mostra stato finale
echo ""
echo "🎉 DEPLOY COMPLETATO CON SUCCESSO!"
echo "=================================="
echo ""
echo "📊 STATO PROCESSI:"
pm2 status
echo ""
echo "🔧 COMANDI UTILI:"
echo "  pm2 status                    # Stato processi"
echo "  pm2 logs                      # Logs in tempo reale"
echo "  pm2 restart all              # Riavvia tutti"
echo "  pm2 stop all                 # Ferma tutti"
echo "  /opt/monitor-dex-bot.sh      # Monitoraggio completo"
echo "  /opt/backup-dex-bot.sh       # Backup manuale"
echo ""
echo "📱 TELEGRAM:"
echo "  node telegram-notifier.js --test  # Test notifiche"
echo ""
echo "🌐 DASHBOARD (opzionale):"
echo "  pm2 install pm2-server-monit"
echo "  # Accesso: http://$(hostname -I | awk '{print $1}'):9615"
echo ""
echo "💾 BACKUP AUTOMATICO:"
echo "  crontab -e"
echo "  # Aggiungi: 0 2 * * * /opt/backup-dex-bot.sh"
echo ""
log_success "Deploy completato! Il bot è ora attivo 24/7" 