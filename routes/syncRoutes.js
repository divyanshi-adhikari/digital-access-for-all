//UPDATED TO SAVE TO DATABASE
const express = require("express");
const router = express.Router();
const db = require("../database");  // Import database

// POST /sync/submit - Main middleware endpoint
router.post("/submit", (req, res) => {
  console.log("\n" + "=".repeat(50));
  console.log(" MIDDLEWARE RECEIVED SUBMISSION");
  console.log("Time:", new Date().toLocaleTimeString());
  console.log("Service Type:", req.body.service_type);
  console.log("Form Data:", req.body.form_data);
  
  try {
    const { service_type, form_data } = req.body;
    
    
    if (!service_type || !form_data) {
      console.log(" Validation failed: Missing fields");
      return res.status(400).json({
        success: false,
        message: "Missing service_type or form_data"
      });
    }
    
    // Generate Application ID
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const applicationId = `${getServiceCode(service_type)}-${timestamp}-${random}`;
    
    console.log(`Generated Application ID: ${applicationId}`);
    
    // Save to database based on service type
    let sql, params;
    
    switch(service_type) {
      case 'ration':
        
        if (!form_data.name || !form_data.category || 
            !form_data.ration_number || form_data.family_members === undefined) {
          return res.status(400).json({
            success: false,
            message: "Missing fields for ration: name, category, ration_number, family_members"
          });
        }
        
        sql = `INSERT INTO ration_cards (name, category, ration_number, family_members, application_id, status) VALUES (?, ?, ?, ?, ?, ?)`;
        params = [
          form_data.name,
          form_data.category,
          form_data.ration_number,
          form_data.family_members,
          applicationId,
          'PENDING'
        ];
        break;
        
      case 'scheme':
        
        if (!form_data.name || !form_data.dob || !form_data.state || 
            !form_data.city || !form_data.address || !form_data.category || 
            form_data.income === undefined) {
          return res.status(400).json({
            success: false,
            message: "Missing fields for scheme"
          });
        }
        
        sql = `INSERT INTO government_schemes (name, dob, state, city, address, category, income, application_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        params = [
          form_data.name,
          form_data.dob,
          form_data.state,
          form_data.city,
          form_data.address,
          form_data.category,
          form_data.income,
          applicationId,
          'PENDING'
        ];
        break;
        
      case 'scholar10':
        
        if (!form_data.name || !form_data.school || 
            form_data.marks === undefined || !form_data.year) {
          return res.status(400).json({
            success: false,
            message: "Missing fields for 10th scholarship: name, school, marks, year"
          });
        }
        
        sql = `INSERT INTO scholarship_10th (name, school, marks, year, application_id, status) VALUES (?, ?, ?, ?, ?, ?)`;
        params = [
          form_data.name,
          form_data.school,
          form_data.marks,
          form_data.year,
          applicationId,
          'PENDING'
        ];
        break;
        
      case 'scholar12':
        
        if (!form_data.name || !form_data.college || 
            form_data.marks === undefined || !form_data.year) {
          return res.status(400).json({
            success: false,
            message: "Missing fields for 12th scholarship: name, college, marks, year"
          });
        }
        
        sql = `INSERT INTO scholarship_12th (name, college, marks, year, application_id, status) VALUES (?, ?, ?, ?, ?, ?)`;
        params = [
          form_data.name,
          form_data.college,
          form_data.marks,
          form_data.year,
          applicationId,
          'PENDING'
        ];
        break;
        
      default:
        console.log("Invalid service type:", service_type);
        return res.status(400).json({
          success: false,
          message: "Invalid service type. Must be: ration, scheme, scholar10, scholar12"
        });
    }
    
    // Execute database query
    console.log(" Executing SQL:", sql);
    console.log("Params:", params);
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error(" Database error:", err.message);
        return res.status(500).json({
          success: false,
          message: "Database error: " + err.message,
          error: err.message
        });
      }
      
      console.log(`Saved to database. ID: ${this.lastID}`);
      console.log("=".repeat(50));
      
      res.json({
        success: true,
        message: "Submission received and saved successfully",
        application_id: applicationId,
        database_id: this.lastID,
        status: "PENDING",
        timestamp: new Date().toISOString()
      });
    });
    
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
});

// Helper function
function getServiceCode(serviceType) {
  const codes = {
    'ration': 'RAT',
    'scheme': 'SCH', 
    'scholar10': 'SC10',
    'scholar12': 'SC12'
  };
  return codes[serviceType] || 'APP';
}

module.exports = router;