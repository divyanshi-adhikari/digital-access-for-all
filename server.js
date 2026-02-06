// TEMP CHANGE TO FORCE GIT

const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());

// ===== ROUTES IMPORT =====
const scholar10Routes = require("./routes/scholarship10Routes");
const scholar12Routes = require("./routes/scholarship12Routes");
const schemeRoutes = require("./routes/schemeRoutes");

// ===== ROUTES USE =====
app.use("/gov", scholar10Routes);
app.use("/gov", scholar12Routes);
app.use("/gov", schemeRoutes);

// ===== DATABASE CONNECTION =====
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.log("DB error:", err.message);
  } else {
    console.log("Database connected");
  }
});

// ===== TABLES =====
db.run(`
  CREATE TABLE IF NOT EXISTS ration_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    ration_number TEXT,
    family_members INTEGER
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS scholarship_10th (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    school TEXT,
    marks INTEGER,
    year INTEGER
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS scholarship_12th (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    college TEXT,
    marks INTEGER,
    year INTEGER
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS government_schemes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    dob TEXT,
    state TEXT,
    city TEXT,
    address TEXT,
    category TEXT,
    income REAL
  )
`);

// ===== SERVER START =====
app.listen(3000, () => {
  console.log("Server running on port 3000");
});

module.exports = db;
