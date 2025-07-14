const { ethers } = require('ethers');
const config = require('./config');
const logger = require('./logger');

class ConnectionPool {
    constructor() {
        this.networkConfig = config.getNetworkConfig()[config.getCurrentNetwork()];
        this.providers = [];
        this.currentProviderIndex = 0;
        this.providerHealth = [];
        this.requestCounts = [];
        this.errorCounts = [];
        this.healthCheckInterval = null;
        this.initialized = false;
        
        this.initializeProviders();
        this.startHealthMonitoring();
    }

    initializeProviders() {
        this.providers = this.networkConfig.rpcUrls.map((url, index) => {
            const provider = new ethers.providers.JsonRpcProvider(url);
            
            // Add custom properties for monitoring
            provider.url = url;
            provider.index = index;
            provider.requestCount = 0;
            provider.errorCount = 0;
            provider.lastUsed = Date.now();
            provider.responseTime = 0;
            
            this.providerHealth[index] = true;
            this.requestCounts[index] = 0;
            this.errorCounts[index] = 0;
            
            return provider;
        });
        
        this.initialized = true;
        logger.info('Connection pool initialized', {
            component: 'connection-pool',
            providersCount: this.providers.length,
            network: config.getCurrentNetwork()
        });
    }

    // Get the best available provider
    getProvider() {
        if (!this.initialized) {
            throw new Error('Connection pool not initialized');
        }

        // Find the best healthy provider
        const healthyProviders = this.providers.filter((_, index) => this.providerHealth[index]);
        
        if (healthyProviders.length === 0) {
            logger.warn('No healthy providers available, using first provider', {
                component: 'connection-pool'
            });
            return this.providers[0];
        }

        // Load balancing: choose provider with least requests
        const bestProvider = healthyProviders.reduce((best, current) => {
            return current.requestCount < best.requestCount ? current : best;
        });

        bestProvider.lastUsed = Date.now();
        bestProvider.requestCount++;
        this.requestCounts[bestProvider.index]++;
        
        return bestProvider;
    }

    // Execute request with automatic failover
    async executeRequest(requestFunction, maxRetries = 3, retryDelay = 1000) {
        let lastError;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const provider = this.getProvider();
            const startTime = Date.now();
            
            try {
                const result = await requestFunction(provider);
                
                // Update response time
                provider.responseTime = Date.now() - startTime;
                
                logger.debug('Request successful', {
                    component: 'connection-pool',
                    provider: provider.url,
                    responseTime: provider.responseTime,
                    attempt: attempt + 1
                });
                
                return result;
            } catch (error) {
                lastError = error;
                provider.errorCount++;
                this.errorCounts[provider.index]++;
                
                logger.warn('Request failed', {
                    component: 'connection-pool',
                    provider: provider.url,
                    error: error.message,
                    attempt: attempt + 1
                });
                
                // Mark provider as unhealthy if too many errors
                if (provider.errorCount > 5) {
                    this.providerHealth[provider.index] = false;
                    logger.warn('Provider marked as unhealthy', {
                        component: 'connection-pool',
                        provider: provider.url,
                        errorCount: provider.errorCount
                    });
                }
                
                // Wait before retry
                if (attempt < maxRetries - 1) {
                    await this.sleep(retryDelay);
                }
            }
        }
        
