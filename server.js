const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.log(" DB error:", err.message);
  } else {
    console.log(" Database connected");
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

module.exports = db;
