#!/usr/bin/env node

/**
 * 🏦 GESTORE WALLET - Accesso e gestione wallet sicuri
 * ===================================================
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class WalletManager {
    constructor() {
        this.secureDir = path.join(__dirname, 'secure');
        this.wallets = {};
        this.provider = null;
    }

    async initialize() {
        console.log('🏦 === GESTORE WALLET SICURO ===');
        console.log('===============================');
        
        // Setup provider BSC Testnet
        this.provider = new ethers.providers.JsonRpcProvider('https://bsc-testnet-rpc.publicnode.com');
        
        // Carica wallet disponibili
        await this.loadWallets();
        
        return this;
    }

    async loadWallets() {
        console.log('📂 Caricamento wallet disponibili...');
        
        const walletFiles = [
            'development-wallet.json',
            'production-wallet.json', 
            'cold-wallet.json'
        ];

        for (const file of walletFiles) {
            const filePath = path.join(this.secureDir, file);
            if (fs.existsSync(filePath)) {
                const walletData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const walletType = file.replace('-wallet.json', '');
                this.wallets[walletType] = walletData;
                console.log(`✅ ${walletType}: ${walletData.address}`);
            }
        }
    }

    async unlockWallet(walletType) {
        console.log(`🔓 Sblocco wallet ${walletType}...`);
        
        if (!this.wallets[walletType]) {
            throw new Error(`Wallet ${walletType} non trovato`);
        }

        const walletData = this.wallets[walletType];
        
        // Richiedi password master
        const password = await this.getPassword();
        
        try {
            // Decrittografa wallet
            const wallet = await ethers.Wallet.fromEncryptedJson(
                walletData.encrypted,
                password
            );
            
            // Connetto al provider
            const connectedWallet = wallet.connect(this.provider);
            
            console.log(`✅ Wallet ${walletType} sbloccato`);
            console.log(`📍 Indirizzo: ${connectedWallet.address}`);
            
            return connectedWallet;
            
        } catch (error) {
            throw new Error(`Errore sblocco wallet: ${error.message}`);
        }
    }

    async getPassword() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question('🔑 Inserisci password master: ', (password) => {
                rl.close();
                resolve(password);
            });
        });
    }

    async showWalletInfo(walletType) {
        console.log(`\n📊 INFO WALLET ${walletType.toUpperCase()}`);
        console.log('========================');
        
        const wallet = await this.unlockWallet(walletType);
        const balance = await wallet.getBalance();
        
        console.log(`📍 Indirizzo: ${wallet.address}`);
        console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} BNB`);
        console.log(`🎯 Scopo: ${this.wallets[walletType].purpose}`);
        console.log(`🔐 Permessi: ${this.wallets[walletType].permissions.join(', ')}`);
        
        return wallet;
    }

    async getTestnetBNB(walletType) {
        console.log(`\n🚰 OTTENERE BNB TESTNET`);
        console.log('======================');
        
        const wallet = await this.unlockWallet(walletType);
        const balance = await wallet.getBalance();
        
        console.log(`📍 Indirizzo: ${wallet.address}`);
        console.log(`💰 Balance attuale: ${ethers.utils.formatEther(balance)} BNB`);
        
        if (balance.gt(ethers.utils.parseEther('0.1'))) {
            console.log('✅ Hai già BNB testnet sufficienti');
            return wallet;
        }
        
        console.log('\n🔗 FAUCET BSC TESTNET:');
        console.log('1. Vai su: https://testnet.binance.org/faucet-smart');
        console.log('2. Inserisci il tuo indirizzo:', wallet.address);
        console.log('3. Clicca "Give me BNB"');
        console.log('4. Aspetta 1-2 minuti per la conferma');
        
        console.log('\n💡 Alternativa - Faucet alternativo:');
        console.log('https://faucet.quicknode.com/binance-smart-chain/bnb-testnet');
        
        return wallet;
    }

    async sendTransaction(walletType, toAddress, amount) {
        console.log(`\n📤 INVIO TRANSAZIONE`);
        console.log('===================');
        
        const wallet = await this.unlockWallet(walletType);
        const balance = await wallet.getBalance();
        
        console.log(`📍 Da: ${wallet.address}`);
        console.log(`📍 A: ${toAddress}`);
        console.log(`💰 Importo: ${amount} BNB`);
        console.log(`💰 Balance disponibile: ${ethers.utils.formatEther(balance)} BNB`);
        
        const amountWei = ethers.utils.parseEther(amount.toString());
        
        if (balance.lt(amountWei)) {
            throw new Error('Balance insufficiente');
        }
        
        // Stima gas
        const gasPrice = await this.provider.getGasPrice();
        const gasLimit = 21000; // Standard transfer
        const gasCost = gasPrice.mul(gasLimit);
        
        console.log(`⛽ Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} GWEI`);
        console.log(`⛽ Gas limit: ${gasLimit}`);
        console.log(`⛽ Gas cost: ${ethers.utils.formatEther(gasCost)} BNB`);
        
        const totalCost = amountWei.add(gasCost);
        console.log(`💸 Costo totale: ${ethers.utils.formatEther(totalCost)} BNB`);
        
        // Conferma transazione
        const confirmed = await this.confirmTransaction();
        if (!confirmed) {
            console.log('❌ Transazione annullata');
            return null;
        }
        
        try {
            console.log('📤 Invio transazione...');
            const tx = await wallet.sendTransaction({
                to: toAddress,
                value: amountWei,
                gasLimit: gasLimit
            });
            
            console.log(`✅ Transazione inviata!`);
            console.log(`🔗 Hash: ${tx.hash}`);
            console.log(`⏳ Aspetta conferma...`);
            
            const receipt = await tx.wait();
            console.log(`✅ Confermata! Block: ${receipt.blockNumber}`);
            
            return tx;
            
        } catch (error) {
            console.error(`❌ Errore transazione: ${error.message}`);
            throw error;
        }
    }

    async confirmTransaction() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question('❓ Confermi la transazione? (y/N): ', (answer) => {
                rl.close();
                resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
            });
        });
    }

    showMenu() {
        console.log('\n🏦 === MENU GESTORE WALLET ===');
        console.log('=============================');
        console.log('1. 📊 Info wallet development');
        console.log('2. 📊 Info wallet production');
        console.log('3. 📊 Info wallet cold storage');
        console.log('4. 🚰 Ottieni BNB testnet');
        console.log('5. 📤 Invia transazione test');
        console.log('6. 💰 Controlla balance');
        console.log('7. ❌ Esci');
        console.log('\nScegli opzione (1-7):');
    }

    async runInteractive() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        while (true) {
            this.showMenu();
            
            const choice = await new Promise((resolve) => {
                rl.question('> ', (answer) => resolve(answer.trim()));
            });

            try {
                switch (choice) {
                    case '1':
                        await this.showWalletInfo('development');
                        break;
                    case '2':
                        await this.showWalletInfo('production');
                        break;
                    case '3':
                        await this.showWalletInfo('cold');
                        break;
                    case '4':
                        await this.getTestnetBNB('development');
                        break;
                    case '5':
                        const toAddress = await new Promise((resolve) => {
                            rl.question('📍 Indirizzo destinazione: ', resolve);
                        });
                        const amount = await new Promise((resolve) => {
                            rl.question('💰 Importo BNB: ', resolve);
                        });
                        await this.sendTransaction('development', toAddress, parseFloat(amount));
                        break;
                    case '6':
                        const wallet = await this.unlockWallet('development');
                        const balance = await wallet.getBalance();
                        console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} BNB`);
                        break;
                    case '7':
                        console.log('👋 Arrivederci!');
                        rl.close();
                        return;
                    default:
                        console.log('❌ Opzione non valida');
                }
            } catch (error) {
                console.error(`❌ Errore: ${error.message}`);
            }
            
            console.log('\n' + '='.repeat(50));
        }
    }
}

// Esecuzione
if (require.main === module) {
    const manager = new WalletManager();
    manager.initialize().then(() => {
        manager.runInteractive();
    }).catch(console.error);
}

module.exports = WalletManager; 