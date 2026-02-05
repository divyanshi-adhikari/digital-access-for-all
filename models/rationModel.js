const db = require("../server");

exports.insertRation = (data,callback)=>{
    const sql = `
     INSERT INTO ration_card (name,category, ration_number, family_member)
     VALUES (?,?,?,?)
    `;
    db.run(
        sql,
        [data.name, data.category, data.ration_number, data.family_member],
        callback
    );
};
exports.getALLRation = (callback) =>{
    db.all("SELECT * FROM ration_card", callback)
};

    
