const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const stringSimilarity = require("string-similarity");

const FOLDER_PATH = "E:/du_lieu_tour/images2/dien-bien";
const LOCATION_ID = 21;

async function renameFoldersBySlug() {
    const conn = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "123456",
        database: "booking_tour",
    });

    // Lấy slug từ DB
    const [rows] = await conn.query("SELECT slug FROM tours WHERE location_id = ?", [LOCATION_ID]);
    await conn.end();

    const validSlugs = rows.map((r) => r.slug).filter(Boolean);
    const slugSet = new Set(validSlugs);
    const folders = fs.readdirSync(FOLDER_PATH);

    for (const folder of folders) {
        const folderPath = path.join(FOLDER_PATH, folder);
        if (!fs.statSync(folderPath).isDirectory()) continue;

        if (slugSet.has(folder)) {
            console.log(`✅ Đã đúng slug: ${folder}`);
            continue;
        }

        // Lọc các slug có số từ gần giống (±2 từ)
        const folderWords = folder.split("-").length;
        const filteredSlugs = validSlugs.filter((s) => {
            const words = s.split("-").length;
            return Math.abs(words - folderWords) <= 2;
        });

        // Nếu không còn gì để so sánh thì bỏ qua
        if (filteredSlugs.length === 0) {
            console.warn(`⚠️ Không có slug nào gần giống số từ với: ${folder}`);
            continue;
        }

        // So sánh với nhóm đã lọc
        const {bestMatch} = stringSimilarity.findBestMatch(folder, filteredSlugs);
        const bestSlug = bestMatch.target;
        const score = bestMatch.rating;

        console.log(`📂 So sánh: ${folder} ↔ ${bestSlug} (score: ${(score * 100).toFixed(1)}%)`);

        if (score >= 0.9) {
            const newPath = path.join(FOLDER_PATH, bestSlug);
            if (!fs.existsSync(newPath)) {
                fs.renameSync(folderPath, newPath);
                console.log(`🔁 Đổi tên: ${folder} → ${bestSlug}`);
            } else {
                console.warn(`⚠️ Trùng tên slug đã tồn tại: ${bestSlug} → Bỏ qua`);
            }
        } else {
            console.warn(`❌ Không đủ tương đồng → Bỏ qua`);
        }
    }

    console.log("🎉 Hoàn tất đổi tên!");
}

renameFoldersBySlug().catch((err) => console.error("❌ Lỗi:", err));
