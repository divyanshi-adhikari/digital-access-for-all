const db = require("../database");

exports.insertScholar10 = (data, callback) => {
  const sql = `
    INSERT INTO scholarship_10th (name, school, marks, year)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, [data.name, data.school, data.marks, data.year], callback);
};

exports.getAllScholar10 = (callback) => {
  db.all("SELECT * FROM scholarship_10th ORDER BY id DESC", callback);
};