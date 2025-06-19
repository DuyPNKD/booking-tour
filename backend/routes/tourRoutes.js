const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");

router.get("/", tourController.getAllTours);
router.get("/:id", tourController.getTourById);
router.get("/:id/departures", tourController.getTourDepartures);
router.get("/:id/overview", tourController.getTourOverview);
router.get("/:id/schedules", tourController.getTourSchedules);
router.get("/:id/prices", tourController.getTourPrices);
router.get("/:id/reviews", tourController.getTourReviews);

module.exports = router;
