const db = require("../config/db");

/**
 * Admin Tour Controller
 * Chứa các handler liên quan đến quản lý tour cho khu vực admin
 */

/**
 * Hàm tiện ích: Xây dựng thông tin phân trang
 * @param {Object} query - Query parameters từ request
 * @returns {Object} - Thông tin phân trang {page, limit, offset}
 */
function buildPagination(query) {
    const page = Math.max(1, parseInt(query.page || 1, 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || 10, 10)));
    const offset = (page - 1) * limit;
    return {page, limit, offset};
}

/**
 * Lấy danh sách tours với phân trang và tìm kiếm
 * Route: GET /api/admin/tours
 * Query: { q?, locationId?, page?, limit? }
 * - Hỗ trợ tìm kiếm theo tên tour
 * - Lọc theo location_id
 * - Phân trang với page và limit
 * - Sắp xếp theo ID giảm dần (tour mới nhất trước)
 * Response: 200 + { result: [], pagination: {} }
 */
exports.listTours = async (req, res) => {
    try {
        // Bước 1: Lấy tham số từ query và xây dựng phân trang
        const {q, locationId} = req.query;
        const {page, limit, offset} = buildPagination(req.query);

        // Bước 2: Xây dựng điều kiện WHERE cho tìm kiếm và lọc
        const conditions = [];
        const params = [];
        if (q) {
            conditions.push("t.title LIKE ?");
            params.push(`%${q}%`);
        }
        if (locationId) {
            conditions.push("t.location_id = ?");
            params.push(locationId);
        }
        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        // Bước 3: Đếm tổng số tours để tính phân trang
        const [[{totalItems}]] = await db.query(`SELECT COUNT(*) AS totalItems FROM tours t ${where}`, params);

        // Bước 4: Lấy danh sách tours với phân trang và JOIN với locations
        const [rows] = await db.query(
            `SELECT t.id, t.title, t.price, t.old_price, t.location_id, l.name AS location_name, t.created_at, t.status
             FROM tours t
             LEFT JOIN locations l ON l.id = t.location_id
             ${where}
             ORDER BY t.id DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        // Bước 5: Trả về kết quả với thông tin phân trang
        return res.json({
            result: rows,
            pagination: {
                totalItems,
                totalItemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
            },
        });
    } catch (err) {
        console.error("listTours error", err);
        return res.status(500).json({message: "Server error"});
    }
};

/**
 * Lấy chi tiết tour theo ID
 * Route: GET /api/admin/tours/:id
 * Params: { id }
 * - Lấy thông tin tour chính kèm tên địa điểm
 * - Lấy tất cả dữ liệu liên quan: images, schedules, departures, terms, prices, reviews
 * - Sắp xếp schedules theo day_order và departures theo departure_date
 * Response: 200 + { tour data + related data } hoặc 404 nếu không tìm thấy
 */
exports.getTourDetail = async (req, res) => {
    const {id} = req.params;
    try {
        // Bước 1: Lấy thông tin tour chính kèm tên địa điểm
        const [[tour]] = await db.query(
            `
            SELECT t.*, l.name AS location_name 
            FROM tours t 
            LEFT JOIN locations l ON l.id = t.location_id 
            WHERE t.id = ?
        `,
            [id]
        );

        if (!tour) return res.status(404).json({message: "Not found"});

        // Bước 2: Lấy tất cả dữ liệu liên quan
        // Bước 2.1: Lấy danh sách hình ảnh
        const [images] = await db.query(
            `
            SELECT id, image_url 
            FROM tours_images 
            WHERE tour_id = ? 
            ORDER BY id ASC
        `,
            [id]
        );

        // Bước 2.2: Lấy lịch trình tour
        const [schedules] = await db.query(
            `
            SELECT id, day_text, day_order, content 
            FROM tour_schedules 
            WHERE tour_id = ? 
            ORDER BY day_order ASC, id ASC
        `,
            [id]
        );

        // Bước 2.3: Lấy lịch khởi hành
        const [departures] = await db.query(
            `
            SELECT id, departure_date, return_date, available_seats, price, departure_city 
            FROM tour_departures 
            WHERE tour_id = ? 
            ORDER BY departure_date ASC
        `,
            [id]
        );

        // Bước 2.4: Lấy điều khoản tour
        const [terms] = await db.query(
            `
            SELECT id, section_title, content 
            FROM tour_terms 
            WHERE tour_id = ? 
            ORDER BY id ASC
        `,
            [id]
        );

        // Bước 2.5: Lấy giá theo độ tuổi
        const [prices] = await db.query(
            `
            SELECT id, target_type, min_age, max_age, price, old_price 
            FROM tour_prices 
            WHERE tour_id = ? 
            ORDER BY id ASC
        `,
            [id]
        );

        // Bước 2.6: Lấy đánh giá tour
        const [reviews] = await db.query(
            `
            SELECT id, name, rating, comment, created_at 
            FROM tour_reviews 
            WHERE tour_id = ? 
            ORDER BY id DESC
        `,
            [id]
        );

        // Bước 3: Trả về dữ liệu tổng hợp
        return res.json({
            ...tour,
            images,
            overview: tour.overview || null, // sử dụng trực tiếp từ bảng tours
            schedules,
            departures,
            terms,
            prices,
            reviews,
        });
    } catch (err) {
        console.error("getTourDetail error", err);
        return res.status(500).json({message: "Server error"});
    }
};

/**
 * Tạo tour mới
 * Route: POST /api/admin/tours
 * Body: { title, slug, num_day, num_night, price, old_price, location_id, status, thumbnail_url, images[], overview, schedules[], departures[], terms[], prices[] }
 * - Tạo tour chính với transaction
 * - Insert tất cả dữ liệu liên quan: images, schedules, departures, terms, prices
 * - Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
 * Response: 201 + { id, message } hoặc 500 nếu lỗi
 */
exports.createTour = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Bước 1: Lấy dữ liệu từ request body
        const {
            title,
            slug,
            num_day,
            num_night,
            price,
            old_price,
            location_id,
            status = "active",
            thumbnail_url = null,
            images = [],
            overview,
            schedules = [],
            departures = [],
            terms = [],
            prices: priceRows = [],
        } = req.body || {};

        // Bước 2: Insert tour chính vào bảng tours
        const [result] = await conn.query(
            `INSERT INTO tours (
            title, slug, num_day, num_night, price, old_price, location_id, status, thumbnail_url, overview, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [title, slug, num_day, num_night, price, old_price, location_id, status, thumbnail_url, overview?.content || null]
        );
        const tourId = result.insertId;

        // Bước 3: Insert hình ảnh
        if (Array.isArray(images)) {
            for (const img of images) {
                await conn.query(`INSERT INTO tours_images (tour_id, image_url) VALUES (?, ?)`, [tourId, img.image_url || img]);
            }
        }
        // Bước 4: Insert lịch trình
        if (Array.isArray(schedules)) {
            for (let i = 0; i < schedules.length; i++) {
                const s = schedules[i];
                await conn.query(`INSERT INTO tour_schedules (tour_id, day_text, day_order, content) VALUES (?, ?, ?, ?)`, [
                    tourId,
                    s.day_text,
                    s.day_order !== undefined ? s.day_order : i + 1,
                    s.content,
                ]);
            }
        }
        // Bước 5: Insert lịch khởi hành
        if (Array.isArray(departures)) {
            for (const d of departures) {
                await conn.query(
                    `INSERT INTO tour_departures (tour_id, departure_date, return_date, available_seats, price, departure_city)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [tourId, d.departure_date, d.return_date, d.available_seats, d.price, d.departure_city || null]
                );
            }
        }
        // Bước 6: Insert điều khoản
        if (Array.isArray(terms)) {
            for (const t of terms) {
                await conn.query(`INSERT INTO tour_terms (tour_id, section_title, content) VALUES (?, ?, ?)`, [tourId, t.section_title, t.content]);
            }
        }
        // Bước 7: Insert giá theo độ tuổi
        if (Array.isArray(priceRows)) {
            for (const p of priceRows) {
                await conn.query(`INSERT INTO tour_prices (tour_id, target_type, min_age, max_age, price, old_price) VALUES (?, ?, ?, ?, ?, ?)`, [
                    tourId,
                    p.target_type,
                    p.min_age,
                    p.max_age,
                    p.price,
                    p.old_price || null,
                ]);
            }
        }

        await conn.commit();
        return res.status(201).json({id: tourId, message: "Created"});
    } catch (err) {
        if (conn) await conn.rollback();
        console.error("createTour error", err);
        return res.status(500).json({message: "Server error"});
    } finally {
        if (conn) conn.release();
    }
};

/**
 * Cập nhật tour theo ID
 * Route: PUT /api/admin/tours/:id
 * Params: { id }
 * Body: { title, slug, num_day, num_night, price, old_price, location_id, status, thumbnail_url, images[], overview, schedules[], departures[], terms[], prices[] }
 * - Cập nhật thông tin tour chính
 * - Xóa và tạo lại tất cả dữ liệu liên quan
 * - Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
 * Response: 200 + { message } hoặc 500 nếu lỗi
 */
exports.updateTour = async (req, res) => {
    const conn = await db.getConnection();
    const {id} = req.params;
    try {
        await conn.beginTransaction();

        // Bước 1: Lấy dữ liệu từ request body
        const {
            title,
            slug,
            num_day,
            num_night,
            price,
            old_price,
            location_id,
            status = "active",
            thumbnail_url = null,
            images = [],
            overview = null,
            schedules = [],
            departures = [],
            terms = [],
            prices: priceRows = [],
        } = req.body || {};

        // Bước 2: Cập nhật thông tin tour chính trong bảng tours
        await conn.query(
            `
            UPDATE tours 
            SET title=?, slug=?, num_day=?, num_night=?, price=?, old_price=?, location_id=?, status=?, thumbnail_url=?, overview=? 
            WHERE id=?
        `,
            [title, slug, num_day, num_night, price, old_price, location_id, status, thumbnail_url, overview?.content || overview, id]
        );

        // Bước 3: Xóa tất cả dữ liệu liên quan cũ để thay thế bằng dữ liệu mới
        await conn.query(`DELETE FROM tours_images WHERE tour_id = ?`, [id]);
        await conn.query(`DELETE FROM tour_schedules WHERE tour_id = ?`, [id]);
        await conn.query(`DELETE FROM tour_departures WHERE tour_id = ?`, [id]);
        await conn.query(`DELETE FROM tour_terms WHERE tour_id = ?`, [id]);
        await conn.query(`DELETE FROM tour_prices WHERE tour_id = ?`, [id]);

        // Bước 4: Thêm lại dữ liệu liên quan mới
        if (Array.isArray(images)) {
            for (const img of images) {
                await conn.query(`INSERT INTO tours_images (tour_id, image_url) VALUES (?, ?)`, [id, img.image_url || img]);
            }
        }

        if (Array.isArray(schedules)) {
            for (const s of schedules) {
                await conn.query(`INSERT INTO tour_schedules (tour_id, day_text, day_order, content) VALUES (?, ?, ?, ?)`, [
                    id,
                    s.day_text,
                    s.day_order || null,
                    s.content,
                ]);
            }
        }

        if (Array.isArray(departures)) {
            for (const d of departures) {
                await conn.query(
                    `
                    INSERT INTO tour_departures (tour_id, departure_date, return_date, available_seats, price, departure_city)
                    VALUES (?, ?, ?, ?, ?, ?)
                `,
                    [id, d.departure_date, d.return_date, d.available_seats, d.price, d.departure_city || null]
                );
            }
        }

        if (Array.isArray(terms)) {
            for (const t of terms) {
                await conn.query(`INSERT INTO tour_terms (tour_id, section_title, content) VALUES (?, ?, ?)`, [id, t.section_title, t.content]);
            }
        }

        if (Array.isArray(priceRows)) {
            for (const p of priceRows) {
                await conn.query(`INSERT INTO tour_prices (tour_id, target_type, min_age, max_age, price, old_price) VALUES (?, ?, ?, ?, ?, ?)`, [
                    id,
                    p.target_type,
                    p.min_age,
                    p.max_age,
                    p.price,
                    p.old_price || null,
                ]);
            }
        }

        await conn.commit();
        return res.json({message: "Updated"});
    } catch (err) {
        if (conn) await conn.rollback();
        console.error("updateTour error", err);
        return res.status(500).json({message: "Server error"});
    } finally {
        if (conn) conn.release();
    }
};

/**
 * Xóa tour theo ID
 * Route: DELETE /api/admin/tours/:id
 * Params: { id }
 * - Xóa tất cả dữ liệu liên quan trước (images, schedules, departures, terms, prices, reviews)
 * - Xóa tour chính cuối cùng
 * - Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
 * - CASCADE DELETE sẽ tự động xóa dữ liệu liên quan
 * Response: 200 + { message } hoặc 500 nếu lỗi
 */
exports.deleteTour = async (req, res) => {
    const conn = await db.getConnection();
    const {id} = req.params;
    try {
        await conn.beginTransaction();

        // Bước 1: Xóa tất cả dữ liệu liên quan trước (theo thứ tự để tránh lỗi foreign key)
        await conn.query(`DELETE FROM tours_images WHERE tour_id = ?`, [id]);
        await conn.query(`DELETE FROM tour_schedules WHERE tour_id = ?`, [id]);
        await conn.query(`DELETE FROM tour_departures WHERE tour_id = ?`, [id]);
        await conn.query(`DELETE FROM tour_terms WHERE tour_id = ?`, [id]);
        await conn.query(`DELETE FROM tour_prices WHERE tour_id = ?`, [id]);
        await conn.query(`DELETE FROM tour_reviews WHERE tour_id = ?`, [id]);

        // Bước 2: Xóa tour chính cuối cùng
        await conn.query(`DELETE FROM tours WHERE id = ?`, [id]);

        await conn.commit();
        return res.json({message: "Deleted"});
    } catch (err) {
        if (conn) await conn.rollback();
        console.error("deleteTour error", err);
        return res.status(500).json({message: "Server error"});
    } finally {
        if (conn) conn.release();
    }
};

/**
 * Lấy danh sách tất cả địa điểm
 * Route: GET /api/admin/locations
 * - Lấy danh sách tất cả locations từ database
 * - Sắp xếp theo tên địa điểm (A-Z)
 * - Dùng cho dropdown trong form tạo/sửa tour
 * Response: 200 + [ { id, name } ] hoặc 500 nếu lỗi
 */
exports.listLocations = async (req, res) => {
    try {
        // Bước 1: Lấy danh sách tất cả locations và sắp xếp theo tên (A-Z)
        const [rows] = await db.query(`SELECT id, name FROM locations ORDER BY name ASC`);

        // Bước 2: Trả về danh sách locations
        res.json(rows);
    } catch (err) {
        console.error("listLocations error", err);
        res.status(500).json({message: "Server error"});
    }
};
