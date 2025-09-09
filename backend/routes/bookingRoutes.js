const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", bookingController.createBooking);
router.get("/:id", bookingController.getBookingById);
router.get("/me/list", authMiddleware, bookingController.getMyBookings);
router.delete("/me/:id", authMiddleware, bookingController.deleteMyBooking);

module.exports = router;
