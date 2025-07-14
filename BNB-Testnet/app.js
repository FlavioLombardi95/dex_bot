const config = require('./core/config');
const logger = require('./core/logger');
const connectionPool = require('./core/connection-pool');
const TriangularScanner = require('./scanners/triangular-scanner');

class ArbitrageApp {
    constructor() {
        this.config = config.getConfig();
        this.logger = logger.createChildLogger({
            component: 'app',
            version: require('./package.json').version
        });
        
        this.scanners = [];
        this.healthCheckInterval = null;
        this.isShuttingDown = false;
        
        this.setupEventHandlers();
        this.logStartup();
    }

    logStartup() {
        this.logger.startup('Arbitrage Bot', require('./package.json').version, {
            network: config.getCurrentNetwork(),
            environment: this.config.environment,
            dryRun: this.config.environment.dryRun
        });
        
        this.logger.logSystemInfo();
        this.logger.logMemoryUsage();
    }

    setupEventHandlers() {
        // Graceful shutdown
        process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
        
        // Error handling
        process.on('uncaughtException', (error) => {
            this.logger.errorWithContext(error, {
                component: 'app',
                operation: 'uncaught-exception'
            });
            this.gracefulShutdown('uncaughtException');
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error('Unhandled promise rejection', {
                component: 'app',
                reason: reason.toString(),
                promise: promise.toString()
            });
        });
    }

    async initialize() {
        try {
            this.logger.info('Initializing application...');
            
            // Initialize database if configured
            await this.initializeDatabase();
            
            // Initialize scanners
            await this.initializeScanners();
            
            // Start health monitoring
            this.startHealthMonitoring();
            
            // Start API server if enabled
            if (this.config.api.internal.enabled) {
                await this.startApiServer();
            }
            
            this.logger.info('Application initialized successfully', {
                scanners: this.scanners.length,
                healthMonitoring: true,
                apiEnabled: this.config.api.internal.enabled
            });
            
        } catch (error) {
            this.logger.errorWithContext(error, {
                component: 'app',
                operation: 'initialize'
            });
            throw error;
        }
    }

    async initializeDatabase() {
        // SQLite initialization
        if (this.config.database.sqlite.enabled) {
            const sqlite3 = require('sqlite3');
            const { open } = require('sqlite');
            
            this.db = await open({
                filename: this.config.database.sqlite.path,
                driver: sqlite3.Database
            });
            
            await this.createTables();
            
            this.logger.info('SQLite database initialized', {
                path: this.config.database.sqlite.path
            });
        }
        
        // Redis initialization
        if (this.config.database.redis.enabled) {
            const redis = require('redis');
            this.redis = redis.createClient({
                url: this.config.database.redis.url
            });
            
            await this.redis.connect();
            
            this.logger.info('Redis connected', {
                url: this.config.database.redis.url
            });
        }
    }

