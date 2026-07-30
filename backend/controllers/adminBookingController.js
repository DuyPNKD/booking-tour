const db = require("../config/db");

// List all bookings
exports.listBookings = async (req, res) => {
    try {
        const {status, q} = req.query || {};
        let queryStr = `
            SELECT b.*, 
                   t.title AS tour_name,
                   u.name AS full_name,
                   u.phone AS phone_number,
                   u.email AS email,
                   u.address AS address,
                   u.gender AS gender
            FROM bookings b
            JOIN tours t ON b.tour_id = t.id
            LEFT JOIN users u ON b.user_id = u.id
        `;
        const params = [];
        const conditions = [];

        if (status && status !== "All") {
            conditions.push("b.status = ?");
            params.push(status.toLowerCase());
        }

        if (q && q.trim()) {
            conditions.push("(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR CAST(b.id AS CHAR) LIKE ? OR t.title LIKE ?)");
            const wild = `%${q.trim()}%`;
            params.push(wild, wild, wild, wild, wild);
        }

        if (conditions.length > 0) {
            queryStr += " WHERE " + conditions.join(" AND ");
        }

        queryStr += " ORDER BY b.id DESC";

        const [rows] = await db.query(queryStr, params);
        res.json({success: true, data: rows});
    } catch (error) {
        console.error("Error in listBookings:", error);
        res.status(500).json({success: false, message: "Lỗi máy chủ khi lấy danh sách đơn hàng"});
    }
};

// Get booking details
exports.getBookingDetail = async (req, res) => {
    try {
        const {id} = req.params;
        const [bookings] = await db.query(`
            SELECT b.*, 
                   t.title AS tour_name, 
                   t.num_day, 
                   t.num_night,
                   u.name AS full_name,
                   u.phone AS phone_number,
                   u.email AS email,
                   u.address AS address,
                   u.gender AS gender
            FROM bookings b
            JOIN tours t ON b.tour_id = t.id
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.id = ?
            LIMIT 1
        `, [id]);

        if (bookings.length === 0) {
            return res.status(404).json({success: false, message: "Không tìm thấy đơn hàng"});
        }

        const booking = bookings[0];

        // Lấy chi tiết số lượng khách theo độ tuổi (nếu có)
        const [details] = await db.query(`
            SELECT target_type, quantity 
            FROM booking_details 
            WHERE booking_id = ?
        `, [id]);

        res.json({success: true, data: {booking, details}});
    } catch (error) {
        console.error("Error in getBookingDetail:", error);
        res.status(500).json({success: false, message: "Lỗi máy chủ khi lấy chi tiết đơn hàng"});
    }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const {id} = req.params;
        const {status} = req.body;

        if (!["pending", "confirmed", "cancelled"].includes(status)) {
            return res.status(400).json({success: false, message: "Trạng thái không hợp lệ"});
        }

        const [result] = await db.query(`
            UPDATE bookings 
            SET status = ? 
            WHERE id = ?
        `, [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, message: "Không tìm thấy đơn hàng để cập nhật"});
        }

        res.json({success: true, message: "Cập nhật trạng thái đơn hàng thành công"});
    } catch (error) {
        console.error("Error in updateBookingStatus:", error);
        res.status(500).json({success: false, message: "Lỗi máy chủ khi cập nhật đơn hàng"});
    }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const {id} = req.params;
        await conn.beginTransaction();

        // Xóa chi tiết đơn hàng trước
        await conn.query(`DELETE FROM booking_details WHERE booking_id = ?`, [id]);
        
        // Xóa đơn hàng chính
        const [result] = await conn.query(`DELETE FROM bookings WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({success: false, message: "Không tìm thấy đơn hàng để xóa"});
        }

        await conn.commit();
        res.json({success: true, message: "Đã xóa đơn hàng thành công"});
    } catch (error) {
        await conn.rollback();
        console.error("Error in deleteBooking:", error);
        res.status(500).json({success: false, message: "Lỗi máy chủ khi xóa đơn hàng"});
    } finally {
        conn.release();
    }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Tours count
        const [[{toursCount}]] = await db.query("SELECT COUNT(*) AS toursCount FROM tours");
        
        // 2. Bookings count
        const [[{bookingsCount}]] = await db.query("SELECT COUNT(*) AS bookingsCount FROM bookings");

        // 3. Users count
        const [[{usersCount}]] = await db.query("SELECT COUNT(*) AS usersCount FROM users WHERE role = 'user'");

        // 4. Total revenue
        const [[{totalRevenue}]] = await db.query("SELECT COALESCE(SUM(total_price), 0) AS totalRevenue FROM bookings WHERE status = 'confirmed'");

        // 5. Recent bookings
        const [recentBookings] = await db.query(`
            SELECT b.*, t.title AS tour_name, u.name AS customer_name 
            FROM bookings b
            JOIN tours t ON b.tour_id = t.id
            LEFT JOIN users u ON b.user_id = u.id
            ORDER BY b.id DESC 
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                toursCount,
                bookingsCount,
                usersCount,
                totalRevenue,
                recentBookings
            }
        });
    } catch (error) {
        console.error("Error in getDashboardStats:", error);
        res.status(500).json({success: false, message: "Lỗi máy chủ khi lấy thống kê dashboard"});
    }
};
