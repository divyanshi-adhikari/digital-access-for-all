const db = require("../server");

exports.insertRation = (data, callback) => {
  db.run(
    `INSERT INTO ration_cards (name, category, ration_number, family_members)
     VALUES (?, ?, ?, ?)`,
    [data.name, data.category, data.ration_number, data.family_members],
    callback
  );
};

exports.getAllRations = (callback) => {
  db.all("SELECT * FROM ration_cards", callback);
};
