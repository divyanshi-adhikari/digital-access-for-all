const Scholar10 = require("../models/scholarship10Model");

exports.createScholar10 = (req, res) => {
  try {
    const { name, school, marks, year } = req.body;
    
    // Validation
    if (!name || !school || !marks || !year) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required: name, school, marks, year" 
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
    
    // Create scholarship 10th
    Scholar10.insertScholar10(
      {
        name: name.trim(),
        school: school.trim(),
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
          message: "10th Scholarship application submitted successfully" 
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

exports.getScholar10 = (req, res) => {
  Scholar10.getAllScholar10((err, rows) => {
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
