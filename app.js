const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const connection = require('./assets/db/db'); // เรียกใช้ไฟล์การเชื่อมต่อกับฐานข้อมูล
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // ใช้ body-parser เพื่ออ่าน JSON payloads
app.use(bodyParser.urlencoded({ extended: true })); // ใช้ body-parser เพื่ออ่าน URL-encoded payloads


// ให้ Express.js ใช้งาน CORS middleware
app.use(cors());

// ตั้งค่า Multer เพื่อรับไฟล์ Excel
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ตั้งค่าเส้นทางสำหรับการอัพโหลดไฟล์
app.post('/upload121', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // ฟังก์ชันสำหรับการแปลงวันที่จาก พ.ศ. เป็น ค.ศ.
    const convertThaiToGregorian = (thaiDate) => {
        const [month, thaiYear] = thaiDate.split('.');
        const gregorianYear = parseInt(thaiYear, 10) - 543;
        return `${month}.${gregorianYear}`;
    };

    connection.beginTransaction(err => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ message: 'Error starting transaction.' });
        }

        const existingDataQuery = 'SELECT name FROM customer';
        connection.query(existingDataQuery, (err, results) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                return connection.rollback(() => {
                    res.status(500).json({ message: 'Error querying existing data.' });
                });
            }

            const existingNames = results.map(result => result.name);
            const newData = data.filter(row => !existingNames.includes(row.name));

            const sql1 = 'INSERT IGNORE INTO customer (ca, id_pea, pea_position, name) VALUES ?';
            const values1 = newData.map(row => [row.หมายเลขผู้ใช้ไฟฟ้า, row.BA, row["กฟฟ."], row.ชื่อ]);

            connection.query(sql1, [values1], (err, result1) => {
                if (err) {
                    console.error('Error executing SQL query:', err);
                    return connection.rollback(() => {
                        res.status(500).json({ message: 'Error uploading data to customer table.' });
                    });
                }

                const sql2 = 'INSERT INTO bills (money, tax, non_tax, bill_month, status, customer_ca, id_command) VALUES ?';
                const values2 = newData.map(row => [
                    row.จำนวนเงิน,
                    row.ภาษี,
                    row.เงินไม่รวมภาษี,
                    convertThaiToGregorian(row.บิลเดือน), // แปลงวันที่จาก พ.ศ. เป็น ค.ศ.
                    'ยังไม่ดำเนินการ',
                    row.หมายเลขผู้ใช้ไฟฟ้า,
                    row.คำสั่ง
                ]);

                connection.query(sql2, [values2], (err, result2) => {
                    if (err) {
                        console.error('Error executing SQL query:', err);
                        return connection.rollback(() => {
                            res.status(500).json({ message: 'Error uploading data to another table.' });
                        });
                    }

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

const convertExcelDateToJSDate = (serial) => {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel starts on 30 Dec 1899
    const jsDate = new Date(excelEpoch.getTime() + (serial - 1) * 86400 * 1000);
    return jsDate;
};

const convertThaiDateToGregorian = (thaiDate) => {
    if (typeof thaiDate !== 'string') {
        console.error('Invalid date format:', thaiDate);
        return null;
    }

    const [day, month, thaiYear] = thaiDate.split('/');
    if (!day || !month || !thaiYear) {
        console.error('Invalid date format:', thaiDate);
        return null;
    }

    const gregorianYear = parseInt(thaiYear, 10) - 543;
    return `${month}.${gregorianYear}`;
};

const isValidThaiDate = (date) => {
    if (typeof date === 'string' && date.split('/').length === 3) {
        return true;
    }
    return false;
};

app.post('/upload030', upload.single('file'), (req, res) => {
    if (!req.file) {
        console.error('No file uploaded.');
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log('Data read from Excel:', data);

    connection.beginTransaction(err => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ message: 'Error starting transaction.' });
        }
        console.log('Transaction started.');

        const updatePromises = data.map(row => {
            return new Promise((resolve, reject) => {
                let billMonth = row.บิลเดือน;

                if (typeof billMonth === 'number') {
                    // แปลงตัวเลขเป็นวันที่
                    const dateObj = convertExcelDateToJSDate(billMonth);
                    const day = dateObj.getUTCDate();
                    const month = dateObj.getUTCMonth() + 1; // เดือนใน JavaScript เริ่มจาก 0
                    const year = dateObj.getUTCFullYear();
                    billMonth = `${day}/${month}/${year}`;
                    console.log(`Converted numeric bill month to date: ${billMonth}`);
                }

                if (!isValidThaiDate(billMonth)) {
                    console.error('Missing or invalid bill month for row:', row);
                    return reject(new Error(`Missing or invalid bill month for row: ${JSON.stringify(row)}`));
                }

                const gregorianBillMonth = convertThaiDateToGregorian(billMonth);
                if (!gregorianBillMonth) {
                    console.error('Invalid date format for row:', row);
                    return reject(new Error(`Invalid date format for row: ${JSON.stringify(row)}`));
                }

                const checkSql = 'SELECT * FROM bills WHERE customer_ca = ? AND bill_month = ?';
                connection.query(checkSql, [row.หมายเลขผู้ใช้ไฟฟ้า, gregorianBillMonth], (error, results) => {
                    if (error) {
                        console.error('Error executing SELECT query:', error);
                        return reject(error);
                    }
                    console.log('SELECT query results:', results);

                    if (results.length > 0) {
                        
                        // ถ้าพบข้อมูลตรงกัน ให้ทำการอัปเดตสถานะ
                        const updateSql = 'UPDATE bills SET status = ? WHERE customer_ca = ? AND bill_month = ?';
                        connection.query(updateSql, ['ชำระเงินเรียบร้อยแล้ว', row.หมายเลขผู้ใช้ไฟฟ้า, gregorianBillMonth], (error, results) => {
                            if (error) {
                                console.error('Error executing UPDATE query:', error);
                                return reject(error);
                            }
                            console.log('UPDATE query results:', results);
                            resolve(results);
                        });
                    } else {
                        console.log('No matching records found for:', row.หมายเลขผู้ใช้ไฟฟ้า, gregorianBillMonth);
                        resolve(null); // ไม่มีการอัปเดตถ้าไม่พบข้อมูลตรงกัน
                    }
                });
            });
        });

        Promise.all(updatePromises)
            .then(results => {
                connection.commit(err => {
                    if (err) {
                        console.error('Error committing transaction:', err);
                        return connection.rollback(() => {
                            res.status(500).json({ message: 'Error committing transaction.' });
                        });
                    }
                    console.log('Transaction committed.');
                    res.json({ message: 'Data processed successfully.' });
                });
            })
            .catch(error => {
                console.error('Error processing data:', error);
                connection.rollback(() => {
                    res.status(500).json({ message: 'Error processing data.' });
                });
            });
    });
});


// ฟังก์ชันเพื่อ query ข้อมูล
function queryDatabase(sql) {
    return new Promise((resolve, reject) => {
        connection.query(sql, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}


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
// ดึงข้อมูลมาแสดง
app.get('/data', (req, res) => {
    const sqlCount = `
        SELECT id_command, customer_ca, COUNT(*) AS count_bills
        FROM bills
        GROUP BY id_command, customer_ca
        HAVING COUNT(*) >= 1;
    `;

    const sqlSumMoney = `
        SELECT id_command, customer_ca, ROUND(SUM(money), 2) as total_money
        FROM bills
        GROUP BY id_command, customer_ca
        HAVING COUNT(*) >= 1;
    `;

    const sqlJoin = `
        SELECT customer.*, bills.*
        FROM customer
        INNER JOIN bills ON customer.ca = bills.customer_ca;
    `;

    const sqlCustomerHasBills = `
        SELECT * FROM customer_has_bills;
    `;

    connection.query(sqlSumMoney, (error, sumMoneyResults) => {
        if (error) {
            console.error('Error querying database (sum money): ' + error.stack);
            res.status(500).send('Internal Server Error');
            return;
        }

        connection.query(sqlCount, (error, countResults) => {
            if (error) {
                console.error('Error querying database (count): ' + error.stack);
                res.status(500).send('Internal Server Error');
                return;
            }

            connection.query(sqlJoin, (error, joinResults) => {
                if (error) {
                    console.error('Error querying database (join): ' + error.stack);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                connection.query(sqlCustomerHasBills, (error, customerHasBillsResults) => {
                    if (error) {
                        console.error('Error querying database (customer has bills): ' + error.stack);
                        res.status(500).send('Internal Server Error');
                        return;
                    }

                    res.json({
                        sumMoneyResults: sumMoneyResults,
                        countResults: countResults,
                        joinResults: joinResults,
                        customerHasBillsResults: customerHasBillsResults
                    });
                });
            });
        });
    });
});

app.post('/save-date', (req, res) => {
    const { customer_ca, id_command, date, bills_id } = req.body;

    if (!customer_ca || !id_command || !date || !bills_id) {
        res.status(400).send('Bad Request: Missing required fields');
        return;
    }
    
    // SQL เพื่อเช็คว่ามีข้อมูลอยู่ในตารางหรือไม่
    const checkSql = `
        SELECT * FROM customer_has_bills 
        WHERE customer_ca = ? AND bills_id = ?;
    `;

    // SQL เพื่อเพิ่มข้อมูลใหม่
    const insertSql = `
        INSERT INTO customer_has_bills (customer_ca, bills_id, date_system, date_employee) 
        VALUES (?, ?, ?, ?);
    `;

    // SQL เพื่ออัปเดตข้อมูล
    const updateSql = `
        UPDATE customer_has_bills 
        SET date_system = ?, date_employee = ? 
        WHERE customer_ca = ? AND bills_id = ?;
    `;

    connection.query(checkSql, [customer_ca, bills_id], (error, results) => {
        if (error) {
            console.error('Error querying database: ' + error.stack);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (results.length > 0) {
            // ถ้ามีข้อมูลอยู่แล้ว อัปเดตข้อมูล
            connection.query(updateSql, [date, date, customer_ca, bills_id], (error, results) => {
                if (error) {
                    console.error('Error updating database: ' + error.stack);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.send('Date updated successfully');
            });
        } else {
            // ถ้าไม่มีข้อมูล เพิ่มข้อมูลใหม่
            connection.query(insertSql, [customer_ca, bills_id, date, date], (error, results) => {
                if (error) {
                    console.error('Error inserting into database: ' + error.stack);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.send('Date inserted successfully');
            });
        }
    });
});

// เริ่มต้นเซิร์ฟเวอร์ที่พอร์ต 5500
app.listen(5500, () => {
    console.log('Server is running on port 5500');
});



