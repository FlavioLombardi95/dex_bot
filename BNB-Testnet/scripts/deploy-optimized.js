#!/usr/bin/env node

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');
const ConfigManager = require('../core/config');
const Logger = require('../core/logger');

class OptimizedDeployer {
    constructor() {
        this.config = new ConfigManager();
        this.logger = Logger.getLogger('deploy');
    }

    async deploy() {
        this.logger.info('🚀 Inizio deploy del contratto Arbitrage', {
            network: this.config.network.name,
            chainId: this.config.network.chainId
        });

        try {
            // Ottieni signer
            const [deployer] = await ethers.getSigners();
            this.logger.info('📝 Deploying con account', { 
                address: deployer.address 
            });
            
            // Verifica saldo
            const balance = await deployer.getBalance();
            const balanceFormatted = ethers.utils.formatEther(balance);
            
            this.logger.info('💰 Saldo account', {
                balance: balanceFormatted,
                currency: this.config.network.currency
            });
            
            if (balance.lt(ethers.utils.parseEther('0.01'))) {
                this.logger.warn('⚠️ Saldo basso per deploy e gas fees');
            }
            
            // Ottieni configurazione DEX dal ConfigManager
            const dexConfig = this.config.dex;
            const routerAddresses = [];
            
            Object.entries(dexConfig).forEach(([name, config]) => {
                if (config.router) {
                    routerAddresses.push(config.router);
                    this.logger.info(`🔧 Router ${name}`, { 
                        address: config.router 
                    });
                }
            });
            
            if (routerAddresses.length < 2) {
                throw new Error('Sono necessari almeno 2 router per l\'arbitraggio');
            }
            
            // Deploy del contratto
            this.logger.info('🔨 Compilazione e deploy del contratto...');
            const ArbitrageContract = await ethers.getContractFactory('Arbitrage');
            const arbitrageContract = await ArbitrageContract.deploy(
                routerAddresses[0], // Router primario
                routerAddresses[1], // Router secondario
                {
                    gasLimit: this.config.trading.gasLimit,
                    gasPrice: ethers.utils.parseUnits(
                        this.config.trading.gasPrice.toString(), 
                        'gwei'
                    )
                }
            );
            
            this.logger.info('⏳ Attesa conferma deploy...');
            await arbitrageContract.deployed();
            
            this.logger.info('✅ Contratto deployato con successo!', {
                contractAddress: arbitrageContract.address,
                transactionHash: arbitrageContract.deployTransaction.hash,
                gasUsed: arbitrageContract.deployTransaction.gasLimit?.toString()
            });
            
            // Salva configurazione contratto
            await this.saveContractConfig(arbitrageContract);
            
            // Verifica deploy
            await this.verifyDeploy(arbitrageContract);
            
            return arbitrageContract;
            
        } catch (error) {
            this.logger.error('❌ Errore durante il deploy', { 
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async saveContractConfig(contract) {
        const contractData = {
            address: contract.address,
            network: this.config.network.name,
            chainId: this.config.network.chainId,
            deployedAt: new Date().toISOString(),
            transactionHash: contract.deployTransaction.hash,
            routers: Object.fromEntries(
                Object.entries(this.config.dex).map(([name, config]) => [
                    name, 
                    { router: config.router, factory: config.factory }
                ])
            )
        };
        
        const configPath = path.join(__dirname, '..', 'deployed-contracts.json');
        let deployedContracts = {};
        
        if (fs.existsSync(configPath)) {
            deployedContracts = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
        
        deployedContracts[this.config.network.name] = contractData;
        fs.writeFileSync(configPath, JSON.stringify(deployedContracts, null, 2));
        
        this.logger.info('📁 Configurazione contratto salvata', {
            path: configPath
        });
    }

    async verifyDeploy(contract) {
        this.logger.info('🔍 Verifica deploy...');
        
        try {
            const code = await ethers.provider.getCode(contract.address);
            if (code === '0x') {
                throw new Error('Contratto non trovato all\'indirizzo specificato');
            }
            
            // Test chiamata di base
            const owner = await contract.owner();
            this.logger.info('✅ Contratto verificato', {
                owner: owner,
                codeSize: code.length
            });
            
        } catch (error) {
            this.logger.error('❌ Errore verifica deploy', { 
                error: error.message 
            });
            throw error;
        }
    }

    async estimateGasCosts() {
        this.logger.info('💰 Stima costi gas...');
        
        const ArbitrageContract = await ethers.getContractFactory('Arbitrage');
        const estimatedGas = await ArbitrageContract.signer.estimateGas(
            ArbitrageContract.getDeployTransaction(
                this.config.dex.pancakeswap.router,
                this.config.dex.uniswap.router
            )
        );
        
        const gasPrice = await ethers.provider.getGasPrice();
        const estimatedCost = estimatedGas.mul(gasPrice);
        
        this.logger.info('💸 Costi stimati', {
            gasLimit: estimatedGas.toString(),
            gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei') + ' gwei',
            totalCost: ethers.utils.formatEther(estimatedCost) + ' ' + this.config.network.currency
        });
        
        return {
            gasLimit: estimatedGas,
            gasPrice: gasPrice,
            totalCost: estimatedCost
        };
    }
}

async function main() {
    const deployer = new OptimizedDeployer();
    
    try {
        // Stima costi prima del deploy
        await deployer.estimateGasCosts();
        
        // Deploy
        const contract = await deployer.deploy();
        
        console.log('\n🎉 Deploy completato con successo!');
        console.log(`📍 Indirizzo contratto: ${contract.address}`);
        console.log(`🔗 Esplora: ${deployer.config.network.explorer}/address/${contract.address}`);
        
    } catch (error) {
        console.error('💥 Deploy fallito:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { OptimizedDeployer }; 