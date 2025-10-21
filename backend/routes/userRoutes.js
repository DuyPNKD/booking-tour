const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const checkRole = require("../middlewares/checkRole");
const checkAuth = require("../middlewares/checkAuth");

/**
 * User Routes - API endpoints cho quản lý người dùng
 * Tất cả routes đều yêu cầu authentication và admin role
 */

// Middleware kiểm tra quyền admin
router.use(checkAuth);
router.use(checkRole(["admin"]));

/**
 * GET /api/users
 * Lấy danh sách users với phân trang và tìm kiếm
 * Query params: page, limit, search, role, status
 */
router.get("/", userController.getUsers);

/**
 * GET /api/users/:id
 * Lấy thông tin chi tiết của một user
 */
router.get("/:id", userController.getUserById);

/**
 * POST /api/users
 * Tạo user mới
 * Body: { name, email, password?, phone?, gender?, address?, role?, is_active? }
 */
router.post("/", userController.createUser);

/**
 * PUT /api/users/:id
 * Cập nhật thông tin user
 * Body: { name?, email?, password?, phone?, gender?, address?, role?, is_active? }
 */
router.put("/:id", userController.updateUser);

/**
 * DELETE /api/users/:id
 * Xóa user
 */
router.delete("/:id", userController.deleteUser);

module.exports = router;
