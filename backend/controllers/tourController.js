const db = require("../config/db");

exports.getAllTours = async (req, res) => {
    const {regionId, subregionId, locationId} = req.query;

    let query = `
        SELECT t.*, l.name AS location_name,  
        (
            SELECT ti.image_url 
            FROM tours_images ti 
            WHERE ti.tour_id = t.id 
            ORDER BY ti.is_featured DESC, ti.id ASC 
            LIMIT 1
        ) AS image_url
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

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    try {
        const [rows] = await db.query(query, values);
        res.json(rows);
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
                l.name AS location_name
            FROM tours t
            JOIN locations l ON t.location_id = l.id
            WHERE t.id = ?
        `,
            [id]
        );
        if (tourRows.length === 0) return res.status(404).json({message: "Không tìm thấy tour"});

        const tour = tourRows[0];

        // Lấy danh sách hình ảnh tour
        const [imageRows] = await db.query("SELECT image_url, is_featured FROM tours_images WHERE tour_id = ?", [id]);

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
                seat_status,
            };
        });

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Lỗi server khi lấy lịch khởi hành"});
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
        const [schedules] = await db.query("SELECT day_text, title, content FROM tour_schedules WHERE tour_id = ? ORDER BY id ASC", [tourId]);

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
        const [rows] = await db.query("SELECT included, excluded, surcharge, cancel_policy AS cancelPolicy, notes, guide_info AS guideInfo FROM tour_terms WHERE tour_id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({message: "Không tìm thấy thông tin điều khoản cho tour này"});
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("Lỗi khi lấy terms:", err);
        res.status(500).json({message: "Lỗi khi lấy thông tin điều khoản"});
    }
};
