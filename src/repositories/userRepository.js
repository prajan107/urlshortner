const db = require("../../db");

function createUser(
    username,
    email,
    password,
    callback
){

    const sql =
        `INSERT INTO users
        (username, email, password)
        VALUES (?, ?, ?)`;

    db.query(
        sql,
        [username, email, password],
        callback
    );
}
function findByEmail(email) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE email = ?";

        db.query(sql, [email], (err, results) => {
            if (err) {
                return reject(err);
            }

            resolve(results[0]);
        });
    });
}

module.exports = {
    createUser,
    findByEmail
};