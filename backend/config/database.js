const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config/config.env' });

const connection = mysql.createPool({
    host: process.env.SQLHOST,
    port: process.env.SQLPORT,
    user: process.env.SQLUSER,
    password: process.env.SQLPW,
    database: process.env.SQLDB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

module.exports = connection;