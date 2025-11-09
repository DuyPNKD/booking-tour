module.exports = {
    apps: [
        {
            name: "booking-tour-api",
            script: "./index.js",
            instances: 2, // Số instances (hoặc "max" để dùng tất cả CPU cores)
            exec_mode: "cluster",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
            error_file: "./logs/pm2-error.log",
            out_file: "./logs/pm2-out.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
            merge_logs: true,
            autorestart: true,
            max_memory_restart: "500M",
            watch: false,
        },
    ],
};

