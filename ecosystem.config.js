module.exports = {
    apps: [ {
        name: 'gospel-api',
        instances: 0,
        exec_mode: 'cluster',
        script: 'index.js',
        max_memory_restart: '680M',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true,
        env: {
            NODE_ENV: 'production',
            ENABLE_NODE_LOG: 'YES',
        }
    }]
};
