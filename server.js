// server.js - COMPLETE VERSION WITH CORS & STATIC SERVING
console.log("Starting Government Services API...");

const express = require("express");
const cors = require("cors");  // 1. ADD CORS
const app = express();

// ========== MIDDLEWARE ==========
app.use(cors());  // 2. ENABLE CORS FOR ALL ROUTES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ========== SERVE STATIC FILES ==========
app.use(express.static('.'));  // 3. SERVE HTML, CSS, JS FROM CURRENT DIRECTORY

// ========== DATABASE ==========
console.log(" Initializing database...");
require("./database");
console.log("Database connected");

// ========== API ROUTES ==========
console.log("Loading routes...");
app.use("/gov", require("./routes/rationRoutes"));
app.use("/gov", require("./routes/scholarship10Routes"));
app.use("/gov", require("./routes/scholarship12Routes"));
app.use("/gov", require("./routes/schemeRoutes"));
app.use("/sync", require("./routes/syncRoutes"));
console.log(" All routes loaded");

// ========== COMMUNITY SHARING ==========  // <-- ADD THIS SECTION
console.log("Enabling community sharing...");
app.get("/community.html", (req, res) => {
  console.log(` Community portal accessed from IP: ${req.ip}`);
  res.sendFile(__dirname + "/community.html");
});

app.get("/api/community/status", (req, res) => {
  res.json({
    service: "community-sharing",
    status: "active",
    server: "Digital Access Portal",
    ip: req.ip,
    timestamp: new Date().toISOString(),
    message: "Community sharing is enabled on this server"
  });
});

app.get("/community", (req, res) => {
  res.redirect("/community.html");
});
// =======================================

// ========== ROOT ROUTE ==========
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
    },
    static_files: {
      admin_dashboard: "http://localhost:4000/admin.html",
      admin_login: "http://localhost:4000/admin-login.html",
      user_forms: [
        "http://localhost:4000/",
        "http://localhost:4000/ration.html",
        "http://localhost:4000/scholarship10.html",
        "http://localhost:4000/scholarship12.html"
      ]
    }
  });
});

// ========== HEALTH CHECK ==========
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      api: "running",
      database: "connected",
      static_files: "serving",
      cors: "enabled"
    }
  });
});

// ========== ERROR HANDLERS ==========
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    available_routes: {
      api: "/",
      health: "/health",
      admin: "/admin.html",
      forms: ["/", "/ration.html", "/scholarship10.html", "/scholarship12.html"]
    }
  });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// ========== START SERVER ==========
const PORT = 4000;
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log(`  SERVER SUCCESSFULLY STARTED`);
  console.log("=".repeat(60));
  console.log(`  Port: ${PORT}`);
  console.log(`  Base URL: http://localhost:${PORT}`);
  console.log(`  CORS: Enabled (Allowing all origins)`);
  console.log(`  Static Files: Serving from current directory`);
  console.log("=".repeat(60));
  console.log("\n  ADMIN DASHBOARD:");
  console.log("    http://localhost:4000/admin.html");
  console.log("    http://localhost:4000/admin-login.html");
  
  console.log("\n  USER FORMS:");
  console.log("    Government Scheme: http://localhost:4000/");
  console.log("    Ration Card: http://localhost:4000/ration.html");
  console.log("    10th Scholarship: http://localhost:4000/scholarship10.html");
  console.log("    12th Scholarship: http://localhost:4000/scholarship12.html");
  
  console.log("\n 🔧 API ENDPOINTS:");
  console.log("   GET  http://localhost:4000/gov/ration");
  console.log("   GET  http://localhost:4000/gov/scheme");
  console.log("   GET  http://localhost:4000/gov/scholar10");
  console.log("   GET  http://localhost:4000/gov/scholar12");
  console.log("   POST http://localhost:4000/sync/submit");
  
  console.log("\n 🩺 HEALTH CHECK:");
  console.log("   GET  http://localhost:4000/health");
  console.log("\n" + "=".repeat(60));
  console.log(" Server is ready to accept connections!");
  console.log("=".repeat(60) + "\n");
});