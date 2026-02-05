const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());

// Connect database
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Database connected");
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

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
    scheme_name TEXT,
    description TEXT,
    eligibility TEXT
  )
`);

