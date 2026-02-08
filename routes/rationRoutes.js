const express = require("express");
const router = express.Router();
const controller = require("../controllers/rationController");

// POST - Create new ration application
router.post("/ration", controller.createRation);

// GET - Get all ration applications
router.get("/ration", controller.getRations);

// PATCH - Update ration application status
router.patch("/application/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`PATCH /gov/application/${id} - Updating to: ${status}`);
    
    const db = require("../database");
    const sql = "UPDATE ration_cards SET status = ? WHERE application_id = ? OR id = ?";
    
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
                error: `Ration application ${id} not found`
            });
        }
        
        console.log(`✅ Updated ration application ${id}. Changes: ${this.changes}`);
        res.json({ 
            success: true, 
            message: `Ration application ${id} updated to ${status}`,
            changes: this.changes,
            status: status.toUpperCase()
        });
    });
});

module.exports = router;