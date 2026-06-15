const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "system911",
    database: "url_shortener"
});

connection.connect((err)=>{
    if(err) throw err;
    console.log("MySQL Connected");
});

module.exports = connection;