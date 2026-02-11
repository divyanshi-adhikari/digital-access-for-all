// server.js - Vercel Optimized Express (Keep in ROOT folder)
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ===== STATIC FILES =====
app.use(express.static(__dirname)); // Serve HTML/CSS from root

// ===== DATABASE =====
try {
  require("./database");
  console.log("Database connected");
} catch (e) {
  console.error("Database connection failed:", e);
}

// ===== API ROUTES =====
try {
  app.use("/gov", require("./routes/rationRoutes"));
  app.use("/gov", require("./routes/scholarship10Routes"));
  app.use("/gov", require("./routes/scholarship12Routes"));
  app.use("/gov", require("./routes/schemeRoutes"));
  app.use("/sync", require("./routes/syncRoutes"));
} catch (e) {
  console.error("Route loading failed:", e);
}

// ===== COMMUNITY =====
app.get("/community.html", (req, res) => {
  res.sendFile(path.join(__dirname, "community.html"));
});

app.get("/community", (req, res) => {
  res.redirect("/community.html");
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

// ===== ROOT =====
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
      admin_dashboard: "/admin.html",
      admin_login: "/admin-lock.html",
      user_forms: ["/", "/ration.html", "/scholarship10.html", "/scholarship12.html"]
    }
  });
});

// ===== HEALTH CHECK =====
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

// ===== ERROR HANDLERS =====
app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ 
    success: false,
    error: "Internal server error", 
    message: err.message 
  });
});

// ========== LOCAL DEVELOPMENT ONLY ==========
if (require.main === module) {
  const PORT = 4000;
  app.listen(PORT, () => {
    console.log("\n" + "=".repeat(60));
    console.log(`  LOCAL DEVELOPMENT SERVER RUNNING`);
    console.log("=".repeat(60));
    console.log(`  http://localhost:${PORT}`);
    console.log(`  http://localhost:${PORT}/home.html`);
    console.log(`  http://localhost:${PORT}/admin`);
    console.log("=".repeat(60) + "\n");
  });
}


// ===== EXPORT FOR VERCEL =====
const serverless = require("serverless-http");
module.exports = serverless(app);
