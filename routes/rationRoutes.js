// routes/rationRoutes.js
const path = require("path");

// force express Router
const expressPath = require.resolve("express"); // find express path
delete require.cache[expressPath];              // clear any cached modules
const express = require("express");             // now require express safely
const router = express.Router();                // use express router

const controller = require("../controllers/rationController");

router.post("/ration", controller.createRation);
router.get("/ration", controller.getRations);

module.exports = router;
