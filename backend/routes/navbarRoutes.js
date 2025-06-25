const express = require("express");
const router = express.Router();
const navController = require("../controllers/navbarController");

router.get("/", navController.getNavbarMenu);

module.exports = router;
