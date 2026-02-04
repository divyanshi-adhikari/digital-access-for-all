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
