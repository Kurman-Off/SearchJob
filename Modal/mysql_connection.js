const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '12345',
    database: 'searchjob_db',
});

module.exports = connection;