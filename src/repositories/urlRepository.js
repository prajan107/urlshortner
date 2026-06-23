const db = require("../../db");

function createUrl(originalUrl, shortCode, expiresAt, callback) {
    const sql =
        "INSERT INTO urls (original_url, short_code, expires_at) VALUES (?,?, ?)";

    db.query(
        sql,
        [originalUrl, shortCode, expiresAt ],
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
function recordVisit(urlId, callback) {

    db.query(
        "INSERT INTO url_visits (url_id) VALUES (?)",
        [urlId],
        callback
    );
}
function getVisitCount(code, callback) {

    const sql = `
        SELECT COUNT(v.id) AS totalVisits
        FROM urls u
        LEFT JOIN url_visits v
        ON u.id = v.url_id
        WHERE u.short_code = ?
    `;

    db.query(
        sql,
        [code],
        callback
    );
}

module.exports = {
    createUrl,
    findByCode,
    recordVisit,
    getVisitCount
};