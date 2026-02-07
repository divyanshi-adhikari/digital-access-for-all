const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.log("Database error:", err.message);
  } else {
    console.log("Database connected");
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
  else {
    console.log("Ration table ready");
    safeAddColumns('ration_cards');
  }
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
  else {
    console.log(" Scholar10 table ready");
    safeAddColumns('scholarship_10th');
  }
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
  else {
    console.log(" Scholar12 table ready");
    safeAddColumns('scholarship_12th');
  }
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
  else {
    console.log(" Scheme table ready");
    safeAddColumns('government_schemes');
  }
});

// Function to safely add columns (won't duplicate)
function safeAddColumns(tableName) {
  // Use db.all() to get ALL column info rows
  db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
    if (err) {
      console.log(`Error checking ${tableName}:`, err.message);
      return;
    }
    
    const columnNames = columns.map(col => col.name);
    
    // Only add if column doesn't exist
    if (!columnNames.includes('application_id')) {
      db.run(`ALTER TABLE ${tableName} ADD COLUMN application_id TEXT`, (alterErr) => {
        if (alterErr) {
          // Check if error is about duplicate column
          if (alterErr.message.includes('duplicate column name')) {
            console.log(`Column application_id already exists in ${tableName}`);
          } else {
            console.log(`Error adding application_id to ${tableName}:`, alterErr.message);
          }
        } else {
          console.log(` Added application_id to ${tableName}`);
        }
      });
    } else {
      console.log(`Column application_id already exists in ${tableName}`);
    }
    
    if (!columnNames.includes('status')) {
      db.run(`ALTER TABLE ${tableName} ADD COLUMN status TEXT DEFAULT 'PENDING'`, (alterErr) => {
        if (alterErr) {
          if (alterErr.message.includes('duplicate column name')) {
            console.log(`Column status already exists in ${tableName}`);
          } else {
            console.log(`Error adding status to ${tableName}:`, alterErr.message);
          }
        } else {
          console.log(`Added status to ${tableName}`);
        }
      });
    } else {
      console.log(`Column status already exists in ${tableName}`);
    }
  });
}

module.exports = db;