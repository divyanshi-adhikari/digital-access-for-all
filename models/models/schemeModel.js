const db = require("../server");

exports.insertScheme = (data, callback) => {
  const sql = `
    INSERT INTO government_schemes (name, dob, state, city, address, category, income)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(
    sql,
    [
      data.name,
      data.dob,
      data.state,
      data.city,
      data.address,
      data.category,
      data.income
    ],
    callback
  );
};

exports.getAllSchemes = (callback) => {
  db.all("SELECT * FROM government_schemes", callback);
};
