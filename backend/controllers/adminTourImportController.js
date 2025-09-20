const db = require("../config/db");
const XLSX = require("xlsx");

/**
 * Admin Tour Import Controller
 * Chứa các handler liên quan đến import tour từ file Excel/CSV cho khu vực admin
 */

/**
 * Hàm tiện ích: Chuyển đổi giá trị thành mảng
 * @param {any} value - Giá trị cần chuyển đổi
 * @returns {Array} - Mảng các chuỗi đã được trim và lọc bỏ giá trị rỗng
 */
function toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    // Tách chuỗi theo ký tự xuống dòng hoặc dấu chấm phẩy
    return String(value)
        .split(/\r?\n|;/)
        .map((s) => s.trim())
        .filter(Boolean);
}

/**
 * Import tours từ file Excel/CSV
 * Route: POST /api/admin/tours/import
 * Body: FormData với file (.xlsx, .xls, .csv)
 * - Đọc file Excel/CSV và parse thành JSON
 * - Xử lý từng hàng dữ liệu, tạo slug tự động
 * - Parse JSON terms thành các bản ghi riêng biệt
 * - Tạo day_order cho schedules theo thứ tự
 * - Insert vào database với transaction để đảm bảo tính toàn vẹn
 * - Trả về kết quả: số tour thành công, thất bại và danh sách lỗi
 * Response: 200 + { success, failed, errors }
 */
