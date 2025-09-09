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
                const [userResult] = await conn.query(
                    `INSERT INTO users (name, email, phone, gender, address, role) VALUES (?, ?, ?, ?, ?, 'user')`,
                    [full_name, email, phone_number, gender, address]
                );
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

// API lấy danh sách các booking của người dùng hiện tại
exports.getMyBookings = async (req, res) => {
    try {
        // Lấy userId từ thông tin người dùng đã xác thực (gắn vào req qua middleware)
        const userId = req.user?.id;

        // Nếu không có userId => chưa đăng nhập hoặc token không hợp lệ
        if (!userId) return res.status(401).json({success: false, error: "Unauthorized"});

        // Truy vấn danh sách booking của user từ database
        const [rows] = await pool.query(
            `SELECT 
                b.id AS booking_id,                    -- ID của booking
                b.status,                              -- Trạng thái booking (đã thanh toán, đang xử lý, v.v.)
                b.departure_date,                      -- Ngày khởi hành
                b.total_price,                         -- Tổng giá tiền

                -- Lấy order_id của lần thanh toán gần nhất cho booking này
                (
                    SELECT order_id 
                    FROM payments p
                    WHERE p.booking_id = b.id
                    ORDER BY p.paid_at DESC, p.id DESC
                    LIMIT 1
                ) AS order_id,

                -- Thông tin tour liên quan đến booking
                t.id AS tour_id,
                t.title,
                t.num_day,
                t.num_night,

                -- Tên địa điểm của tour
                l.name AS location_name,

                -- Lấy ảnh đầu tiên của tour để hiển thị
                (
                    SELECT ti.image_url 
                    FROM tours_images ti 
                    WHERE ti.tour_id = t.id 
                    ORDER BY ti.id ASC 
                    LIMIT 1
                ) AS image_url

            FROM bookings b
            JOIN tours t ON b.tour_id = t.id              -- Ghép bảng tours để lấy thông tin tour
            LEFT JOIN locations l ON t.location_id = l.id -- Ghép bảng locations để lấy tên địa điểm
            WHERE b.user_id = ?                           -- Chỉ lấy booking của user hiện tại
            ORDER BY b.id DESC`, // Sắp xếp theo booking mới nhất
            [userId]
        );

        // Định dạng lại dữ liệu trả về cho frontend
        const data = rows.map((r) => ({
            booking_id: r.booking_id,
            status: r.status,
            departure_date: r.departure_date,
            total_price: r.total_price,
            order_id: r.order_id,
            tour: {
                id: r.tour_id,
                title: r.title,
                num_day: r.num_day,
                num_night: r.num_night,
                location_name: r.location_name,
                image_url: r.image_url,
            },
        }));

        // Trả dữ liệu về cho client
        res.json({success: true, data});
    } catch (error) {
        // Nếu có lỗi trong quá trình xử lý, log ra và trả lỗi về client
        console.error("Error in getMyBookings:", error);
        res.status(500).json({success: false, error: error.message});
    }
};

// API xóa booking của chính người dùng
exports.deleteMyBooking = async (req, res) => {
    // Lấy userId từ token đã xác thực (gắn vào req.user bởi middleware)
    const userId = req.user?.id;

    // Lấy bookingId từ URL (ví dụ: /me/123 → bookingId = 123)
    const bookingId = req.params.id;

    // Nếu chưa đăng nhập hoặc token không hợp lệ → từ chối truy cập
    if (!userId) return res.status(401).json({success: false, error: "Unauthorized"});

    // Mở kết nối đến database
    const conn = await pool.getConnection();
    try {
        // Bắt đầu transaction để đảm bảo tính toàn vẹn khi xóa
        await conn.beginTransaction();

        // Kiểm tra xem booking có tồn tại và thuộc về user hiện tại không
        const [rows] = await conn.query(`SELECT id FROM bookings WHERE id = ? AND user_id = ? LIMIT 1`, [bookingId, userId]);

        // Nếu không tìm thấy booking → rollback và trả lỗi
        if (rows.length === 0) {
            await conn.rollback();
            return res.status(404).json({success: false, error: "Booking not found"});
        }

        // Xóa các dòng trong bảng booking_details trước (tránh lỗi ràng buộc FK)
        await conn.query(`DELETE FROM booking_details WHERE booking_id = ?`, [bookingId]);

        // Sau đó xóa booking chính
        await conn.query(`DELETE FROM bookings WHERE id = ? AND user_id = ?`, [bookingId, userId]);

        // Nếu mọi thứ ổn → commit transaction
        await conn.commit();

        // Trả kết quả thành công về client
        return res.json({success: true});
    } catch (error) {
        // Nếu có lỗi trong quá trình xử lý → rollback và trả lỗi
        await conn.rollback();
        console.error("Error in deleteMyBooking:", error);
        return res.status(500).json({success: false, error: error.message});
    } finally {
        // Giải phóng kết nối DB sau khi xử lý xong
        conn.release();
    }
};
