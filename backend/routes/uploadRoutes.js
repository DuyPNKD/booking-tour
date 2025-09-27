const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const uploadController = require("../controllers/uploadController");

const router = express.Router();

// Upload single image (KHÔNG cần auth - chỉ để test)
router.post("/cloudinary/test", ...uploadController.uploadSingleTest);

// Upload single image (CẦN auth - production)
router.post("/cloudinary", authMiddleware, ...uploadController.uploadSingle);

// Upload multiple images (CẦN auth - production)
router.post("/cloudinary/multiple", authMiddleware, ...uploadController.uploadMultiple);

// Delete image from Cloudinary (CẦN auth - production)
router.delete("/cloudinary/*", authMiddleware, uploadController.deleteImage);

module.exports = router;
