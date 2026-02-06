const express = require("express");
const router = express.Router();
const controller = require("../controllers/scholarship10Controller");

router.post("/scholar10", controller.createScholar10);
router.get("/scholar10", controller.getScholar10);

module.exports = router;