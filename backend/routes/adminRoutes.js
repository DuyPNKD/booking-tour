const express = require("express");
const {login, refresh, logout} = require("../controllers/adminController");
const auth = require("../middlewares/authMiddleware");
const adminTour = require("../controllers/adminTourController");
const adminTourImport = require("../controllers/adminTourImportController");
const multer = require("multer");
const checkRole = require("../middlewares/checkRole");

// Multer config cho admin uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 10 * 1024 * 1024},
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Chỉ cho phép upload file ảnh!"), false);
        }
    },
});

const router = express.Router();

router.post("/login", login);
router.post("/refresh-token", refresh);
router.post("/logout", logout);

// Admin Tours
router.get("/tours", auth, checkRole(["admin", "staff"]), adminTour.listTours);
router.get("/tours/:id", auth, checkRole(["admin", "staff"]), adminTour.getTourDetail);
router.post("/tours", auth, checkRole(["admin", "staff"]), adminTour.createTour);
router.put("/tours/:id", auth, checkRole(["admin", "staff"]), adminTour.updateTour);
router.delete("/tours/:id", auth, checkRole(["admin"]), adminTour.deleteTour);

// locations for filter
router.get("/locations", auth, checkRole(["admin", "staff"]), adminTour.listLocations);

// Bulk import
router.post("/tours/import", auth, checkRole(["admin"]), upload.single("file"), adminTourImport.importTours);

module.exports = router;
