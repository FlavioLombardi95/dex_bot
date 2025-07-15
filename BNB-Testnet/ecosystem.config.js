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
      log_file: './logs/advanced-scanner-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
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
      log_file: './logs/new-token-scanner-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
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
      log_file: './logs/parallel-monitor-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
}; 