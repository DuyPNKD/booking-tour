const express = require("express");
const {login} = require("../controllers/adminController");
const auth = require("../middlewares/authMiddleware");
const adminTour = require("../controllers/adminTourController");
const adminTourImport = require("../controllers/adminTourImportController");
const multer = require("multer");
const upload = multer({storage: multer.memoryStorage(), limits: {fileSize: 10 * 1024 * 1024}});

const router = express.Router();

router.post("/login", login);

// Admin Tours
router.get("/tours", auth, adminTour.listTours);
router.get("/tours/:id", auth, adminTour.getTourDetail);
router.post("/tours", auth, adminTour.createTour);
router.put("/tours/:id", auth, adminTour.updateTour);
router.delete("/tours/:id", auth, adminTour.deleteTour);

// locations for filter
router.get("/locations", auth, adminTour.listLocations);

// Bulk import
router.post("/tours/import", auth, upload.single("file"), adminTourImport.importTours);

module.exports = router;