        throw lastError;
    }

    // Common RPC methods with automatic failover
    async getBlockNumber() {
        return this.executeRequest(provider => provider.getBlockNumber());
    }

    async getBlock(blockNumber) {
        return this.executeRequest(provider => provider.getBlock(blockNumber));
    }

    async getTransaction(hash) {
        return this.executeRequest(provider => provider.getTransaction(hash));
    }

    async getTransactionReceipt(hash) {
        return this.executeRequest(provider => provider.getTransactionReceipt(hash));
    }

    async getBalance(address) {
        return this.executeRequest(provider => provider.getBalance(address));
    }

    async getGasPrice() {
        return this.executeRequest(provider => provider.getGasPrice());
    }

    async estimateGas(transaction) {
        return this.executeRequest(provider => provider.estimateGas(transaction));
    }

    async sendTransaction(transaction) {
        return this.executeRequest(provider => provider.sendTransaction(transaction));
    }

    async call(transaction, blockTag) {
        return this.executeRequest(provider => provider.call(transaction, blockTag));
    }

    // Contract interaction methods
    async createContract(address, abi) {
        const provider = this.getProvider();
        return new ethers.Contract(address, abi, provider);
    }

    async createContractWithSigner(address, abi, signer) {
        return new ethers.Contract(address, abi, signer);
    }

    // Batch requests for better performance
    async batchRequest(requests) {
        const provider = this.getProvider();
        const startTime = Date.now();
        
        try {
            const results = await Promise.all(
                requests.map(req => req(provider))
            );
            
            const responseTime = Date.now() - startTime;
            logger.debug('Batch request successful', {
                component: 'connection-pool',
                requestCount: requests.length,
                responseTime
            });
            
            return results;
        } catch (error) {
            logger.warn('Batch request failed', {
                component: 'connection-pool',
                error: error.message,
                requestCount: requests.length
            });
            throw error;
        }
    }

    // Health monitoring
    startHealthMonitoring() {
        this.healthCheckInterval = setInterval(() => {
            this.performHealthCheck();
        }, 60000); // Check every minute
    }

    async performHealthCheck() {
        const promises = this.providers.map(async (provider, index) => {
            try {
                const startTime = Date.now();
                await provider.getBlockNumber();
                const responseTime = Date.now() - startTime;
                
                // Reset error count and mark as healthy if response is good
                if (responseTime < 5000) { // 5 second timeout
                    provider.errorCount = 0;
                    this.providerHealth[index] = true;
                }
                
                logger.debug('Health check passed', {
                    component: 'connection-pool',
                    provider: provider.url,
                    responseTime
                });
                
                return { index, healthy: true, responseTime };
            } catch (error) {
                this.providerHealth[index] = false;
                
                logger.warn('Health check failed', {
                    component: 'connection-pool',
                    provider: provider.url,
                    error: error.message
                });
                
                return { index, healthy: false, error: error.message };
            }
        });
        
        const results = await Promise.allSettled(promises);
        const healthyCount = results.filter(r => r.status === 'fulfilled' && r.value.healthy).length;
        
        logger.info('Health check completed', {
            component: 'connection-pool',
            healthyProviders: healthyCount,
            totalProviders: this.providers.length
        });
    }

    // Statistics
    getStats() {
        return {
            providers: this.providers.map((provider, index) => ({
                url: provider.url,
                healthy: this.providerHealth[index],
                requestCount: this.requestCounts[index],
                errorCount: this.errorCounts[index],
                lastUsed: provider.lastUsed,
                responseTime: provider.responseTime
            })),
            totalRequests: this.requestCounts.reduce((sum, count) => sum + count, 0),
            totalErrors: this.errorCounts.reduce((sum, count) => sum + count, 0),
            healthyProviders: this.providerHealth.filter(h => h).length
        };
    }

    // Reset statistics
    resetStats() {
        this.providers.forEach((provider, index) => {
            provider.requestCount = 0;
            provider.errorCount = 0;
            this.requestCounts[index] = 0;
            this.errorCounts[index] = 0;
        });
        
        logger.info('Statistics reset', {
            component: 'connection-pool'
        });
    }

    // Cleanup
    destroy() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        
        logger.info('Connection pool destroyed', {
            component: 'connection-pool'
        });
    }

    // Utility methods
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get provider by index (for testing)
    getProviderByIndex(index) {
        return this.providers[index];
    }

    // Force provider switch
    switchToNextProvider() {
        this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
        const provider = this.providers[this.currentProviderIndex];
        
        logger.info('Manually switched provider', {
            component: 'connection-pool',
            provider: provider.url,
            index: this.currentProviderIndex
        });
        
        return provider;
    }

    // Mark provider as unhealthy
    markProviderUnhealthy(index) {
        if (index >= 0 && index < this.providers.length) {
            this.providerHealth[index] = false;
            logger.warn('Provider manually marked as unhealthy', {
                component: 'connection-pool',
                provider: this.providers[index].url,
                index
            });
        }
    }

    // Mark provider as healthy
    markProviderHealthy(index) {
        if (index >= 0 && index < this.providers.length) {
            this.providerHealth[index] = true;
            this.providers[index].errorCount = 0;
            logger.info('Provider manually marked as healthy', {
                component: 'connection-pool',
                provider: this.providers[index].url,
                index
            });
        }
    }
}

module.exports = new ConnectionPool(); 