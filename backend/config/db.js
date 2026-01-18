// config/db.js - FINAL VERSION
const mysql = require("mysql2/promise");
const path = require("path");

// Load environment variables từ đúng file
const envFile = process.env.NODE_ENV === "production" ? path.join(__dirname, "../.env.production") : path.join(__dirname, "../.env.development");

require("dotenv").config({path: envFile});

console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
console.log(`📁 Loading env from: ${envFile}`);

// Hàm lấy SSL config
const getSSLConfig = () => {
    if (process.env.DB_SSL !== "true") {
        console.log("ℹ️ SSL disabled (DB_SSL != true)");
        return undefined;
    }

    try {
        // Production (Render): từ environment variable
        if (process.env.NODE_ENV === "production" && process.env.SSL_CERTIFICATE) {
            console.log("🔐 Using SSL certificate from environment variable");

            // Fix escape sequences
            const certContent = process.env.SSL_CERTIFICATE.replace(/\\n/g, "\n");

            return {
                ca: Buffer.from(certContent, "utf-8"),
                rejectUnauthorized: false,
            };
        }

        // Development: từ file
        if (process.env.NODE_ENV === "development") {
            const fs = require("fs");
            const certPath = path.join(__dirname, "../certs/ca.pem");

            if (fs.existsSync(certPath)) {
                console.log("🔐 Using SSL certificate from file");
                return {
                    ca: fs.readFileSync(certPath),
                    rejectUnauthorized: false,
                };
            } else {
                console.warn("⚠️ SSL certificate file not found:", certPath);
            }
        }
    } catch (error) {
        console.error("❌ Error loading SSL certificate:", error.message);
    }

    console.log("⚠️ No SSL certificate available");
    return undefined;
};

// Tạo pool connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,

    ssl: getSSLConfig(),

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

// Test connection
pool.getConnection()
    .then((connection) => {
        console.log(`✅ Database connected to: ${process.env.DB_NAME}`);
        connection.release();
    })
    .catch((err) => {
        console.error("❌ Database connection failed:", err.message);
        console.error("Error code:", err.code);
        console.error("Error number:", err.errno);

        // Debug info (ẩn password)
        console.log("🔍 Debug info:", {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            ssl: process.env.DB_SSL,
            env: process.env.NODE_ENV,
            certLength: process.env.SSL_CERTIFICATE?.length || 0,
        });
    });

module.exports = pool;