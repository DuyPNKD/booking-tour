const db = require("../config/db");
const pool = require("../config/db"); // file kết nối MySQL của bạn

exports.createBooking = async (req, res) => {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
        const {tour_id, gender, full_name, phone_number, email, address, note, departure_date, total_price, details} = req.body;

        let userId = null;

        // 1. Xác định user_id
        if (req.user && req.user.id) {
            // Người dùng đã đăng nhập
            userId = req.user.id;
        } else {
            // Người dùng chưa đăng nhập → kiểm tra email đã tồn tại chưa
            const [existingUser] = await conn.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email]);

            if (existingUser.length > 0) {
                userId = existingUser[0].id;
            } else {
                // Tạo tài khoản mới (guest)
                const [userResult] = await conn.query(`INSERT INTO users (name, email, phone, gender, address, role) VALUES (?, ?, ?, ?, ?, 'user')`, [full_name, email, phone_number, gender, address]);
                userId = userResult.insertId;
            }
        }

        // 2. Insert vào bookings
        const [result] = await conn.query(
            `INSERT INTO bookings 
            (user_id, tour_id, departure_date, total_price, note)
            VALUES (?, ?, ?, ?, ?)`,
            [userId, tour_id, departure_date, total_price, note]
        );

        const bookingId = result.insertId;

        // 3. Insert booking_details nếu có
        if (details && details.length > 0) {
            const values = details.map((d) => [bookingId, d.target_type, d.quantity]);
            await conn.query(`INSERT INTO booking_details (booking_id, target_type, quantity) VALUES ?`, [values]);
        }

        await conn.commit();

        res.status(201).json({
            success: true,
            bookingId,
            message: "Booking created successfully",
        });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({success: false, error: error.message});
    } finally {
        conn.release();
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const bookingId = req.params.id;

        // 1. Lấy thông tin booking + tour + user
        const [bookings] = await pool.query(
            `SELECT b.*, 
                    t.title AS tour_name, 
                    t.num_day, 
                    t.num_night, 
                    l.name AS location_name,
                    u.name AS customer_name,
                    u.email AS customer_email,
                    u.phone AS customer_phone,
                    u.address AS customer_address
            FROM bookings b
            JOIN tours t ON b.tour_id = t.id
            JOIN locations l ON t.location_id = l.id
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.id = ?`,
            [bookingId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({success: false, error: "Booking not found"});
        }

        const booking = bookings[0];

        // 2. Lấy giá tour theo từng loại
        const [prices] = await pool.query(
            `SELECT target_type, price 
             FROM tour_prices 
             WHERE tour_id = ?`,
            [booking.tour_id]
        );

        const priceMap = {};
        prices.forEach((p) => {
            priceMap[p.target_type] = p.price;
        });

        booking.price_adult = priceMap.adult || 0;
        booking.price_child = priceMap.child || 0;
        booking.price_infant = priceMap.infant || 0;

        // 3. Lấy booking details
        const [details] = await pool.query(
            `SELECT target_type, quantity 
             FROM booking_details 
             WHERE booking_id = ?`,
            [bookingId]
        );

        // 4. Tính tổng tiền từ booking_details
        let totalPrice = 0;
        details.forEach((detail) => {
            const unitPrice = priceMap[detail.target_type] || 0;
            totalPrice += unitPrice * detail.quantity;
        });

        booking.total_price = totalPrice;

        // 5. Trả dữ liệu
        res.json({
            success: true,
            booking,
            details,
        });
    } catch (error) {
        console.error("Error in getBookingById:", error);
        res.status(500).json({success: false, error: error.message});
    }
};
