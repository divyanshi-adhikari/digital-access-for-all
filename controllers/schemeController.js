const Scheme = require("../models/schemeModel");

exports.createScheme = (req, res) => {
  try {
    const { name, dob, state, city, address, category, income } = req.body;
    
    // Validation
    const requiredFields = { name, dob, state, city, address, category, income };
    const missingFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Missing fields: ${missingFields.join(", ")}` 
      });
    }
    
    if (typeof income !== 'number' || income < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Income must be a positive number" 
      });
    }
    
    // Create scheme
    Scheme.insertScheme(
      {
        name: name.trim(),
        dob: dob.trim(),
        state: state.trim(),
        city: city.trim(),
        address: address.trim(),
        category: category.trim().toUpperCase(),
        income
      },
      (err) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ 
            success: false, 
            message: "Failed to save scheme details" 
          });
        }
        res.status(201).json({ 
          success: true, 
          message: "Scheme registration completed successfully" 
        });
      }
    );
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

exports.getSchemes = (req, res) => {
  Scheme.getAllSchemes((err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to fetch scheme registrations" 
      });
    }
    res.json({ 
      success: true, 
      count: rows.length,
      data: rows 
    });
  });
};