const Scholar12 = require("../models/scholarship12Model");

exports.createScholar12 = (req, res) => {
  try {
    const { name, college, marks, year } = req.body;
    
    // Validation
    if (!name || !college || !marks || !year) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required: name, college, marks, year" 
      });
    }
    
    if (typeof marks !== 'number' || marks < 0 || marks > 100) {
      return res.status(400).json({ 
        success: false, 
        message: "Marks must be a number between 0 and 100" 
      });
    }
    
    if (typeof year !== 'number' || year < 2000 || year > 2100) {
      return res.status(400).json({ 
        success: false, 
        message: "Year must be a valid year between 2000 and 2100" 
      });
    }
    
    // Create scholarship 12th
    Scholar12.insertScholar12(
      {
        name: name.trim(),
        college: college.trim(),
        marks,
        year
      },
      (err) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ 
            success: false, 
            message: "Failed to save scholarship details" 
          });
        }
        res.status(201).json({ 
          success: true, 
          message: "12th Scholarship application submitted successfully" 
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

exports.getScholar12 = (req, res) => {
  Scholar12.getAllScholar12((err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to fetch scholarship applications" 
      });
    }
    res.json({ 
      success: true, 
      count: rows.length,
      data: rows 
    });
  });
};

