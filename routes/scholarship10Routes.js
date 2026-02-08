const express = require("express");
const router = express.Router();
const controller = require("../controllers/scholarship10Controller");

// POST - Create new 10th scholarship application
router.post("/scholar10", controller.createScholar10);

// GET - Get all 10th scholarship applications
router.get("/scholar10", controller.getScholar10);

// PATCH - Update 10th scholarship status
router.patch("/application/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`PATCH /gov/application/${id} - Updating to: ${status}`);
    
    const db = require("../database");
    const sql = "UPDATE scholarship_10th SET status = ? WHERE application_id = ? OR id = ?";
    
    db.run(sql, [status.toUpperCase(), id, id], function(err) {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ 
                success: false, 
                error: err.message 
            });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                error: `10th scholarship application ${id} not found`
            });
        }
        
        console.log(`Updated 10th scholarship ${id}. Changes: ${this.changes}`);
        res.json({ 
            success: true, 
            message: `10th scholarship ${id} updated to ${status}`,
            changes: this.changes,
            status: status.toUpperCase()
        });
    });
});

module.exports = router;