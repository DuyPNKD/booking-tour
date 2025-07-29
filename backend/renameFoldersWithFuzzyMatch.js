const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const stringSimilarity = require("string-similarity");

const IMAGE_ROOT = path.join(__dirname, "public", "uploads", "images");

async function renameFoldersWithFuzzyMatch() {
    const conn = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "123456",
        database: "booking_tour",
    });

    const [tours] = await conn.query("SELECT slug FROM tours");
    const slugList = tours.map((t) => t.slug).filter((slug) => typeof slug === "string" && slug.trim() !== "");

    const folders = fs.readdirSync(IMAGE_ROOT);

    for (const folder of folders) {
        const folderPath = path.join(IMAGE_ROOT, folder);
        if (!fs.statSync(folderPath).isDirectory()) continue;

        // Nếu folder đã đúng rồi thì bỏ qua
        if (slugList.includes(folder)) {
            console.log(`✅ Đúng rồi: ${folder}`);
            continue;
        }

        // So khớp gần đúng
        const {bestMatch} = stringSimilarity.findBestMatch(folder, slugList);
        const bestSlug = bestMatch.target;
        const score = bestMatch.rating;

        if (score >= 0.45) {
            const newPath = path.join(IMAGE_ROOT, bestSlug);
            if (!fs.existsSync(newPath)) {
                fs.renameSync(folderPath, newPath);
                console.log(`🔁 Fuzzy rename: ${folder} → ${bestSlug} (score: ${Math.round(score * 100)}%)`);
            } else {
                console.warn(`⚠️ Bỏ qua (đã tồn tại): ${bestSlug}`);
            }
        } else {
            console.warn(`❌ Không tìm được slug gần đúng cho: ${folder} (max match ${Math.round(score * 100)}%)`);
        }
    }

    await conn.end();
    console.log("🎉 Fuzzy rename hoàn tất!");
}

renameFoldersWithFuzzyMatch().catch((err) => console.error("❌ Lỗi:", err));
