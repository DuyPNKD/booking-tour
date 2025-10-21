const db = require("../config/db");
const bcrypt = require("bcryptjs");

/**
 * User Controller - Quản lý người dùng
 * Chức năng: CRUD operations cho users
 */

// Lấy danh sách users với phân trang và tìm kiếm
const getUsers = async (req, res) => {
    try {
        const {page = 1, limit = 10, search = "", role = "", status = ""} = req.query;
        const offset = (page - 1) * limit;

        // Xây dựng query WHERE
        let whereConditions = [];
        let queryParams = [];

        // Tìm kiếm theo tên hoặc email
        if (search) {
            whereConditions.push("(name LIKE ? OR email LIKE ?)");
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        // Lọc theo role
        if (role) {
            whereConditions.push("role = ?");
            queryParams.push(role);
        }

        // Lọc theo status (is_active)
        if (status !== "") {
            whereConditions.push("is_active = ?");
            queryParams.push(status === "active" ? 1 : 0);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

        // Query đếm tổng số records
        const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
        const [countResult] = await db.query(countQuery, queryParams);
        const total = countResult[0].total;

        // Query lấy dữ liệu với phân trang
        const dataQuery = `
            SELECT 
                id, name, email, phone, gender, address, role, is_active, created_at
            FROM users 
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;

        const [users] = await db.query(dataQuery, [...queryParams, parseInt(limit), offset]);

        res.json({
            success: true,
            data: users,
            pagination: {
                current: parseInt(page),
                pageSize: parseInt(limit),
                total: total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error getting users:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách người dùng",
            error: error.message,
        });
    }
};

// Lấy thông tin user theo ID
const getUserById = async (req, res) => {
    try {
        const {id} = req.params;

        const [users] = await db.query("SELECT id, name, email, phone, gender, address, role, is_active, created_at FROM users WHERE id = ?", [id]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng",
            });
        }

        res.json({
            success: true,
            data: users[0],
        });
    } catch (error) {
        console.error("Error getting user:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy thông tin người dùng",
            error: error.message,
        });
    }
};

// Tạo user mới
const createUser = async (req, res) => {
    try {
        const {name, email, password, phone, gender, address, role = "user", is_active = 1} = req.body;

        // Validate dữ liệu đầu vào
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Tên và email là bắt buộc",
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ",
            });
        }

        // Validate role
        const validRoles = ["user", "admin"];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role không hợp lệ. Chỉ chấp nhận: user, admin",
            });
        }

        // Kiểm tra email đã tồn tại chưa
        const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ?", [email]);

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email đã tồn tại",
            });
        }

        // Hash password nếu có
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Tạo user mới
        const [result] = await db.query(
            `INSERT INTO users (name, email, password, phone, gender, address, role, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, phone, gender, address, role, is_active]
        );

        // Lấy thông tin user vừa tạo
        const [newUser] = await db.query("SELECT id, name, email, phone, gender, address, role, is_active, created_at FROM users WHERE id = ?", [
            result.insertId,
        ]);

        res.status(201).json({
            success: true,
            message: "Tạo người dùng thành công",
            data: newUser[0],
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo người dùng",
            error: error.message,
        });
    }
};

// Cập nhật user
const updateUser = async (req, res) => {
    try {
        const {id} = req.params;
        const {name, email, password, phone, gender, address, role, is_active} = req.body;

        // Kiểm tra user có tồn tại không
        const [existingUsers] = await db.query("SELECT id FROM users WHERE id = ?", [id]);

        if (existingUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng",
            });
        }

        // Validate email format nếu có email mới
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Email không hợp lệ",
                });
            }

            // Kiểm tra email đã tồn tại chưa (trừ user hiện tại)
            const [emailCheck] = await db.query("SELECT id FROM users WHERE email = ? AND id != ?", [email, id]);

            if (emailCheck.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Email đã tồn tại",
                });
            }
        }

        // Validate role nếu có
        if (role) {
            const validRoles = ["user", "admin"];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Role không hợp lệ. Chỉ chấp nhận: user, admin",
                });
            }
        }

        // Xây dựng query UPDATE động
        const updateFields = [];
        const updateValues = [];

        if (name !== undefined) {
            updateFields.push("name = ?");
            updateValues.push(name);
        }
        if (email !== undefined) {
            updateFields.push("email = ?");
            updateValues.push(email);
        }
        if (phone !== undefined) {
            updateFields.push("phone = ?");
            updateValues.push(phone);
        }
        if (gender !== undefined) {
            updateFields.push("gender = ?");
            updateValues.push(gender);
        }
        if (address !== undefined) {
            updateFields.push("address = ?");
            updateValues.push(address);
        }
        if (role !== undefined) {
            updateFields.push("role = ?");
            updateValues.push(role);
        }
        if (is_active !== undefined) {
            updateFields.push("is_active = ?");
            updateValues.push(is_active);
        }

        // Hash password mới nếu có
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push("password = ?");
            updateValues.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Không có dữ liệu để cập nhật",
            });
        }

        updateFields.push("updated_at = CURRENT_TIMESTAMP");
        updateValues.push(id);

        // Thực hiện update
        await db.query(`UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`, updateValues);

        // Lấy thông tin user sau khi update
        const [updatedUser] = await db.query(
            "SELECT id, name, email, phone, gender, address, role, is_active, created_at, updated_at FROM users WHERE id = ?",
            [id]
        );

        res.json({
            success: true,
            message: "Cập nhật người dùng thành công",
            data: updatedUser[0],
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật người dùng",
            error: error.message,
        });
    }
};

// Xóa user
const deleteUser = async (req, res) => {
    try {
        const {id} = req.params;

        // Kiểm tra user có tồn tại không
        const [existingUsers] = await db.query("SELECT id, name FROM users WHERE id = ?", [id]);

        if (existingUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng",
            });
        }

        // Xóa user
        await db.query("DELETE FROM users WHERE id = ?", [id]);

        res.json({
            success: true,
            message: `Đã xóa người dùng ${existingUsers[0].name} thành công`,
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa người dùng",
            error: error.message,
        });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};
