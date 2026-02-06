const express = require("express");
const router = express.Router();
const controller = require("../controllers/schemeController");

router.post("/scheme", controller.createScheme);
router.get("/scheme", controller.getSchemes);

module.exports = router;