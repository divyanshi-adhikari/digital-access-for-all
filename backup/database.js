const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.log("Database error:", err.message);
  } else {
    console.log(" Database connected");
  }
});

// Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS ration_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    ration_number TEXT UNIQUE NOT NULL,
    family_members INTEGER NOT NULL
  )
`, (err) => {
  if (err) console.log("Ration table error:", err.message);
  else console.log("Ration table ready");
});

db.run(`
  CREATE TABLE IF NOT EXISTS scholarship_10th (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    school TEXT NOT NULL,
    marks INTEGER NOT NULL,
    year INTEGER NOT NULL
  )
`, (err) => {
  if (err) console.log("Scholar10 table error:", err.message);
  else console.log(" Scholar10 table ready");
});

db.run(`
  CREATE TABLE IF NOT EXISTS scholarship_12th (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    college TEXT NOT NULL,
    marks INTEGER NOT NULL,
    year INTEGER NOT NULL
  )
`, (err) => {
  if (err) console.log("Scholar12 table error:", err.message);
  else console.log("Scholar12 table ready");
});

db.run(`
  CREATE TABLE IF NOT EXISTS government_schemes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dob TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    category TEXT NOT NULL,
    income REAL NOT NULL
  )
`, (err) => {
  if (err) console.log("Scheme table error:", err.message);
  else console.log(" Scheme table ready");
});

module.exports = db;
