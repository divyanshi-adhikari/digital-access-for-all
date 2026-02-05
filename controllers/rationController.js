const Ration = require("../models/rationModel");

const allowedCategories = ["SC", "ST", "OBC", "GENERAL"];

exports.createRation = (req, res) => {
  if (!allowedCategories.includes(req.body.category)) {
    return res.status(400).json({ message: "Invalid category" });
  }

  Ration.insertRation(req.body, (err) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    res.status(201).json({ message: "Ration card saved" });
  });
};

exports.getRations = (req, res) => {
  Ration.getAllRations((err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    res.json(rows);
  });
};

