const db = require("../database");

exports.insertScholar12 = (data, callback) => {
  const sql = `
    INSERT INTO scholarship_12th (name, college, marks, year)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, [data.name, data.college, data.marks, data.year], callback);
};

exports.getAllScholar12 = (callback) => {
  db.all("SELECT * FROM scholarship_12th ORDER BY id DESC", callback);
};