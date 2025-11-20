require("dotenv").config();
const {Pool} = require("pg");

// Convert MySQL-style ? placeholders → Postgres $1, $2, ...
function convertPlaceholders(sql) {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Neon yêu cầu SSL
    },
});

// Wrapper giống mysql2.promise()
module.exports = {
    query: async (sql, params = []) => {
        const convertedSQL = convertPlaceholders(sql);
        const result = await pool.query(convertedSQL, params);
        return [result.rows]; // Giống mysql2: trả về [rows]
    },
};
