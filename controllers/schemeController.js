const Scheme = require("../models/schemeModel");

exports.createScheme = (req, res) => {
  const { name, dob, state, city, address, category, income } = req.body;

  // Simple validation
  if (!name || !dob || !state || !city || !address || !category || !income) {
    return res.status(400).json({ message: "All fields are required" });
  }

  Scheme.insertScheme(req.body, (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.status(201).json({ message: "Scheme details saved" });
  });
};

exports.getSchemes = (req, res) => {
  Scheme.getAllSchemes((err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(rows);
  });
};
