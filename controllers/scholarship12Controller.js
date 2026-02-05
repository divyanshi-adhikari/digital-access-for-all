const Scholar12 = require("../models/scholarship12Model");

exports.createScholar12 = (req, res) => {
  const { name, college, marks, year } = req.body;
  if (!name || !college || !marks || !year) {
    return res.status(400).json({ message: "All fields required" });
  }

  Scholar12.insertScholar12(req.body, (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.status(201).json({ message: "Scholarship 12th saved" });
  });
};

exports.getScholar12 = (req, res) => {
  Scholar12.getAllScholar12((err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(rows);
  });
};
