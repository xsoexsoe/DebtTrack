// const express = require('express');
// const multer = require('multer');
// const XLSX = require('xlsx');
// const mysql = require('mysql');
// const cors = require('cors');

// const app = express();

// // ให้ Express.js ใช้งาน CORS middleware
// app.use(cors());

// // ตั้งค่าการเชื่อมต่อกับ MySQL Database
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'root',
//     database: 'db_debttrack'
// });

// // เชื่อมต่อกับ MySQL Database
// connection.connect(err => {
//     if (err) {
//         console.error('Error connecting to database:', err);
//         return;
//     }
//     console.log('Connected to MySQL database');
// });

// // ตั้งค่า Multer เพื่อรับไฟล์ Excel
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// // รับไฟล์ Excel และบันทึกข้อมูลลงในฐานข้อมูล
// app.post('/upload', upload.single('file'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ message: 'No file uploaded.' });
//     }

//     const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const data = XLSX.utils.sheet_to_json(sheet);

//     // ตรวจสอบข้อมูลที่มีการซ้ำในฐานข้อมูล
//     const existingDataQuery = 'SELECT name FROM testt';
//     connection.query(existingDataQuery, (err, results) => {
//         if (err) {
//             console.error('Error executing SQL query:', err);
//             return res.status(500).json({ message: 'Error querying existing data.' });
//         }

//         const existingNames = results.map(result => result.name);
//         const newData = data.filter(row => !existingNames.includes(row.name));

//     const sql = 'INSERT IGNORE testt (name, ca) VALUES ?';
//     const values = data.map(row => [row.ชื่อ, row.หมายเลขผู้ใช้ไฟฟ้า]);

//     connection.query(sql, [values], (err, result) => {
//         if (err) {
//             console.error('Error executing SQL query:', err);
//             return res.status(500).json({ message: 'Error uploading data.' });
//         }
//         console.log('Data uploaded successfully:', result);
//         res.json({ message: 'Data uploaded successfully.' });
//     });
// });
// });
// // เริ่มต้นเซิร์ฟเวอร์ที่พอร์ต 5500
// app.listen(5500, () => {
//     console.log('Server is running on port 5500');
// });
