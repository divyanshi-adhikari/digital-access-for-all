const express = require("express");
const router = express.Router();
const controller = require("../controllers/scholarship12Controller");

router.post("/scholar12", controller.createScholar12);
router.get("/scholar12", controller.getScholar12);

module.exports = router;