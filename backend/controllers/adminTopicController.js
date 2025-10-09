const db = require("../config/db");

// Lấy danh sách chủ đề
exports.listTopics = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM topics ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({message: "Lỗi truy vấn chủ đề", error: err.message});
    }
};

// Thêm chủ đề mới
exports.createTopic = async (req, res) => {
    const {name, slug, status} = req.body;
    if (!name || !slug) return res.status(400).json({message: "Tên và slug là bắt buộc"});
    try {
        const [result] = await db.execute("INSERT INTO topics (name, slug, status) VALUES (?, ?, ?)", [name, slug, status || "active"]);
        const [rows] = await db.execute("SELECT * FROM topics WHERE id = ?", [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            res.status(400).json({message: "Tên hoặc slug đã tồn tại"});
        } else {
            res.status(500).json({message: "Lỗi thêm chủ đề", error: err.message});
        }
    }
};

// Sửa chủ đề
exports.updateTopic = async (req, res) => {
    const id = parseInt(req.params.id);
    const {name, slug, status} = req.body;
    if (!name || !slug) return res.status(400).json({message: "Tên và slug là bắt buộc"});
    try {
        const [result] = await db.execute("UPDATE topics SET name = ?, slug = ?, status = ? WHERE id = ?", [name, slug, status || "active", id]);
        if (result.affectedRows === 0) return res.status(404).json({message: "Không tìm thấy chủ đề"});
        const [rows] = await db.execute("SELECT * FROM topics WHERE id = ?", [id]);
        res.json(rows[0]);
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            res.status(400).json({message: "Tên hoặc slug đã tồn tại"});
        } else {
            res.status(500).json({message: "Lỗi cập nhật chủ đề", error: err.message});
        }
    }
};

// Xóa chủ đề
exports.deleteTopic = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const [result] = await db.execute("DELETE FROM topics WHERE id = ?", [id]);
        if (result.affectedRows === 0) return res.status(404).json({message: "Không tìm thấy chủ đề"});
        res.json({message: "Đã xóa chủ đề"});
    } catch (err) {
        res.status(500).json({message: "Lỗi xóa chủ đề", error: err.message});
    }
};

// Lấy danh sách chủ đề nổi bật
exports.listFeaturedTopics = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM topics WHERE is_featured = 1 ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({message: "Lỗi truy vấn chủ đề nổi bật", error: err.message});
    }
};

// Đánh dấu chủ đề là nổi bật
exports.markAsFeatured = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const [result] = await db.execute("UPDATE topics SET is_featured = 1 WHERE id = ?", [id]);
        if (result.affectedRows === 0) return res.status(404).json({message: "Không tìm thấy chủ đề"});
        const [rows] = await db.execute("SELECT * FROM topics WHERE id = ?", [id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({message: "Lỗi đánh dấu chủ đề nổi bật", error: err.message});
    }
};

// Bỏ đánh dấu chủ đề là nổi bật
exports.unmarkAsFeatured = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const [result] = await db.execute("UPDATE topics SET is_featured = 0 WHERE id = ?", [id]);
        if (result.affectedRows === 0) return res.status(404).json({message: "Không tìm thấy chủ đề"});
        const [rows] = await db.execute("SELECT * FROM topics WHERE id = ?", [id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({message: "Lỗi bỏ đánh dấu chủ đề nổi bật", error: err.message});
    }
};
