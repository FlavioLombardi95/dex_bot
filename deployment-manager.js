#!/usr/bin/env node

/**
 * DEPLOYMENT MANAGER - DEX ARBITRAGE BOT
 * =====================================
 * 
 * Gestisce deploy e configurazioni multi-network
 * Coordina operazioni tra BNB-Testnet e POL-Amoy
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ProjectConfig = require('./project-config');

class DeploymentManager {
    constructor() {
        this.projectConfig = new ProjectConfig();
        this.deployments = this.loadDeployments();
        this.logFile = path.join(__dirname, 'deployment-log.txt');
    }

    loadDeployments() {
        const deploymentFile = path.join(__dirname, 'deployments.json');
        if (fs.existsSync(deploymentFile)) {
            return JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
        }
        return {};
    }

    saveDeployments() {
        const deploymentFile = path.join(__dirname, 'deployments.json');
        fs.writeFileSync(deploymentFile, JSON.stringify(this.deployments, null, 2));
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        
        console.log(message);
        fs.appendFileSync(this.logFile, logEntry);
    }

    async deployToNetwork(networkKey, options = {}) {
        this.log(`🚀 Avvio deploy su ${networkKey}`);
        
        try {
            const config = this.projectConfig.getNetworkConfig(networkKey);
            const networkPath = this.projectConfig.getNetworkPath(networkKey);
            
            // Verifica che la directory esista
            if (!fs.existsSync(networkPath)) {
                throw new Error(`Directory network non trovata: ${networkPath}`);
            }
            
            // Cambia directory
            process.chdir(networkPath);
            this.log(`📂 Directory di lavoro: ${networkPath}`);
            
            // Verifica dipendenze
            if (!fs.existsSync('node_modules')) {
                this.log('📦 Installazione dipendenze...');
                execSync('npm install', { stdio: 'inherit' });
            }
            
            // Compila contratti
            this.log('🔨 Compilazione contratti...');
            execSync('npx hardhat compile', { stdio: 'inherit' });
            
            // Deploy contratto
            this.log('🚀 Deploy contratto...');
            const deployScript = options.optimized ? 'scripts/deploy-optimized.js' : 'scripts/deploy.js';
            
            if (fs.existsSync(deployScript)) {
                execSync(`npx hardhat run ${deployScript}`, { stdio: 'inherit' });
            } else {
                throw new Error(`Script deploy non trovato: ${deployScript}`);
            }
            
            // Leggi risultato deploy
            const deployedContractsPath = path.join(networkPath, 'deployed-contracts.json');
            let contractAddress = null;
            
            if (fs.existsSync(deployedContractsPath)) {
                const deployedContracts = JSON.parse(fs.readFileSync(deployedContractsPath, 'utf8'));
                contractAddress = deployedContracts[config.name]?.address;
            }
            
            // Salva deployment info
            this.deployments[networkKey] = {
                timestamp: new Date().toISOString(),
                network: config.name,
                chainId: config.chainId,
                contractAddress: contractAddress,
                status: 'success',
                path: networkPath
            };
            
            this.saveDeployments();
            this.log(`✅ Deploy completato su ${networkKey}`);
            
            return this.deployments[networkKey];
            
        } catch (error) {
            this.log(`❌ Errore deploy su ${networkKey}: ${error.message}`);
            
            this.deployments[networkKey] = {
                timestamp: new Date().toISOString(),
                network: networkKey,
                status: 'error',
                error: error.message
            };
            
            this.saveDeployments();
            throw error;
        }
    }

    async deployToAllNetworks(options = {}) {
        this.log('🌐 Deploy multi-network avviato');
        
        const networks = this.projectConfig.getAvailableNetworks();
        const results = {};
        
        for (const network of networks) {
            try {
                results[network.key] = await this.deployToNetwork(network.key, options);
                this.log(`✅ ${network.key} completato`);
            } catch (error) {
                results[network.key] = { 
                    status: 'error', 
                    error: error.message 
                };
                this.log(`❌ ${network.key} fallito: ${error.message}`);
            }
        }
        
        this.generateDeploymentReport(results);
        
        return results;
    }

    async runSetupOnNetwork(networkKey) {
        this.log(`🔧 Setup su ${networkKey}`);
        
        try {
            const networkPath = this.projectConfig.getNetworkPath(networkKey);
            process.chdir(networkPath);
            
            // Verifica che esista script setup ottimizzato
            const setupScript = 'scripts/setup-optimized.js';
            if (!fs.existsSync(setupScript)) {
                throw new Error(`Script setup non trovato: ${setupScript}`);
            }
            
            // Esegui setup
            execSync(`node ${setupScript}`, { stdio: 'inherit' });
            
            this.log(`✅ Setup completato su ${networkKey}`);
            
        } catch (error) {
            this.log(`❌ Errore setup su ${networkKey}: ${error.message}`);
            throw error;
        }
    }

    async runAnalysisOnNetwork(networkKey) {
        this.log(`📊 Analisi profittabilità su ${networkKey}`);
        
        try {
            const networkPath = this.projectConfig.getNetworkPath(networkKey);
            process.chdir(networkPath);
            
            // Verifica che esista script analisi
            const analysisScript = 'scripts/profitability-analyzer.js';
            if (!fs.existsSync(analysisScript)) {
                throw new Error(`Script analisi non trovato: ${analysisScript}`);
            }
            
            // Esegui analisi
            execSync(`node ${analysisScript}`, { stdio: 'inherit' });
            
            this.log(`✅ Analisi completata su ${networkKey}`);
            
        } catch (error) {
            this.log(`❌ Errore analisi su ${networkKey}: ${error.message}`);
            throw error;
        }
    }

    generateDeploymentReport(results) {
        const reportPath = path.join(__dirname, 'deployment-report.md');
        const timestamp = new Date().toISOString();
        
        let report = `# Deployment Report\n\n`;
        report += `**Timestamp**: ${timestamp}\n\n`;
        
        report += `## Summary\n\n`;
        const successful = Object.values(results).filter(r => r.status === 'success').length;
        const failed = Object.values(results).filter(r => r.status === 'error').length;
        
        report += `- ✅ Successful: ${successful}\n`;
        report += `- ❌ Failed: ${failed}\n`;
        report += `- 📊 Total: ${Object.keys(results).length}\n\n`;
        
        report += `## Details\n\n`;
        
        Object.entries(results).forEach(([networkKey, result]) => {
            const icon = result.status === 'success' ? '✅' : '❌';
            report += `### ${icon} ${networkKey}\n\n`;
            
            if (result.status === 'success') {
                report += `- **Network**: ${result.network}\n`;
                report += `- **Chain ID**: ${result.chainId}\n`;
                report += `- **Contract**: ${result.contractAddress || 'N/A'}\n`;
                report += `- **Path**: ${result.path}\n`;
                report += `- **Timestamp**: ${result.timestamp}\n\n`;
            } else {
                report += `- **Error**: ${result.error}\n\n`;
            }
        });
        
        fs.writeFileSync(reportPath, report);
        this.log(`📄 Report salvato: ${reportPath}`);
    }

    async verifyDeployments() {
        this.log('🔍 Verifica deployments...');
        
        for (const [networkKey, deployment] of Object.entries(this.deployments)) {
            if (deployment.status === 'success' && deployment.contractAddress) {
                this.log(`🔍 Verifica ${networkKey}: ${deployment.contractAddress}`);
                
                try {
                    const networkPath = this.projectConfig.getNetworkPath(networkKey);
                    process.chdir(networkPath);
                    
                    // Verifica che il contratto sia ancora attivo
                    const verifyScript = `
                        const { ethers } = require('hardhat');
                        async function verify() {
                            const provider = ethers.provider;
                            const code = await provider.getCode('${deployment.contractAddress}');
                            if (code === '0x') {
                                console.log('❌ Contratto non trovato');
                                process.exit(1);
                            } else {
                                console.log('✅ Contratto verificato');
                                console.log('Code size:', code.length);
                            }
                        }
                        verify().catch(console.error);
                    `;
                    
                    fs.writeFileSync('verify-temp.js', verifyScript);
                    execSync('node verify-temp.js', { stdio: 'inherit' });
                    fs.unlinkSync('verify-temp.js');
                    
                    this.log(`✅ ${networkKey} verificato`);
                    
                } catch (error) {
                    this.log(`❌ Errore verifica ${networkKey}: ${error.message}`);
                }
            }
        }
    }

    async syncProjectStructure() {
        this.log('🔄 Sincronizzazione struttura progetto...');
        
        try {
            // Sincronizza usando ProjectConfig
            await this.projectConfig.synchronizeNetworks();
            
            // Copia file core mancanti
            await this.ensureCoreFiles();
            
            this.log('✅ Struttura progetto sincronizzata');
            
        } catch (error) {
            this.log(`❌ Errore sincronizzazione: ${error.message}`);
            throw error;
        }
    }

    async ensureCoreFiles() {
        const networks = this.projectConfig.getAvailableNetworks();
        const coreFiles = [
            { from: 'BNB-Testnet/core/config.js', to: 'core/config.js' },
            { from: 'BNB-Testnet/core/logger.js', to: 'core/logger.js' },
            { from: 'BNB-Testnet/core/connection-pool.js', to: 'core/connection-pool.js' },
            { from: 'BNB-Testnet/core/base-scanner.js', to: 'core/base-scanner.js' },
            { from: 'BNB-Testnet/scripts/deploy-optimized.js', to: 'scripts/deploy-optimized.js' },
            { from: 'BNB-Testnet/scripts/setup-optimized.js', to: 'scripts/setup-optimized.js' },
            { from: 'BNB-Testnet/scripts/profitability-analyzer.js', to: 'scripts/profitability-analyzer.js' }
        ];
        
        for (const network of networks) {
            const networkPath = this.projectConfig.getNetworkPath(network.key);
            
            for (const file of coreFiles) {
                const sourcePath = path.join(__dirname, file.from);
                const targetPath = path.join(networkPath, file.to);
                
                if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
                    // Crea directory se non esiste
                    const targetDir = path.dirname(targetPath);
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true });
                    }
                    
                    // Copia file
                    fs.copyFileSync(sourcePath, targetPath);
                    this.log(`📄 Copiato: ${file.to} -> ${network.key}`);
                }
            }
        }
    }

    printStatus() {
        console.log('\n📊 STATUS DEPLOYMENTS');
        console.log('=======================');
        
        const stats = this.projectConfig.getProjectStats();
        console.log(`📊 Network Totali: ${stats.totalNetworks}`);
        console.log(`✅ Network Attivi: ${stats.activeNetworks}`);
        
        console.log('\n🚀 DEPLOYMENTS:');
        if (Object.keys(this.deployments).length === 0) {
            console.log('  📭 Nessun deployment trovato');
        } else {
            Object.entries(this.deployments).forEach(([networkKey, deployment]) => {
                const icon = deployment.status === 'success' ? '✅' : '❌';
                console.log(`  ${icon} ${networkKey}`);
                if (deployment.status === 'success') {
                    console.log(`     Contract: ${deployment.contractAddress || 'N/A'}`);
                    console.log(`     Network: ${deployment.network}`);
                    console.log(`     Timestamp: ${deployment.timestamp}`);
                } else {
                    console.log(`     Error: ${deployment.error}`);
                }
            });
        }
    }

    async fullSetup() {
        this.log('🎯 SETUP COMPLETO DEL PROGETTO');
        
        try {
            // 1. Sincronizza struttura
            await this.syncProjectStructure();
            
            // 2. Setup di ogni network
            const networks = this.projectConfig.getAvailableNetworks();
            for (const network of networks) {
                await this.runSetupOnNetwork(network.key);
            }
            
            // 3. Deploy su tutti i network
            await this.deployToAllNetworks({ optimized: true });
            
            // 4. Verifica deployments
            await this.verifyDeployments();
            
            // 5. Analisi profittabilità
            for (const network of networks) {
                await this.runAnalysisOnNetwork(network.key);
            }
            
            this.log('🎉 SETUP COMPLETO TERMINATO CON SUCCESSO!');
            
        } catch (error) {
            this.log(`❌ SETUP FALLITO: ${error.message}`);
            throw error;
        }
    }
}

// CLI Support
async function main() {
    const manager = new DeploymentManager();
    
    const command = process.argv[2];
    const networkKey = process.argv[3];
    
    // Ripristina directory originale alla fine
    const originalDir = process.cwd();
    process.on('exit', () => {
        process.chdir(originalDir);
    });
    
    try {
        switch (command) {
            case 'deploy':
                if (!networkKey) {
                    console.error('❌ Specificare network key');
                    process.exit(1);
                }
                await manager.deployToNetwork(networkKey, { optimized: true });
                break;
                
            case 'deploy-all':
                await manager.deployToAllNetworks({ optimized: true });
                break;
                
            case 'setup':
                if (!networkKey) {
                    console.error('❌ Specificare network key');
                    process.exit(1);
                }
                await manager.runSetupOnNetwork(networkKey);
                break;
                
            case 'analyze':
                if (!networkKey) {
                    console.error('❌ Specificare network key');
                    process.exit(1);
                }
                await manager.runAnalysisOnNetwork(networkKey);
                break;
                
            case 'verify':
                await manager.verifyDeployments();
                break;
                
            case 'sync':
                await manager.syncProjectStructure();
                break;
                
            case 'full-setup':
                await manager.fullSetup();
                break;
                
            case 'status':
                manager.printStatus();
                break;
                
            default:
                console.log('🚀 DEX Bot Deployment Manager');
                console.log('==============================');
                console.log('Usage: node deployment-manager.js <command> [network]');
                console.log('');
                console.log('Commands:');
                console.log('  deploy <network>      - Deploy su network specifico');
                console.log('  deploy-all            - Deploy su tutti i network');
                console.log('  setup <network>       - Setup network specifico');
                console.log('  analyze <network>     - Analisi profittabilità');
                console.log('  verify                - Verifica deployments');
                console.log('  sync                  - Sincronizza struttura');
                console.log('  full-setup            - Setup completo progetto');
                console.log('  status                - Mostra status');
                console.log('');
                console.log('Available networks:');
                manager.projectConfig.getAvailableNetworks().forEach(network => {
                    console.log(`  - ${network.key} (${network.name})`);
                });
        }
        
    } catch (error) {
        console.error('💥 Errore:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = DeploymentManager; 