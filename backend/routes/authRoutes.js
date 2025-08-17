const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

const router = express.Router();

router.get("/ping", (req, res) => {
    res.send("Auth route OK");
});

// 📌 Đăng ký
router.post("/register", async (req, res) => {
    try {
        const {name, emailOrPhone, password} = req.body;

        // 1. Check trùng email/phone
        const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [emailOrPhone]);
        if (existing.length > 0) {
            return res.status(400).json({message: "Email đã tồn tại"});
        }

        // 2. Mã hoá mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Lưu vào DB
        const [result] = await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, emailOrPhone, hashedPassword]);

        const newUser = {id: result.insertId, name, email: emailOrPhone};

        // 4. Tạo token ngay sau khi đăng ký
        const token = jwt.sign(newUser, process.env.JWT_SECRET, {expiresIn: "7d"});

        // 5. Trả về token + user info
        res.status(201).json({token, user: newUser});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi server"});
    }
});

// 📌 Đăng nhập
router.post("/login", async (req, res) => {
    try {
        const {emailOrPhone, password} = req.body;

        // 1. Tìm user theo email/phone
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [emailOrPhone]);
        if (users.length === 0) {
            return res.status(400).json({message: "Email không tồn tại"});
        }

        const user = users[0];

        // 2. So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({message: "Sai mật khẩu"});
        }

        // 3. Tạo token
        const payload = {id: user.id, name: user.name, email: user.email};
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "7d"});

        // 4. Trả về token + thông tin user
        res.json({token, user: payload});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi server"});
    }
});

module.exports = router;
