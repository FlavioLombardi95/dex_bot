const axios = require('axios');
const fs = require('fs');
const path = require('path');

class TelegramNotifier {
    constructor() {
        this.configFile = path.join(__dirname, 'telegram-config.json');
        this.loadConfig();
    }

    loadConfig() {
        try {
            if (fs.existsSync(this.configFile)) {
                this.config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
            } else {
                this.config = {
                    botToken: '',
                    chatId: '',
                    enabled: false,
                    minProfitPercent: 0.5,
                    notificationTypes: {
                        opportunities: true,
                        errors: true,
                        system: true
                    }
                };
                this.saveConfig();
            }
        } catch (error) {
            console.error('❌ Errore caricamento config Telegram:', error.message);
            this.config = { enabled: false };
        }
    }

    saveConfig() {
        try {
            fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('❌ Errore salvataggio config Telegram:', error.message);
        }
    }

    async setup() {
        console.log('🤖 SETUP NOTIFICHE TELEGRAM');
        console.log('============================\n');

        if (!this.config.botToken) {
            console.log('📝 Per creare un bot Telegram:');
            console.log('1. Vai su @BotFather su Telegram');
            console.log('2. Invia /newbot');
            console.log('3. Segui le istruzioni');
            console.log('4. Copia il token del bot\n');

            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const botToken = await new Promise(resolve => {
                rl.question('🔑 Inserisci il token del bot: ', resolve);
            });

            if (botToken.trim()) {
                this.config.botToken = botToken.trim();
                console.log('✅ Token salvato!\n');
            }

            console.log('📱 Per ottenere il Chat ID:');
            console.log('1. Invia un messaggio al tuo bot');
            console.log('2. Vai su: https://api.telegram.org/bot<TOKEN>/getUpdates');
            console.log('3. Cerca "chat":{"id":XXXXX} nel JSON\n');

            const chatId = await new Promise(resolve => {
                rl.question('💬 Inserisci il Chat ID: ', resolve);
            });

            if (chatId.trim()) {
                this.config.chatId = chatId.trim();
                console.log('✅ Chat ID salvato!\n');
            }

            rl.close();
            this.saveConfig();
        }

        // Test connessione
        if (this.config.botToken && this.config.chatId) {
            const success = await this.testConnection();
            if (success) {
                this.config.enabled = true;
                this.saveConfig();
                console.log('✅ Notifiche Telegram configurate e attive!\n');
            }
        }
    }

    async testConnection() {
        try {
            const response = await axios.post(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, {
                chat_id: this.config.chatId,
                text: '🤖 Bot Arbitraggio connesso e funzionante!'
            });

            if (response.data.ok) {
                console.log('✅ Test connessione Telegram riuscito!');
                return true;
            }
        } catch (error) {
            console.error('❌ Errore test Telegram:', error.message);
        }
        return false;
    }

    async sendNotification(message, type = 'opportunities') {
        if (!this.config.enabled || !this.config.notificationTypes[type]) {
            return;
        }

        try {
            const emoji = {
                opportunities: '💰',
                errors: '🚨',
                system: '⚙️'
            }[type] || '📢';

            const formattedMessage = `${emoji} ${message}`;

            await axios.post(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, {
                chat_id: this.config.chatId,
                text: formattedMessage,
                parse_mode: 'HTML'
            });

            console.log(`📱 Notifica ${type} inviata`);
        } catch (error) {
            console.error('❌ Errore invio notifica Telegram:', error.message);
        }
    }

    async sendOpportunityAlert(opportunity) {
        if (!this.config.enabled || opportunity.profitPercent < this.config.minProfitPercent) {
            return;
        }

        const message = `
<b>💰 OPPORTUNITÀ ARBITRAGGIO</b>

🔺 <b>Percorso:</b> ${opportunity.path}
📈 <b>Profitto:</b> ${opportunity.profitPercent.toFixed(2)}%
💵 <b>Importo:</b> ${opportunity.amount} ${opportunity.token}
⏰ <b>Tempo:</b> ${new Date().toLocaleTimeString()}

<b>Dettagli:</b>
• Prezzo Iniziale: ${opportunity.initialPrice}
• Prezzo Finale: ${opportunity.finalPrice}
• Differenza: ${opportunity.priceDifference}
        `.trim();

        await this.sendNotification(message, 'opportunities');
    }

    async sendErrorAlert(error, context = '') {
        const message = `
<b>🚨 ERRORE SISTEMA</b>

❌ <b>Errore:</b> ${error.message}
📍 <b>Contesto:</b> ${context || 'Generale'}
⏰ <b>Tempo:</b> ${new Date().toLocaleTimeString()}
        `.trim();

        await this.sendNotification(message, 'errors');
    }

    async sendSystemAlert(message) {
        await this.sendNotification(message, 'system');
    }
}

// Esporta per uso in altri moduli
module.exports = TelegramNotifier;

// Test diretto
if (require.main === module) {
    const notifier = new TelegramNotifier();
    
    if (process.argv.includes('--setup')) {
        notifier.setup();
    } else if (process.argv.includes('--test')) {
        notifier.testConnection().then(success => {
            if (success) {
                notifier.sendNotification('🧪 Test notifica funzionante!', 'system');
            }
        });
    } else {
        console.log('🤖 USAGE:');
        console.log('node telegram-notifier.js --setup  # Configura bot');
        console.log('node telegram-notifier.js --test   # Test connessione');
    }
} 