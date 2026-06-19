const db = require("../../db");

function createUrl(originalUrl, shortCode, callback) {
    const sql =
        "INSERT INTO urls (original_url, short_code) VALUES (?, ?)";

    db.query(
        sql,
        [originalUrl, shortCode],
        callback
    );
}

function findByCode(code, callback) {
    db.query(
        "SELECT * FROM urls WHERE short_code=?",
        [code],
        callback
    );
}

module.exports = {
    createUrl,
    findByCode
};