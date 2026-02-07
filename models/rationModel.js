const db = require("../database");

exports.createRation = (data, callback) => {
  const sql = `
    INSERT INTO ration_cards (name, category, ration_number, family_members)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, [data.name, data.category, data.ration_number, data.family_members], callback);
};

exports.getAllRations = (callback) => {
  db.all("SELECT * FROM ration_cards ORDER BY id DESC", callback);
};