// server.js - COMPLETE WORKING VERSION
console.log(" Starting Government Services API...");

const express = require("express");
const app = express();

// ========== MIDDLEWARE - MUST BE FIRST ==========

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.url}`);
  console.log(`   Body:`, req.body); // This will show us if body is being parsed
  next();
});
// ========== END MIDDLEWARE ==========

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Government Services API v1.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ========== DATABASE ==========
console.log(" Initializing database...");
try {
  require("./database");
  console.log(" Database connected");
} catch (err) {
  console.log(" Database error:", err.message);
}

// ========== ROUTES ==========
console.log("Loading routes...");
try {
  const rationRoutes = require("./routes/rationRoutes");
  const scholar10Routes = require("./routes/scholarship10Routes");
  const scholar12Routes = require("./routes/scholarship12Routes");
  const schemeRoutes = require("./routes/schemeRoutes");
  
  // Mount routes
  app.use("/gov", rationRoutes);
  app.use("/gov", scholar10Routes);
  app.use("/gov", scholar12Routes);
  app.use("/gov", schemeRoutes);
  
  console.log(" Routes mounted at /gov");
} catch (err) {
  console.log(" Route error:", err.message);
}

// ========== ERROR HANDLING ==========
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(" Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log(`SERVER RUNNING`);
  console.log(` Port: ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log("=".repeat(50));
  console.log("\n Available endpoints:");
  console.log("   POST /gov/ration     - Create ration card");
  console.log("   GET  /gov/ration     - Get all ration cards");
  console.log("   POST /gov/scheme     - Register for scheme");
  console.log("   GET  /gov/scheme     - Get all schemes");
  console.log("   POST /gov/scholar10  - Apply for 10th scholarship");
  console.log("   GET  /gov/scholar10  - Get all 10th scholarships");
  console.log("   POST /gov/scholar12  - Apply for 12th scholarship");
  console.log("   GET  /gov/scholar12  - Get all 12th scholarships");
  console.log("\n");
});