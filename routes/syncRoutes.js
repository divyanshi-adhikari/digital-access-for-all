// syncRoutes.js - CORRECT VERSION (No hardcoded data)
const express = require("express");
const router = express.Router();
const db = require("../database");

// ========== GET ENDPOINT (For testing only) ==========
router.get("/submit", (req, res) => {
  res.json({
    success: true,
    message: "Sync API is running. Use POST to submit data.",
    endpoint: "POST /sync/submit",
    timestamp: new Date().toISOString(),
    supported_services: ["ration", "scheme", "scholar10", "scholar12"]
  });
});

// ========== POST ENDPOINT (Main sync endpoint) ==========
router.post("/submit", (req, res) => {
  console.log("\n" + "=".repeat(50));
  console.log("📡 SYNC SUBMISSION RECEIVED");
  console.log("Time:", new Date().toLocaleTimeString());
  console.log("Service Type:", req.body.service_type);
  
  try {
    const { service_type, form_data } = req.body;
    
    // Basic validation
    if (!service_type || !form_data) {
      console.log(" Validation failed: Missing fields");
      return res.status(400).json({
        success: false,
        message: "Missing service_type or form_data"
      });
    }
    
    // Validate service type
    const validServices = ["ration", "scheme", "scholar10", "scholar12"];
    if (!validServices.includes(service_type)) {
      console.log(" Invalid service type:", service_type);
      return res.status(400).json({
        success: false,
        message: `Invalid service_type. Must be one of: ${validServices.join(", ")}`
      });
    }
    
    // Generate Application ID
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const applicationId = `${getServiceCode(service_type)}-${timestamp}-${random}`;
    
    console.log(`Generated Application ID: ${applicationId}`);
    console.log("Form Data Received:", form_data);
    
    // Process based on service type
    let sql, params;
    let validationErrors = [];
    
    switch(service_type) {
      case 'ration':
        // Check required fields for ration
        if (!form_data.name) validationErrors.push("name");
        if (!form_data.category) validationErrors.push("category");
        if (!form_data.ration_number) validationErrors.push("ration_number");
        if (form_data.family_members === undefined) validationErrors.push("family_members");
        
        if (validationErrors.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Missing required fields for ration: ${validationErrors.join(", ")}`
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
        // Check required fields for scheme (based on your frontend)
        if (!form_data.name) validationErrors.push("name");
        if (!form_data.category) validationErrors.push("category");
        if (!form_data.state) validationErrors.push("state");
        if (!form_data.scheme_type) validationErrors.push("scheme_type");
        
        if (validationErrors.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Missing required fields for scheme: ${validationErrors.join(", ")}`
          });
        }
        
        sql = `INSERT INTO government_schemes (name, category, state, scheme_type, application_id, status) VALUES (?, ?, ?, ?, ?, ?)`;
        params = [
          form_data.name,
          form_data.category,
          form_data.state,
          form_data.scheme_type,
          applicationId,
          'PENDING'
        ];
        break;
        
      case 'scholar10':
        // Check required fields for 10th scholarship
        if (!form_data.name) validationErrors.push("name");
        if (!form_data.school) validationErrors.push("school");
        if (form_data.marks === undefined) validationErrors.push("marks");
        if (!form_data.year) validationErrors.push("year");
        
        if (validationErrors.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Missing required fields for 10th scholarship: ${validationErrors.join(", ")}`
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
        // Check required fields for 12th scholarship
        if (!form_data.name) validationErrors.push("name");
        if (!form_data.college) validationErrors.push("college");
        if (form_data.marks === undefined) validationErrors.push("marks");
        if (!form_data.year) validationErrors.push("year");
        
        if (validationErrors.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Missing required fields for 12th scholarship: ${validationErrors.join(", ")}`
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
    }
    
    // Save to database
    console.log(" Saving to database...");
    console.log("SQL:", sql);
    console.log("Params:", params);
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error(" Database error:", err.message);
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err.message
        });
      }
      
      console.log(`Successfully saved! Row ID: ${this.lastID}`);
      console.log("=".repeat(50));
      
      // Success response
      res.json({
        success: true,
        message: "Data submitted successfully",
        application_id: applicationId,
        database_id: this.lastID,
        status: "PENDING",
        timestamp: new Date().toISOString()
      });
    });
    
  } catch (error) {
    console.error(" Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Helper function to generate service codes
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