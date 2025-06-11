const db = require("../config/db");

exports.getAllTours = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM tours");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi server"});
    }
};
