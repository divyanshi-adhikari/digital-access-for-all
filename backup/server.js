// server.js - VERIFIED WORKING FOR VERCEL
console.log(" Starting Express server...");

const express = require("express");
const app = express();

// VERY IMPORTANT: Add this middleware to parse requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// SIMPLE TEXT response for root
app.get("/", (req, res) => {
  console.log("Root route triggered!");
  res.type('text').send("HELLO! Server is working at /");
});

// Import database (tables will be created)
console.log("Setting up database...");
try {
  require("./database");
  console.log("Database setup complete");
} catch (err) {
  console.log(" Database warning:", err.message);
}

// Load routes
console.log("Loading API routes...");
try {
  const rationRoutes = require("./routes/rationRoutes");
  const scholar10Routes = require("./routes/scholarship10Routes");
  const scholar12Routes = require("./routes/scholarship12Routes");
  const schemeRoutes = require("./routes/schemeRoutes");
  
  app.use("/gov", rationRoutes);
  app.use("/gov", scholar10Routes);
  app.use("/gov", scholar12Routes);
  app.use("/gov", schemeRoutes);
  
  console.log(" API routes loaded: /gov/*");
} catch (err) {
  console.log(" Route loading failed:", err.message);
}

// Test route
app.get("/test", (req, res) => {
  res.send("Test route is working!");
});

// ========== LOCAL DEVELOPMENT ONLY ==========
if (require.main === module) {
  const PORT = 4000;
  const server = app.listen(PORT, () => {
    console.log("\n" + "=".repeat(50));
    console.log(` SERVER STARTED SUCCESSFULLY!`);
    console.log(` Port: ${PORT}`);
    console.log(` Test URL: http://localhost:${PORT}/`);
    console.log(`Test URL: http://localhost:${PORT}/test`);
    console.log("=".repeat(50) + "\n");
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(` Port ${PORT} is busy. Trying ${PORT + 1}...`);
      app.listen(PORT + 1);
    }
  });
}

// ========== EXPORT FOR VERCEL ==========
module.exports = app;