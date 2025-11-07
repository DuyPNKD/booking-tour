const express = require("express");
const blogController = require("../controllers/adminBlogController");

const router = express.Router();

// Public Blog APIs
router.get("/", blogController.listBlogs); // Lấy danh sách tất cả bài viết (có phân trang)
router.get("/category/:category", blogController.getBlogsByCategory); // Lọc theo danh mục
router.get("/:id", blogController.getBlogDetail); // Lấy chi tiết bài viết

module.exports = router;
