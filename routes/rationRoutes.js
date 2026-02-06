const express = require("express");
const router = express.Router();
const controller = require("../controllers/rationController");

router.post("/ration", controller.createRation);
router.get("/ration", controller.getRations);

module.exports = router;
