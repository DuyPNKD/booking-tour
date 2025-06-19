const db = require("../config/db");

exports.createBooking = async (req, res) => {
    const {user_id, tour_id, departure_date, guests} = req.body;
    try {
        // Lấy giá để tính total
        const [[tour]] = await db.query("SELECT price FROM tours WHERE id = ?", [tour_id]);
        if (!tour) return res.status(404).json({message: "Tour không tồn tại"});

        const total_price = tour.price * guests;

        await db.query(
            `INSERT INTO bookings (user_id, tour_id, booking_date, departure_date, guests, total_price)
       VALUES (?, ?, NOW(), ?, ?, ?)`,
            [user_id, tour_id, departure_date, guests, total_price]
        );

        res.status(201).json({message: "Đặt tour thành công"});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi khi đặt tour"});
    }
};
