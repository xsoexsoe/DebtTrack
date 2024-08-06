const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();

// ให้ Express.js ใช้งาน CORS middleware
app.use(cors());

// ตั้งค่าการเชื่อมต่อกับ MySQL Database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'db_debttrack',
    port: 3300
});

// เชื่อมต่อกับ MySQL Database
connection.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

module.exports = connection;
