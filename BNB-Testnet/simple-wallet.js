#!/usr/bin/env node

/**
 * 🏦 GESTORE WALLET SEMPLIFICATO
 * ==============================
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class SimpleWalletManager {
    constructor() {
        this.secureDir = path.join(__dirname, 'secure');
        this.provider = new ethers.providers.JsonRpcProvider('https://bsc-testnet-rpc.publicnode.com');
    }

    async initialize() {
        console.log('🏦 === GESTORE WALLET SEMPLIFICATO ===');
        console.log('=====================================');
        
        // Leggi password da file
        const passwordPath = path.join(this.secureDir, 'master-password.txt');
        if (!fs.existsSync(passwordPath)) {
            throw new Error('Password master non trovata. Esegui prima: node security-setup.js');
        }
        
        this.masterPassword = fs.readFileSync(passwordPath, 'utf8').trim();
        console.log('✅ Password master caricata');
        
        return this;
    }

    async showWalletInfo(walletType = 'development') {
        console.log(`\n📊 INFO WALLET ${walletType.toUpperCase()}`);
        console.log('========================');
        
        const walletPath = path.join(this.secureDir, `${walletType}-wallet.json`);
        if (!fs.existsSync(walletPath)) {
            throw new Error(`Wallet ${walletType} non trovato`);
        }

        const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
        
        try {
            // Decrittografa wallet
            const wallet = await ethers.Wallet.fromEncryptedJson(
                walletData.encrypted,
                this.masterPassword
            );
            
            const connectedWallet = wallet.connect(this.provider);
            const balance = await connectedWallet.getBalance();
            
            console.log(`📍 Indirizzo: ${connectedWallet.address}`);
            console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} BNB`);
            console.log(`🎯 Scopo: ${walletData.purpose}`);
            console.log(`🔐 Permessi: ${walletData.permissions.join(', ')}`);
            
            return connectedWallet;
            
        } catch (error) {
            throw new Error(`Errore sblocco wallet: ${error.message}`);
        }
    }

    async getTestnetBNB() {
        console.log('\n🚰 OTTENERE BNB TESTNET');
        console.log('======================');
        
        const wallet = await this.showWalletInfo('development');
        const balance = await wallet.getBalance();
        
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

    async checkBalance() {
        console.log('\n💰 CONTROLLO BALANCE');
        console.log('===================');
        
        const wallet = await this.showWalletInfo('development');
        const balance = await wallet.getBalance();
        
        console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} BNB`);
        
        if (balance.gt(ethers.utils.parseEther('0.1'))) {
            console.log('✅ Balance sufficiente per test');
        } else {
            console.log('⚠️  Balance basso, ottieni BNB testnet');
        }
        
        return wallet;
    }

    async listAllWallets() {
        console.log('\n📂 WALLET DISPONIBILI');
        console.log('====================');
        
        const walletTypes = ['development', 'production', 'cold'];
        
        for (const type of walletTypes) {
            const walletPath = path.join(this.secureDir, `${type}-wallet.json`);
            if (fs.existsSync(walletPath)) {
                const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
                console.log(`✅ ${type}: ${walletData.address}`);
            }
        }
    }
}

// Esecuzione
if (require.main === module) {
    const manager = new SimpleWalletManager();
    manager.initialize().then(async () => {
        try {
            // Mostra tutti i wallet
            await manager.listAllWallets();
            
            // Controlla balance development wallet
            await manager.checkBalance();
            
            // Se balance basso, mostra faucet
            const wallet = await manager.showWalletInfo('development');
            const balance = await wallet.getBalance();
            
            if (balance.lt(ethers.utils.parseEther('0.1'))) {
                await manager.getTestnetBNB();
            }
            
        } catch (error) {
            console.error(`❌ Errore: ${error.message}`);
        }
    }).catch(console.error);
}

module.exports = SimpleWalletManager; 