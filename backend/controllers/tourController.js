const db = require("../config/db");

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
