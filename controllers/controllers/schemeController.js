const GovernmentScheme = require("../models/governmentSchemeModel");

// Allowed categories (same as frontend dropdown)
const allowedCategories = ["SC", "ST", "OBC", "GENERAL"];

/**
 * Save government scheme user details
 */
exports.createGovernmentScheme = (req, res) => {
  const {
    full_name,
    dob,
    state,
    district,
    address,
    category,
    annual_income
  } = req.body;

  // Validation
  if (
    !full_name ||
    !dob ||
    !state ||
    !district ||
    !address ||
    !category ||
    !annual_income
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!allowedCategories.includes(category)) {
    return res.status(400).json({ message: "Invalid category" });
  }

  // Insert into database
  GovernmentScheme.insertGovernmentScheme(req.body, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(201).json({ message: "Government scheme details saved" });
  });
};

/**
 * Fetch all government scheme registrations
 */
exports.getGovernmentSchemes = (req, res) => {
  GovernmentScheme.getAllGovernmentSchemes((err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(rows);
  });
};