exports.importTours = async (req, res) => {
    try {
        // Bước 1: Kiểm tra file upload
        if (!req.file) return res.status(400).json({message: "No file uploaded"});

        // Bước 2: Đọc và parse file Excel/CSV
        const workbook = XLSX.read(req.file.buffer, {type: "buffer"});
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {defval: ""});

        // Bước 3: Khởi tạo biến đếm kết quả
        let success = 0;
        let failed = 0;
        const errors = [];

        // Bước 4: Xử lý từng hàng dữ liệu trong file
        for (let index = 0; index < sheet.length; index++) {
            const row = sheet[index];
            console.log(`Processing row ${index + 2}:`, row);

            // Bước 4.1: Parse dữ liệu cơ bản từ hàng
            const title = (row.title || "").trim();
            const slug = (
                row.slug ||
                title
                    .toLowerCase()
                    // Chuyển đổi dấu tiếng Việt thành ký tự Latin
                    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
                    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
                    .replace(/ì|í|ị|ỉ|ĩ/g, "i")
                    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
                    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
                    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
                    .replace(/đ/g, "d")
                    // Thay thế khoảng trắng bằng dấu gạch ngang
                    .replace(/\s+/g, "-")
                    // Loại bỏ các ký tự đặc biệt không cần thiết
                    .replace(/[^a-z0-9-]/g, "")
                    // Loại bỏ nhiều dấu gạch ngang liên tiếp
                    .replace(/-+/g, "-")
                    // Loại bỏ dấu gạch ngang ở đầu và cuối
                    .replace(/^-+|-+$/g, "")
            ).trim();
            const num_day = Number(row.num_day || 0);
            const num_night = Number(row.num_night || 0);
            const price = Number(row.price || 0);
            const old_price = Number(row.old_price || 0);
            const location_id = Number(row.location_id || 0);

            console.log(`Parsed values - title: "${title}", price: ${price}, location_id: ${location_id}`);

            // Bước 4.2: Kiểm tra dữ liệu bắt buộc
            if (!title || !price || !location_id) {
                failed++;
                const missingFields = [];
                if (!title) missingFields.push("title");
                if (!price) missingFields.push("price");
                if (!location_id) missingFields.push("location_id");
                errors.push({index: index + 2, message: `Missing required fields: ${missingFields.join(", ")}`});
                continue;
            }

            // Bước 4.3: Parse dữ liệu mở rộng
            const overview = (row.overview || "").trim();
            // Tạo schedules với day_order theo thứ tự
            const schedules = toArray(row.schedule).map((s, i) => ({
                day_text: `Ngày ${i + 1}`,
                day_order: i + 1,
                content: s,
            }));
            const departure_city = (row.departure_city || "").trim() || null;
            const departures = [];
            if (row.departure_date) {
                departures.push({
                    departure_date: new Date(row.departure_date),
                    return_date: row.return_date ? new Date(row.return_date) : null,
                    available_seats: row.available_seats !== "" ? Number(row.available_seats) : null,
                    price: price,
                    departure_city,
                });
            }

            // Bước 4.4: Parse terms từ JSON string
            let terms = [];
            if (row.term) {
                console.log(`Processing term: "${row.term}"`);
                try {
                    // Thử parse JSON trước
                    const termJson = JSON.parse(row.term);
                    console.log(`Parsed term JSON:`, termJson);
                    if (typeof termJson === "object" && termJson !== null) {
                        terms = Object.entries(termJson).map(([section_title, content]) => ({
                            section_title: section_title,
                            content: content,
                        }));
                        console.log(`Generated terms:`, terms);
                    }
                } catch (e) {
                    console.log(`JSON parsing failed, using fallback method:`, e.message);
                    // Nếu parse JSON thất bại, dùng phương pháp cũ
                    terms = toArray(row.term).map((t) => ({section_title: "Điều khoản", content: t}));
                }
            }

            // Bước 4.5: Parse giá theo độ tuổi
            const prices = [];
            if (row.price_adult) {
                prices.push({
                    target_type: "adult",
                    min_age: Number(row.min_age_adult || 12),
                    max_age: Number(row.max_age_adult || null),
                    price: Number(row.price_adult),
                });
            }
            if (row.price_child) {
                prices.push({
                    target_type: "child",
                    min_age: Number(row.min_age_child || 2),
                    max_age: Number(row.max_age_child || 11),
                    price: Number(row.price_child),
                });
            }
            if (row.price_infant) {
                prices.push({
                    target_type: "infant",
                    min_age: Number(row.min_age_infant || 0),
                    max_age: Number(row.max_age_infant || 1),
                    price: Number(row.price_infant),
                });
            }

            // Bước 4.6: Insert dữ liệu vào database với transaction
            const conn = await db.getConnection();
            try {
                await conn.beginTransaction();

                // Bước 4.6.1: Insert tour chính
                const [r] = await conn.query(
                    `INSERT INTO tours (title, slug, num_day, num_night, price, old_price, location_id, overview, status, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
                    [title, slug, num_day, num_night, price, old_price, location_id, overview || null]
                );
                const tourId = r.insertId;

                // Bước 4.6.2: Insert lịch trình với day_order
                for (const s of schedules) {
                    await conn.query(`INSERT INTO tour_schedules (tour_id, day_text, day_order, content) VALUES (?, ?, ?, ?)`, [
                        tourId,
                        s.day_text,
                        s.day_order,
                        s.content,
                    ]);
                }

                // Bước 4.6.3: Insert lịch khởi hành
                for (const d of departures) {
                    await conn.query(
                        `INSERT INTO tour_departures (tour_id, departure_date, return_date, available_seats, price, departure_city)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [tourId, d.departure_date, d.return_date, d.available_seats, d.price, d.departure_city]
                    );
                }

                // Bước 4.6.4: Insert điều khoản
                for (const t of terms) {
                    await conn.query(`INSERT INTO tour_terms (tour_id, section_title, content) VALUES (?, ?, ?)`, [
                        tourId,
                        t.section_title,
                        t.content,
                    ]);
                }

                // Bước 4.6.5: Insert giá theo độ tuổi
                for (const p of prices) {
                    await conn.query(`INSERT INTO tour_prices (tour_id, target_type, min_age, max_age, price) VALUES (?, ?, ?, ?, ?)`, [
                        tourId,
                        p.target_type,
                        p.min_age,
                        p.max_age,
                        p.price,
                    ]);
                }

                await conn.commit();
                success++;
            } catch (e) {
                await conn.rollback();
                failed++;
                console.error(`Error importing tour at row ${index + 2}:`, e.message);
                errors.push({index: index + 2, message: e.message});
            } finally {
                conn.release();
            }
        }

        // Bước 5: Trả về kết quả import
        return res.json({success, failed, errors});
    } catch (err) {
        console.error("importTours error", err);
        return res.status(500).json({message: "Server error"});
    }
};
