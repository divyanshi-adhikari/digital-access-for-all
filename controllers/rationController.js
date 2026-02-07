const Ration = require("../models/rationModel");

const validCategories = ["SC", "ST", "OBC", "GENERAL"];

exports.createRation = (req, res) => {
  console.log("=== CREATE RATION REQUEST ===");
  console.log("Headers:", req.headers);
  console.log("Raw body:", req.body);
  console.log("Body type:", typeof req.body);
  
  // Check if body exists
  if (!req.body || Object.keys(req.body).length === 0) {
    console.log("❌ Request body is empty!");
    return res.status(400).json({ 
      success: false, 
      message: "Request body is empty or not in JSON format",
      hint: "Make sure to send Content-Type: application/json"
    });
  }
  
  const { name, category, ration_number, family_members } = req.body;
  
  console.log("Extracted fields:", { name, category, ration_number, family_members });
  
  // Validation
  if (!name || !category || !ration_number || family_members === undefined) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields",
      required: ["name", "category", "ration_number", "family_members"],
      received: req.body
    });
  }
  
  if (!validCategories.includes(category.toUpperCase())) {
    return res.status(400).json({ 
      success: false, 
      message: `Invalid category '${category}'. Must be: SC, ST, OBC, or GENERAL`,
      validCategories: validCategories
    });
  }
  
  // Ensure family_members is a number
  const famMembers = Number(family_members);
  if (isNaN(famMembers) || famMembers < 1) {
    return res.status(400).json({ 
      success: false, 
      message: "Family members must be a positive number"
    });
  }
  
  // Create ration
  Ration.createRation(
    {
      name: name.toString().trim(),
      category: category.toString().toUpperCase(),
      ration_number: ration_number.toString().trim(),
      family_members: famMembers
    },
    (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Database error",
          error: err.message
        });
      }
      console.log("✅ Ration created successfully");
      res.status(201).json({ 
        success: true, 
        message: "Ration card created successfully" 
      });
    }
  );
};

exports.getRations = (req, res) => {
  console.log("Getting all ration cards...");
  Ration.getAllRations((err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to fetch ration cards" 
      });
    }
    console.log(`Found ${rows.length} ration cards`);
    res.json(rows);
  });
};