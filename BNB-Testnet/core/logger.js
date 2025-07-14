const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('./config');

class Logger {
    constructor() {
        this.loggingConfig = config.getLoggingConfig();
        this.createLogDirectories();
        this.setupWinstonLogger();
        this.setupCustomMethods();
    }

    createLogDirectories() {
        const logDir = path.dirname(this.loggingConfig.files.main);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    setupWinstonLogger() {
        const transports = [];

        // Console transport
        if (this.loggingConfig.enableConsole) {
            transports.push(new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    winston.format.printf(({ timestamp, level, message, ...meta }) => {
                        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
                        return `${timestamp} [${level}] ${message} ${metaStr}`;
                    })
                )
            }));
        }

        // Main log file
        transports.push(new winston.transports.File({
            filename: this.loggingConfig.files.main,
            format: this.getFileFormat(),
            maxsize: this.parseSize(this.loggingConfig.maxSize),
            maxFiles: this.loggingConfig.maxFiles,
            tailable: true
        }));

        // Error log file
        transports.push(new winston.transports.File({
            filename: this.loggingConfig.files.errors,
            level: 'error',
            format: this.getFileFormat(),
            maxsize: this.parseSize(this.loggingConfig.maxSize),
            maxFiles: this.loggingConfig.maxFiles,
            tailable: true
        }));

        this.logger = winston.createLogger({
            level: this.loggingConfig.level,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            transports,
            exitOnError: false
        });
    }

    getFileFormat() {
        return winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
        );
    }

    parseSize(size) {
        if (typeof size === 'number') return size;
        const units = { b: 1, k: 1024, m: 1024 * 1024, g: 1024 * 1024 * 1024 };
        const match = size.match(/^(\d+)([bkmg]?)$/i);
        if (!match) return 5 * 1024 * 1024; // Default 5MB
        return parseInt(match[1]) * (units[match[2].toLowerCase()] || 1);
    }

    setupCustomMethods() {
        // Override standard methods to add context
        const originalMethods = ['error', 'warn', 'info', 'debug', 'silly'];
        originalMethods.forEach(method => {
            this[method] = (message, meta = {}) => {
                const context = {
                    timestamp: new Date().toISOString(),
                    component: meta.component || 'unknown',
                    network: config.getCurrentNetwork(),
                    ...meta
                };
                this.logger[method](message, context);
            };
        });
    }

    // Specialized logging methods
    opportunity(opportunity, meta = {}) {
        const opportunityLogger = winston.createLogger({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({
                    filename: this.loggingConfig.files.opportunities,
                    maxsize: this.parseSize(this.loggingConfig.maxSize),
                    maxFiles: this.loggingConfig.maxFiles,
                    tailable: true
                })
            ]
        });

        opportunityLogger.info('Opportunity Found', {
            ...opportunity,
            ...meta,
            timestamp: new Date().toISOString(),
            network: config.getCurrentNetwork()
        });
    }

    profit(trade, meta = {}) {
        const profitLogger = winston.createLogger({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({
                    filename: this.loggingConfig.files.profits,
                    maxsize: this.parseSize(this.loggingConfig.maxSize),
                    maxFiles: this.loggingConfig.maxFiles,
                    tailable: true
                })
            ]
        });

        profitLogger.info('Profit Recorded', {
            ...trade,
            ...meta,
            timestamp: new Date().toISOString(),
            network: config.getCurrentNetwork()
        });
    }

    analytics(data, meta = {}) {
        const analyticsLogger = winston.createLogger({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({
                    filename: this.loggingConfig.files.analytics,
                    maxsize: this.parseSize(this.loggingConfig.maxSize),
                    maxFiles: this.loggingConfig.maxFiles,
                    tailable: true
                })
            ]
        });

        analyticsLogger.info('Analytics Data', {
            ...data,
            ...meta,
            timestamp: new Date().toISOString(),
            network: config.getCurrentNetwork()
        });
    }

    // Performance logging
    performance(operation, duration, meta = {}) {
        this.info(`Performance: ${operation} completed in ${duration}ms`, {
            component: 'performance',
            operation,
            duration,
            ...meta
        });
    }

    // Transaction logging
    transaction(tx, meta = {}) {
        this.info('Transaction', {
            component: 'transaction',
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            gasUsed: tx.gasUsed,
            gasPrice: tx.gasPrice,
            status: tx.status,
            ...meta
        });
    }

    // Error tracking with context
    errorWithContext(error, context = {}) {
        this.error(error.message, {
            component: context.component || 'unknown',
            stack: error.stack,
            name: error.name,
            operation: context.operation,
            ...context
        });
    }

    // Startup logging
    startup(service, version, meta = {}) {
        this.info(`${service} v${version} starting up`, {
            component: 'startup',
            service,
            version,
            network: config.getCurrentNetwork(),
            environment: config.getConfig().environment,
            ...meta
        });
    }

    // Shutdown logging
    shutdown(service, reason, meta = {}) {
        this.info(`${service} shutting down: ${reason}`, {
            component: 'shutdown',
            service,
            reason,
            ...meta
        });
    }

    // Health check logging
    healthCheck(component, status, meta = {}) {
        this.info(`Health check: ${component} - ${status}`, {
            component: 'healthcheck',
            service: component,
            status,
            ...meta
        });
    }

    // Rate limiting logs
    rateLimit(operation, attempts, meta = {}) {
        this.warn(`Rate limiting: ${operation} - ${attempts} attempts`, {
            component: 'ratelimit',
            operation,
            attempts,
            ...meta
        });
    }

    // Network switch logging
    networkSwitch(from, to, reason, meta = {}) {
        this.warn(`Network switch: ${from} -> ${to} (${reason})`, {
            component: 'network',
            fromNetwork: from,
            toNetwork: to,
            reason,
            ...meta
        });
    }

    // Cache operations
    cache(operation, key, hit, meta = {}) {
        this.debug(`Cache ${operation}: ${key} - ${hit ? 'HIT' : 'MISS'}`, {
            component: 'cache',
            operation,
            key,
            hit,
            ...meta
        });
    }

    // Scanner specific logging
    scanner(scannerType, action, result, meta = {}) {
        this.info(`Scanner [${scannerType}]: ${action}`, {
            component: 'scanner',
            scannerType,
            action,
            result,
            ...meta
        });
    }

    // Bot lifecycle logging
    botStatus(status, meta = {}) {
        this.info(`Bot status: ${status}`, {
            component: 'bot',
            status,
            ...meta
        });
    }

    // Utility methods
    logMemoryUsage() {
        const memoryUsage = process.memoryUsage();
        this.info('Memory usage', {
            component: 'system',
            memory: {
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
                external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
            }
        });
    }

    logSystemInfo() {
        this.info('System info', {
            component: 'system',
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            uptime: process.uptime()
        });
    }

    // Method to create child logger with persistent context
    createChildLogger(context) {
        return {
            error: (message, meta = {}) => this.error(message, { ...context, ...meta }),
            warn: (message, meta = {}) => this.warn(message, { ...context, ...meta }),
            info: (message, meta = {}) => this.info(message, { ...context, ...meta }),
            debug: (message, meta = {}) => this.debug(message, { ...context, ...meta }),
            silly: (message, meta = {}) => this.silly(message, { ...context, ...meta })
        };
    }

    // Get statistics
    getStats() {
        return {
            level: this.loggingConfig.level,
            files: Object.keys(this.loggingConfig.files).map(key => ({
                type: key,
                path: this.loggingConfig.files[key],
                exists: fs.existsSync(this.loggingConfig.files[key])
            }))
        };
    }

    // Cleanup old logs
    cleanup(daysToKeep = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        Object.values(this.loggingConfig.files).forEach(logFile => {
            try {
                if (fs.existsSync(logFile)) {
                    const stats = fs.statSync(logFile);
                    if (stats.mtime < cutoffDate) {
                        fs.unlinkSync(logFile);
                        this.info(`Cleaned up old log file: ${logFile}`);
                    }
                }
            } catch (error) {
                this.error(`Error cleaning up log file ${logFile}: ${error.message}`);
            }
        });
    }
}

module.exports = new Logger(); 