    async createTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS opportunities (
                id TEXT PRIMARY KEY,
                scanner_type TEXT NOT NULL,
                path_id TEXT,
                net_profit_percentage REAL,
                gross_profit_percentage REAL,
                gas_costs REAL,
                detected_at INTEGER,
                block_number INTEGER,
                gas_price REAL,
                volatility REAL,
                priority REAL,
                data TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS executions (
                id TEXT PRIMARY KEY,
                opportunity_id TEXT,
                status TEXT,
                tx_hash TEXT,
                actual_profit REAL,
                executed_at INTEGER,
                error_message TEXT,
                FOREIGN KEY (opportunity_id) REFERENCES opportunities (id)
            )`,
            `CREATE TABLE IF NOT EXISTS performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scanner_type TEXT,
                total_scans INTEGER,
                successful_scans INTEGER,
                errors INTEGER,
                opportunities INTEGER,
                uptime INTEGER,
                recorded_at INTEGER
            )`
        ];
        
        for (const table of tables) {
            await this.db.exec(table);
        }
    }

    async initializeScanners() {
        // Initialize triangular scanner
        const triangularScanner = new TriangularScanner({
            scanInterval: this.config.monitoring.scanning.triangularInterval,
            minProfitPercentage: this.config.trading.arbitrage.triangular.minProfitPercentage,
            maxSlippage: this.config.trading.arbitrage.triangular.maxSlippage,
            minAmount: this.config.trading.arbitrage.triangular.minAmount,
            maxAmount: this.config.trading.arbitrage.triangular.maxAmount
        });
        
        this.scanners.push(triangularScanner);
        
        // Add more scanners here as needed
        
        this.logger.info('Scanners initialized', {
            count: this.scanners.length,
            types: this.scanners.map(s => s.scannerName)
        });
    }

    async start() {
        try {
            this.logger.info('Starting application...');
            
            // Start all scanners
            for (const scanner of this.scanners) {
                await scanner.start();
                this.logger.info(`Scanner started: ${scanner.scannerName}`);
            }
            
            this.logger.info('Application started successfully', {
                scanners: this.scanners.length,
                network: config.getCurrentNetwork(),
                dryRun: this.config.environment.dryRun
            });
            
        } catch (error) {
            this.logger.errorWithContext(error, {
                component: 'app',
                operation: 'start'
            });
            throw error;
        }
    }

    async stop() {
        try {
            this.logger.info('Stopping application...');
            
            // Stop all scanners
            for (const scanner of this.scanners) {
                await scanner.stop();
                this.logger.info(`Scanner stopped: ${scanner.scannerName}`);
            }
            
            // Stop health monitoring
            if (this.healthCheckInterval) {
                clearInterval(this.healthCheckInterval);
            }
            
            // Close database connections
            if (this.db) {
                await this.db.close();
            }
            
            if (this.redis) {
                await this.redis.quit();
            }
            
            // Destroy connection pool
            connectionPool.destroy();
            
            this.logger.info('Application stopped successfully');
            
        } catch (error) {
            this.logger.errorWithContext(error, {
                component: 'app',
                operation: 'stop'
            });
        }
    }

    async gracefulShutdown(signal) {
        if (this.isShuttingDown) {
            return;
        }
        
        this.isShuttingDown = true;
        
        this.logger.shutdown('Arbitrage Bot', signal);
        
        try {
            await this.stop();
            process.exit(0);
        } catch (error) {
            this.logger.errorWithContext(error, {
                component: 'app',
                operation: 'graceful-shutdown'
            });
            process.exit(1);
        }
    }

    startHealthMonitoring() {
        this.healthCheckInterval = setInterval(async () => {
            await this.performHealthCheck();
        }, 60000); // Every minute
        
        this.logger.info('Health monitoring started');
    }

    async performHealthCheck() {
        try {
            const healthReport = {
                timestamp: Date.now(),
                scanners: {},
                connectionPool: connectionPool.getStats(),
                memory: process.memoryUsage(),
                uptime: process.uptime()
            };
            
            // Check scanner health
            for (const scanner of this.scanners) {
                healthReport.scanners[scanner.scannerName] = await scanner.healthCheck();
            }
            
            // Log health report
            this.logger.info('Health check completed', healthReport);
            
            // Store performance metrics
            await this.storePerformanceMetrics(healthReport);
            
        } catch (error) {
            this.logger.errorWithContext(error, {
                component: 'app',
                operation: 'health-check'
            });
        }
    }

    async storePerformanceMetrics(healthReport) {
        if (!this.db) return;
        
        try {
            for (const [scannerName, health] of Object.entries(healthReport.scanners)) {
                if (health.totalScans !== undefined) {
                    await this.db.run(`
                        INSERT INTO performance (
                            scanner_type, total_scans, successful_scans, errors, 
                            opportunities, uptime, recorded_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [
                        scannerName,
                        health.totalScans,
                        health.successfulScans,
                        health.errors,
                        health.opportunities,
                        health.uptime,
                        Date.now()
                    ]);
                }
            }
        } catch (error) {
            this.logger.errorWithContext(error, {
                component: 'app',
                operation: 'store-performance-metrics'
            });
        }
    }

    async startApiServer() {
        const express = require('express');
        const cors = require('cors');
        const rateLimit = require('express-rate-limit');
        
        const app = express();
        
        // Middleware
        app.use(express.json());
        
        if (this.config.api.internal.cors) {
            app.use(cors());
        }
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: this.config.api.internal.rateLimit.windowMs,
            max: this.config.api.internal.rateLimit.max
        });
        app.use('/api/', limiter);
        
        // Routes
        app.get('/api/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: Date.now(),
                version: require('./package.json').version,
                network: config.getCurrentNetwork(),
                uptime: process.uptime()
            });
        });
        
        app.get('/api/scanners', (req, res) => {
            const scannerStats = this.scanners.map(scanner => ({
                name: scanner.scannerName,
                stats: scanner.getStats(),
                isRunning: scanner.isRunning
            }));
            
            res.json(scannerStats);
        });
        
        app.get('/api/opportunities', async (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 50;
                const offset = parseInt(req.query.offset) || 0;
                
                const opportunities = await this.db.all(`
                    SELECT * FROM opportunities 
                    ORDER BY detected_at DESC 
                    LIMIT ? OFFSET ?
                `, [limit, offset]);
                
                res.json(opportunities);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        app.get('/api/connection-pool', (req, res) => {
            res.json(connectionPool.getStats());
        });
        
        // Start server
        const server = app.listen(this.config.api.internal.port, () => {
            this.logger.info('API server started', {
                port: this.config.api.internal.port,
                endpoints: ['/api/health', '/api/scanners', '/api/opportunities', '/api/connection-pool']
            });
        });
        
        this.apiServer = server;
    }

    // Utility methods
    getStatus() {
        return {
            isRunning: this.scanners.some(s => s.isRunning),
            scanners: this.scanners.length,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            network: config.getCurrentNetwork(),
            environment: this.config.environment
        };
    }

    async getPerformanceReport() {
        if (!this.db) return null;
        
        try {
            const report = await this.db.all(`
                SELECT 
                    scanner_type,
                    AVG(total_scans) as avg_scans,
                    AVG(successful_scans) as avg_successful,
                    AVG(errors) as avg_errors,
                    AVG(opportunities) as avg_opportunities,
                    COUNT(*) as records
                FROM performance 
                WHERE recorded_at > ? 
                GROUP BY scanner_type
            `, [Date.now() - 24 * 60 * 60 * 1000]); // Last 24 hours
            
            return report;
        } catch (error) {
            this.logger.errorWithContext(error, {
                component: 'app',
                operation: 'get-performance-report'
            });
            return null;
        }
    }
}

// Create and export app instance
const app = new ArbitrageApp();

async function main() {
    try {
        await app.initialize();
        await app.start();
    } catch (error) {
        logger.errorWithContext(error, {
            component: 'main',
            operation: 'startup'
        });
        process.exit(1);
    }
}

// Auto-start if this file is run directly
if (require.main === module) {
    main();
}

module.exports = app; 