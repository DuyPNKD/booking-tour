const mysql = require("mysql2/promise");
const slugify = require("slugify");

function removeVietnameseTones(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // xóa dấu
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}

async function addSlugToTours() {
    const conn = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "123456",
        database: "booking_tour",
    });

    const [tours] = await conn.query("SELECT id, title AS name FROM tours WHERE slug IS NULL OR slug = ''");

    for (const tour of tours) {
        if (!tour.name) {
            console.warn(`⚠️ Tour ID ${tour.id} không có tiêu đề`);
            continue;
        }

        const nameNoTone = removeVietnameseTones(tour.name);
        let baseSlug = slugify(nameNoTone, {lower: true, strict: true});
        let slug = baseSlug;
        let count = 1;

        // Kiểm tra trùng slug
        while (true) {
            const [rows] = await conn.execute("SELECT id FROM tours WHERE slug = ? AND id != ?", [slug, tour.id]);

            if (rows.length === 0) break; // không trùng → thoát

            slug = `${baseSlug}-${count}`;
            count++;
        }

        await conn.execute("UPDATE tours SET slug = ? WHERE id = ?", [slug, tour.id]);
        console.log(`✅ Tour ID ${tour.id} - Slug: ${slug}`);
    }

    await conn.end();
    console.log("🎉 Đã thêm slug cho tất cả tour!");
}

addSlugToTours().catch((err) => console.error("❌ Lỗi:", err));
