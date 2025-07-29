const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const FOLDER_PATH = "E:/du_lieu_tour/images2/mai_chau"; // sửa nếu khác
const OUTPUT_FILE = "E:/du_lieu_tour/insert_mai_chau.sql";
const BASE_URL = "http://localhost:3000/uploads/images"; // sửa nếu khác

async function generateSQL() {
    const conn = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "123456",
        database: "booking_tour",
    });

    const folders = fs.readdirSync(FOLDER_PATH);
    const insertData = [];

    for (const slug of folders) {
        const folderPath = path.join(FOLDER_PATH, slug);
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const [rows] = await conn.execute("SELECT id FROM tours WHERE slug = ?", [slug]);
        if (rows.length === 0) {
            console.warn(`❌ Không tìm thấy slug trong DB: ${slug}`);
            continue;
        }

        const tourId = rows[0].id;
        const files = fs.readdirSync(folderPath).filter((f) => f.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/));

        if (files.length === 0) {
            console.warn(`⚠️ Không có ảnh trong folder: ${slug}`);
            continue;
        }

        const inserts = files.map((file) => {
            const imageUrl = `${BASE_URL}/${slug}/${file}`;
            return {tourId, slug, imageUrl};
        });

        insertData.push({tourId, slug, inserts});
    }

    await conn.end();

    // Sắp xếp theo tourId
    insertData.sort((a, b) => a.tourId - b.tourId);

    let output = "";
    for (const tour of insertData) {
        output += `-- TOUR ${tour.tourId} - ${tour.slug}\n`;
        for (const entry of tour.inserts) {
            output += `INSERT INTO tours_images (tour_id, image_url) VALUES (${tour.tourId}, '${entry.imageUrl}');\n`;
        }
        output += "\n";
    }

    fs.writeFileSync(OUTPUT_FILE, output, "utf8");
    console.log(`✅ Đã xuất file (sắp xếp theo id): ${OUTPUT_FILE}`);
}

generateSQL().catch((err) => console.error("❌ Lỗi:", err));
