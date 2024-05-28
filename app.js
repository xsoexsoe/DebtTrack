const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const connection = require('./assets/db/db'); // เรียกใช้ไฟล์การเชื่อมต่อกับฐานข้อมูล
const cors = require('cors');

const app = express();

// ให้ Express.js ใช้งาน CORS middleware
app.use(cors());

// ตั้งค่า Multer เพื่อรับไฟล์ Excel
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ตั้งค่าเส้นทางสำหรับการอัพโหลดไฟล์
app.post('/upload121', upload.single('file'), (req, res) => {
    // ตรวจสอบว่าไฟล์ถูกอัพโหลดมาหรือไม่
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    // อ่านไฟล์ Excel
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log('Data from Excel:', JSON.stringify(data, null, 2));

    // เริ่มต้นการทำธุรกรรม
    connection.beginTransaction(err => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ message: 'Error starting transaction.' });
        }

        // ตรวจสอบข้อมูลที่มีการซ้ำในฐานข้อมูล
        const existingDataQuery = 'SELECT name FROM customer';
        connection.query(existingDataQuery, (err, results) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                return connection.rollback(() => {
                    res.status(500).json({ message: 'Error querying existing data.' });
                });
            }

            // กรองข้อมูลใหม่ที่ไม่มีในฐานข้อมูล
            const existingNames = results.map(result => result.name);
            const newData = data.filter(row => !existingNames.includes(row.name));

            // เตรียมคำสั่ง SQL สำหรับการเพิ่มข้อมูลในตาราง customer
            const sql1 = 'INSERT IGNORE INTO customer (ca, id_pea, pea_position, name) VALUES ?';
            const values1 = newData.map(row => [row.หมายเลขผู้ใช้ไฟฟ้า, row.BA, row["กฟฟ."], row.ชื่อ]);

            // เพิ่มข้อมูลในตาราง customer
            connection.query(sql1, [values1], (err, result1) => {
                if (err) {
                    console.error('Error executing SQL query:', err);
                    return connection.rollback(() => {
                        res.status(500).json({ message: 'Error uploading data to customer table.' });
                    });
                }

                // เตรียมคำสั่ง SQL สำหรับการเพิ่มข้อมูลในตารางอื่น
                const sql2 = 'INSERT INTO bills (money, tax, non_tax, bill_month, customer_ca, id_command) VALUES ?'; // แก้ไขให้ตรงกับตารางที่สองของคุณ
                const values2 = newData.map(row => [row.จำนวนเงิน, row.ภาษี, row.เงินไม่รวมภาษี, row.บิลเดือน, row.หมายเลขผู้ใช้ไฟฟ้า, row.คำสั่ง]); // แก้ไขให้ตรงกับข้อมูลที่ต้องการบันทึก

                // เพิ่มข้อมูลในตารางที่สอง
                connection.query(sql2, [values2], (err, result2) => {
                    if (err) {
                        console.error('Error executing SQL query:', err);
                        return connection.rollback(() => {
                            res.status(500).json({ message: 'Error uploading data to another table.' });
                        });
                    }

                    // ยืนยันการทำธุรกรรม
                    connection.commit(err => {
                        if (err) {
                            console.error('Error committing transaction:', err);
                            return connection.rollback(() => {
                                res.status(500).json({ message: 'Error committing transaction.' });
                            });
                        }

                        console.log('Data uploaded successfully to both tables:', result1, result2);
                        res.json({ message: 'Data uploaded successfully to both tables.' });
                    });
                });
            });
        });
    });
});
app.post('/upload030', upload.single('file'), (req, res) => {
    // const referer = req.headers.referer;
    // // เช็คว่า referer header มีค่าและเป็น 'uploadfile121.html' หรือไม่
    // if (!referer || !referer.includes('uploadfile121.html')) {
    //     return res.status(403).json({ message: 'Forbidden. Invalid Referer header.' });
    // }

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // ตรวจสอบข้อมูลที่มีการซ้ำในฐานข้อมูล
    const existingDataQuery = 'SELECT name FROM testt';
    connection.query(existingDataQuery, (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ message: 'Error querying existing data.' });
        }

        const existingNames = results.map(result => result.name);
        const newData = data.filter(row => !existingNames.includes(row.name));

        const sql = 'INSERT IGNORE testt (name, ca) VALUES ?';
        const values = data.map(row => [row.ชื่อ, row.หมายเลขผู้ใช้ไฟฟ้า]);

        connection.query(sql, [values], (err, result) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                return res.status(500).json({ message: 'Error uploading data.' });
            }
            console.log('Data uploaded successfully:', result);
            res.json({ message: 'Data uploaded successfully.' });
        });
    });
});



// ดึงข้อมูลมาแสดง
app.get('/data', (req, res) => {
    // คำสั่ง SQL สำหรับเลือกข้อมูล
    const sql = 'SELECT * FROM customer';

    // Query ข้อมูลจากฐานข้อมูล
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error querying database: ' + error.stack);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

// Endpoint to fetch holidays
app.get('/holidays', (req, res) => {
    const sql = 'SELECT date, description FROM holiday';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching holidays:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

// เริ่มต้นเซิร์ฟเวอร์ที่พอร์ต 5500
app.listen(5500, () => {
    console.log('Server is running on port 5500');
});
