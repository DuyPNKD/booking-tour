const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const IMAGE_ROOT = path.join(__dirname, "public", "uploads", "images");

(async () => {
    const conn = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "123456",
        database: "booking_tour",
    });

    const [slugsInDB] = await conn.query("SELECT slug FROM tours");
    const slugSet = new Set(slugsInDB.map((t) => t.slug));

    const folders = fs.readdirSync(IMAGE_ROOT);

    for (const folder of folders) {
        const folderPath = path.join(IMAGE_ROOT, folder);

        if (!fs.statSync(folderPath).isDirectory()) continue;

        const files = fs.readdirSync(folderPath).filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));

        if (files.length === 0) {
            console.warn(`⚠️ Folder ảnh rỗng: ${folder}`);
        }

        if (!slugSet.has(folder)) {
            console.error(`❌ Không có slug trong DB cho folder: ${folder}`);
        }
    }

    await conn.end();
})();
