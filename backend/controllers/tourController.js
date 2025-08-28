const db = require("../config/db");
const dayjs = require("dayjs");
exports.getAllTours = async (req, res) => {
    const {regionId, subregionId, locationId, page = 1, limit = 10, orderBy = "t.id", orderDir = "ASC"} = req.query;

    //Tính offset
    // page: trang hiện tại, limit: số lượng tour mỗi trang
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const offset = (parsedPage - 1) * parsedLimit;

    let baseQuery = `
        FROM tours t
        LEFT JOIN locations l ON t.location_id = l.id
        LEFT JOIN subregions sr ON l.subregion_id = sr.id
        LEFT JOIN regions r ON sr.region_id = r.id
    `;

    const conditions = [];
    const values = [];

    if (regionId) {
        conditions.push("r.id = ?");
        values.push(regionId);
    }
    if (subregionId) {
        conditions.push("sr.id = ?");
        values.push(subregionId);
    }
    if (locationId) {
        conditions.push("l.id = ?");
        values.push(locationId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    try {
        // 1. Lấy tổng số tour phù hợp
        const [[{totalItems}]] = await db.query(`SELECT COUNT(*) as totalItems ${baseQuery} ${whereClause}`, values);

        // 2. Lấy dữ liệu tour phân trang
        const [data] = await db.query(
            `
            SELECT 
                t.id,
                t.title,
                t.price,
                t.old_price,
                t.rating,
                t.rating_count,
                t.num_day,
                t.num_night,
                l.name AS location_name,
                (
                    SELECT ti.image_url 
                    FROM tours_images ti 
                    WHERE ti.tour_id = t.id 
                    ORDER BY ti.id ASC 
                    LIMIT 1
                ) AS image_url,
                (
                    SELECT DATE_FORMAT(MIN(td.departure_date), '%d-%m-%Y')
                    FROM tour_departures td
                    WHERE td.tour_id = t.id
                ) AS departure_date
            ${baseQuery}
            ${whereClause}
            ORDER BY ${orderBy} ${orderDir.toUpperCase() === "DESC" ? "DESC" : "ASC"}
            LIMIT ? OFFSET ?
            `,
            [...values, parsedLimit, offset]
        );

        // 3. Tính totalPages
        const totalPages = Math.ceil(totalItems / parsedLimit);
        // 4. Trả về kết quả
        res.json({
            result: data,
            pagination: {
                totalItems,
                totalItemsPerPage: parsedLimit,
                currentPage: parsedPage,
                totalPages,
            },
        });
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tour:", error);
        res.status(500).json({message: "Lỗi server"});
    }
};

exports.getTourById = async (req, res) => {
    const {id} = req.params;
    try {
        // Lấy thông tin tour
        const [tourRows] = await db.query(
            `
            SELECT 
                t.*, 
                l.name AS location_name, 
                (
                    SELECT DATE_FORMAT(MIN(td.departure_date), '%d-%m-%Y')
                    FROM tour_departures td
                    WHERE td.tour_id = t.id
                ) AS departure_date
            FROM tours t
            JOIN locations l ON t.location_id = l.id
            WHERE t.id = ?
        `,
            [id]
        );
        if (tourRows.length === 0) return res.status(404).json({message: "Không tìm thấy tour"});

        const tour = tourRows[0];

        // Lấy danh sách hình ảnh tour
        const [imageRows] = await db.query("SELECT image_url FROM tours_images WHERE tour_id = ?", [id]);

        // Gắn danh sách ảnh vào tour
        tour.images = imageRows;

        res.json(tour);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi server"});
    }
};

exports.getTourDepartures = async (req, res) => {
    const tourId = req.params.id;
    try {
        const [rows] = await db.query(
            `SELECT id, departure_date, return_date, available_seats, price
            FROM tour_departures 
            WHERE tour_id = ? 
            ORDER BY departure_date`,
            [tourId]
        );

        const formatDate = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };
        // 👉 Xử lý định dạng tình trạng chỗ
        const data = rows.map((row) => {
            let seat_status;
            if (row.available_seats === null) {
                seat_status = "Liên hệ";
            } else if (row.available_seats === 0) {
                seat_status = "Hết chỗ";
            } else {
                seat_status = `Còn ${row.available_seats} chỗ`;
            }

            return {
                ...row,
                departure_date: formatDate(new Date(row.departure_date)),
                return_date: formatDate(new Date(row.return_date)),
                seat_status,
            };
        });

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Lỗi server khi lấy lịch khởi hành"});
    }
};

exports.getDepartureDates = async (req, res) => {
    const {id} = req.params;
    try {
        const [rows] = await db.query(`SELECT departure_date FROM tour_departures WHERE tour_id = ? ORDER BY departure_date ASC`, [id]);

        const formatDate = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        const dates = rows.map((row) => formatDate(row.departure_date));

        res.json(dates);
    } catch (error) {
        console.error("Lỗi khi lấy departure_date:", error);
        res.status(500).json({message: "Lỗi server"});
    }
};

exports.getTourOverview = async (req, res) => {
    const tourId = req.params.id;
    try {
        const [[overview]] = await db.query("SELECT content FROM tour_overviews WHERE tour_id = ?", [tourId]);

        if (!overview) {
            return res.status(404).json({error: "Không tìm thấy phần giới thiệu"});
        }

        res.json(overview);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Lỗi server khi lấy overview"});
    }
};

exports.getTourSchedules = async (req, res) => {
    const tourId = req.params.id;
    try {
        const [schedules] = await db.query("SELECT day_text, content FROM tour_schedules WHERE tour_id = ? ORDER BY id ASC", [tourId]);

        res.json(schedules);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Lỗi khi lấy lịch trình tour"});
    }
};

exports.getTourPrices = async (req, res) => {
    const tourId = req.params.id;
    try {
        const [prices] = await db.query("SELECT target_type, min_age, max_age, price FROM tour_prices WHERE tour_id = ?", [tourId]);

        res.json(prices);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Lỗi khi lấy giá tour"});
    }
};

exports.getTourReviews = async (req, res) => {
    const {id} = req.params;
    try {
        const [rows] = await db.query("SELECT name, rating, comment FROM tour_reviews WHERE tour_id = ?", [id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi khi lấy đánh giá"});
    }
};

exports.getTourTerms = async (req, res) => {
    const {id} = req.params;

    try {
        const [rows] = await db.query("SELECT section_title, content FROM tour_terms WHERE tour_id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({message: "Không tìm thấy thông tin điều khoản cho tour này"});
        }

        res.json(rows);
    } catch (err) {
        console.error("Lỗi khi lấy terms:", err);
        res.status(500).json({message: "Lỗi khi lấy thông tin điều khoản"});
    }
};

// ✅ API Lấy danh sách departure_city unique
exports.getDepartureCities = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT DISTINCT departure_city 
            FROM tour_departures 
            WHERE departure_city IS NOT NULL 
            ORDER BY departure_city ASC
        `);
        res.json(rows.map((r) => r.departure_city));
    } catch (error) {
        console.error("❌ Lỗi khi lấy departure cities:", error);
        res.status(500).json({error: "Lỗi server"});
    }
};

// ✅ API suggest (autocomplete)
exports.getSuggestTours = async (req, res) => {
    let {q} = req.query;

    if (!q || q.length < 2) return res.json([]);

    try {
        q = q.trim();

        const [rows] = await db.query(
            `
            SELECT id, title, slug
            FROM tours
            WHERE title LIKE ? COLLATE utf8mb4_general_ci
            LIMIT 10
            `,
            [`%${q}%`]
        );

        res.json(rows);
    } catch (error) {
        console.error("❌ Lỗi khi suggest tour:", error);
        res.status(500).json({error: "Lỗi server"});
    }
};

// ✅ API search
exports.getSearchTours = async (req, res) => {
    const {destination, startDate, departure, page = 1, limit = 10} = req.query;

    try {
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        const offset = (parsedPage - 1) * parsedLimit;

        const whereClauses = [];
        const params = [];

        if (destination) {
            whereClauses.push("t.title LIKE ?");
            params.push(`%${destination}%`);
        }
        if (startDate) {
            whereClauses.push("td.departure_date >= ?");
            params.push(startDate);
        }
        if (departure) {
            whereClauses.push("td.departure_city LIKE ?");
            params.push(`%${departure}%`);
        }

        const where = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

        // 1. Tổng số bản ghi
        const [countRows] = await db.query(
            `SELECT COUNT(*) as totalItems
             FROM tours t
             JOIN tour_departures td ON t.id = td.tour_id
             ${where}`,
            params
        );
        const totalItems = countRows[0].totalItems;

        // 2. Dữ liệu chính
        const [rows] = await db.query(
            `SELECT t.id, t.title, t.slug, t.num_day, t.num_night,
                    t.price, t.old_price, t.rating, t.rating_count,
                    td.departure_city, td.departure_date, td.return_date, td.price as departure_price,
                    l.name as location_name,
                    (SELECT image_url FROM tours_images ti WHERE ti.tour_id = t.id ORDER BY ti.id ASC LIMIT 1) AS image_url
             FROM tours t
             JOIN tour_departures td ON t.id = td.tour_id
             JOIN locations l ON t.location_id = l.id
             ${where}
             ORDER BY td.departure_date ASC
             LIMIT ? OFFSET ?`,
            [...params, parsedLimit, offset]
        );

        const data = rows.map((r) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            num_day: r.num_day,
            num_night: r.num_night,
            price: r.price,
            old_price: r.old_price,
            rating: r.rating,
            rating_count: r.rating_count,
            image_url: r.image_url || null,
            departure_city: r.departure_city,
            departure_date: dayjs(r.departure_date).format("DD-MM-YYYY"),
            return_date: dayjs(r.return_date).format("DD-MM-YYYY"),
        }));

        // 3. Tính totalPages
        const totalPages = Math.ceil(totalItems / parsedLimit);

        // 4. Trả về kết quả
        res.json({
            result: data,
            pagination: {
                totalItems,
                totalItemsPerPage: parsedLimit,
                currentPage: parsedPage,
                totalPages,
            },
        });
    } catch (error) {
        console.error("❌ Lỗi khi search tours:", error);
        res.status(500).json({error: "Lỗi server"});
    }
};
