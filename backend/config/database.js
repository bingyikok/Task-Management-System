const mysql = require('mysql2/promise');
// const express = require('express');
require('dotenv').config({ path: './config/config.env' });

const connection = mysql.createPool({
    host: process.env.SQLHOST,
    port: process.env.SQLPORT,
    user: process.env.SQLUSER,
    password: process.env.SQLPW,
    database: process.env.SQLDB
})

module.exports = connection;