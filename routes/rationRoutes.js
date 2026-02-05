const express = require("express");
const router = express.Router();
const controller =  = require("../controllers/rationController");

router.post("/ration", controller.createRation);
router.get("/ration", controller.getRation);

module.exports = router;

