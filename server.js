// server.js - COMPLETE VERSION
console.log("Starting Government Services API...");

const express = require("express");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Database
console.log(" Initializing database...");
require("./database");
console.log("Database connected");

// Routes
console.log("Loading routes...");
app.use("/gov", require("./routes/rationRoutes"));
app.use("/gov", require("./routes/scholarship10Routes"));
app.use("/gov", require("./routes/scholarship12Routes"));
app.use("/gov", require("./routes/schemeRoutes"));
app.use("/sync", require("./routes/syncRoutes"));
console.log(" All routes loaded");

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Government Services API v1.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      government: {
        ration: { POST: "/gov/ration", GET: "/gov/ration" },
        scheme: { POST: "/gov/scheme", GET: "/gov/scheme" },
        scholar10: { POST: "/gov/scholar10", GET: "/gov/scholar10" },
        scholar12: { POST: "/gov/scholar12", GET: "/gov/scholar12" }
      },
      middleware: {
        sync: { POST: "/sync/submit" }
      }
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handlers
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`
  });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message
  });
});

// Start server
const PORT = 4000;
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log(` SERVER RUNNING ON PORT ${PORT}`);
  console.log(` http://localhost:${PORT}`);
  console.log("=".repeat(50));
  console.log("\n Test middleware:");
  console.log("   POST http://localhost:4000/sync/submit");
  console.log("   Body: {\"service_type\":\"ration\",\"form_data\":{\"name\":\"...\",\"category\":\"SC\",\"ration_number\":\"...\",\"family_members\":3}}");
  console.log("\n");
});