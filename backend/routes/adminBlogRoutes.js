const express = require("express");
const adminBlog = require("../controllers/adminBlogController");
const auth = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");
const multer = require("multer");
const {uploadToCloudinary} = require("../middlewares/cloudinaryUpload");

// Multer config cho upload ảnh blog
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 10 * 1024 * 1024}, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Chỉ cho phép upload file ảnh!"), false);
        }
    },
});

const router = express.Router();

// Admin Blogs
router.get("/category/:category", auth, checkRole(["admin", "staff"]), adminBlog.getBlogsByCategory);
router.get("/", auth, checkRole(["admin", "staff"]), adminBlog.listBlogs);
router.get("/:id", auth, checkRole(["admin", "staff"]), adminBlog.getBlogDetail);
router.post("/", auth, checkRole(["admin", "staff"]), upload.single("image"), uploadToCloudinary("blogs"), adminBlog.createBlog);
router.put("/:id", auth, checkRole(["admin", "staff"]), upload.single("image"), uploadToCloudinary("blogs"), adminBlog.updateBlog);
router.delete("/:id", auth, checkRole(["admin"]), adminBlog.deleteBlog);

module.exports = router;
