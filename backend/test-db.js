const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.development") });
const mysql = require("mysql2/promise");
const fs = require("fs");

async function inspectDatabase() {
    const sslCert = fs.readFileSync(path.join(__dirname, "ca.pem"));

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {ca: sslCert, rejectUnauthorized: false},
    });

    try {
        const conn = await pool.getConnection();
        console.log("🔍 INSPECTING DATABASE:", process.env.DB_NAME);

        // 1. Liệt kê tất cả tables
        const [tables] = await conn.query("SHOW TABLES");
        console.log("\n📊 TABLES IN DATABASE:");
        tables.forEach((table, index) => {
            const tableName = table[`Tables_in_${process.env.DB_NAME}`];
            console.log(`${index + 1}. ${tableName}`);
        });

        // 2. Xem cấu trúc từng table
        console.log("\n🔧 TABLE STRUCTURES:");
        for (const table of tables) {
            const tableName = table[`Tables_in_${process.env.DB_NAME}`];
            console.log(`\n--- ${tableName} ---`);

            const [columns] = await conn.query(`DESCRIBE ${tableName}`);
            columns.forEach((col) => {
                console.log(`  ${col.Field}: ${col.Type} ${col.Null === "NO" ? "NOT NULL" : ""} ${col.Key ? `(${col.Key})` : ""}`);
            });

            // Count rows
            const [[count]] = await conn.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`  Rows: ${count.count}`);
        }

        // 3. Kiểm tra sample data
        console.log("\n📋 SAMPLE DATA (first 3 rows each table):");
        for (const table of tables) {
            const tableName = table[`Tables_in_${process.env.DB_NAME}`];
            const [rows] = await conn.query(`SELECT * FROM ${tableName} LIMIT 3`);

            if (rows.length > 0) {
                console.log(`\n${tableName}:`);
                console.log(rows);
            }
        }

        conn.release();
    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        process.exit();
    }
}

inspectDatabase();
