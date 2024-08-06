const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const connection = require('./assets/db/db'); // เรียกใช้ไฟล์การเชื่อมต่อกับฐานข้อมูล
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path'); // ต้องมีบรรทัดนี้ในการใช้งาน path module
const app = express();
require('dotenv').config();

app.use(bodyParser.json()); // ใช้ body-parser เพื่ออ่าน JSON payloads
app.use(bodyParser.urlencoded({ extended: true })); // ใช้ body-parser เพื่ออ่าน URL-encoded payloads


// ให้ Express.js ใช้งาน CORS middleware
app.use(cors());
const api = process.env.BASE_URL;
console.log(api);

// ตั้งค่าเสิร์ฟไฟล์จากโฟลเดอร์ assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/uploadfile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'uploadfile.html'));
});
app.get('/table.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'table.html'));
});
app.get('/report.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'report.html'));
});
app.get('/holidays.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'holidays.html'));
});
app.get('/mapdebtt.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'mapdebtt.html'));
});
// Serve the form.html file
app.get('/form.html', (req, res) => {
    const params = req.query;
    console.log(params); // แสดง query parameters ใน console
    res.sendFile(path.join(__dirname, 'form.html'));
});

//นับจำนวนหน้าแรก
app.get('/api/status-counts', (req, res) => {
    const sql = `
        SELECT status, COUNT(*) as count
        FROM bills
        GROUP BY status;
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching status counts:', err);
            res.status(500).json({ message: 'Error fetching status counts' });
            return;
        }
        
        const statusCounts = results.reduce((acc, row) => {
            acc[row.status] = row.count;
            return acc;
        }, {});

        res.json(statusCounts);
    });
});

app.get('/api/responsible-counts', (req, res) => {
    const sqlPea = `
        SELECT COUNT(*) AS pea_responsible_count 
        FROM customer_has_bills 
        WHERE day_pea > 0;
    `;

    const sqlEmployee = `
        SELECT COUNT(*) AS employee_responsible_count 
        FROM customer_has_bills 
        WHERE day_employee > 0;
    `;

    const sqlContractor = `
        SELECT COUNT(*) AS contractor_responsible_count 
        FROM customer_has_bills 
        WHERE day_company > 0;
    `;

    // Execute all queries
    connection.query(sqlPea, (err, peaResults) => {
        if (err) {
            console.error('Error fetching PEA responsible count:', err);
            res.status(500).json({ message: 'Error fetching PEA responsible count' });
            return;
        }

        connection.query(sqlEmployee, (err, employeeResults) => {
            if (err) {
                console.error('Error fetching employee responsible count:', err);
                res.status(500).json({ message: 'Error fetching employee responsible count' });
                return;
            }

            connection.query(sqlContractor, (err, contractorResults) => {
                if (err) {
                    console.error('Error fetching contractor responsible count:', err);
                    res.status(500).json({ message: 'Error fetching contractor responsible count' });
                    return;
                }

                res.json({
                    pea_responsible_count: peaResults[0].pea_responsible_count,
                    employee_responsible_count: employeeResults[0].employee_responsible_count,
                    contractor_responsible_count: contractorResults[0].contractor_responsible_count,
                });
            });
        });
    });
});



// ตั้งค่า Multer เพื่อรับไฟล์ Excel
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload-etsx', upload.single('file'), (req, res) => {
    if (!req.file) {
        console.error('No file uploaded.');
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    let workbook;
    try {
        workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    } catch (error) {
        console.error('Error reading Excel file:', error);
        return res.status(500).json({ success: false, message: 'Error reading Excel file.', error: error.message });
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null }); // Set default value to null for empty cells

    console.log('Rows extracted from Excel:', rows); // Debugging log

    try {
        const updatePromises = rows.map(row => {
            // Convert CA_NO to string and remove the first character
            const originalCaNo = row.CA_NO ? row.CA_NO.toString() : null;
            const caNo = originalCaNo ? originalCaNo.substring(1) : null;

            // Check required fields
            if (row.Latitude == null || row.Longitude == null || row.Address == null || !caNo) {
                console.error('Missing required fields in row:', row);
                throw new Error('Missing required fields in row: ' + JSON.stringify(row));
            }

            console.log(`Processing CA_NO: ${originalCaNo} => ${caNo}`); // Debugging log

            // Prepare the SQL query using placeholders
            const updateQuery = `UPDATE customer SET latitude = ?, longitude = ?, address = ? WHERE ca = ?`;

            // Return a promise to execute the query
            return new Promise((resolve, reject) => {
                connection.query(updateQuery, [row.Latitude, row.Longitude, row.Address, caNo], (err, result) => {
                    if (err) {
                        console.error('Database update failed:', err);
                        return reject(err);
                    }
                    resolve(result);
                });
            });
        });

        // Execute all update queries
        Promise.all(updatePromises)
            .then(results => {
                console.log('Database updated successfully.');
                res.json({ success: true, message: 'Database updated successfully.' });
            })
            .catch(error => {
                console.error('Error processing updates:', error);
                res.status(500).json({ success: false, message: 'Database update failed.', error: error.message });
            });

    } catch (error) {
        console.error('Error processing rows:', error);
        res.status(500).json({ success: false, message: 'Error processing rows.', error: error.message });
    }
});

// API เพื่อดึงข้อมูล id_command
app.get('/api/id_commands', (req, res) => {
    const sql = 'SELECT id_command FROM bills';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching id_command:', err);
            res.status(500).json({ message: 'Error fetching id_command' });
            return;
        }
        
        const idCommands = results.map(row => row.id_command);
        res.json(idCommands);
    });
});

// ตั้งค่าเส้นทางสำหรับการอัพโหลดไฟล์
app.post('/upload121', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const orderNumber = req.body.orderNumber;
    const year = req.body.year;
    const id_command = `${orderNumber}/${year}`;

    const convertThaiToGregorian = (thaiDate) => {
        if (typeof thaiDate !== 'string') {
            console.error('รูปแบบวันที่ไม่ถูกต้อง:', thaiDate);
            return null; // หรือจัดการข้อผิดพลาดตามความเหมาะสม
        }
    
        const [month, thaiYear] = thaiDate.split('.');
        if (!month || !thaiYear) {
            console.error('รูปแบบวันที่ไม่ถูกต้อง:', thaiDate);
            return null;
        }
    
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

                const sql2Check = 'SELECT * FROM bills WHERE customer_ca = ? AND bill_month = ? AND id_command = ?';
                const sql2Insert = 'INSERT INTO bills (money, tax, non_tax, bill_month, status, customer_ca, id_command) VALUES ?';

                const checkPromises = newData.map(row => {
                    const billMonth = convertThaiToGregorian(row.บิลเดือน);

                    return new Promise((resolve, reject) => {
                        connection.query(sql2Check, [row.หมายเลขผู้ใช้ไฟฟ้า, billMonth, id_command], (err, results) => {
                            if (err) {
                                console.error('Error executing SQL query:', err);
                                return reject(err);
                            }

                            if (results.length === 0) {
                                resolve([
                                    row.จำนวนเงิน,
                                    row.ภาษี,
                                    row.เงินไม่รวมภาษี,
                                    billMonth,
                                    'ยังไม่ดำเนินการ',
                                    row.หมายเลขผู้ใช้ไฟฟ้า,
                                    id_command
                                ]);
                            } else {
                                resolve(undefined);
                            }
                        });
                    });
                });

                Promise.all(checkPromises)
                    .then(values2Insert => {
                        values2Insert = values2Insert.filter(value => value !== undefined);

                        if (values2Insert.length > 0) {
                            connection.query(sql2Insert, [values2Insert], (err, result2) => {
                                if (err) {
                                    console.error('Error executing SQL query:', err);
                                    return connection.rollback(() => {
                                        res.status(500).json({ message: 'Error uploading data to bills table.' });
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
                        } else {
                            connection.commit(err => {
                                if (err) {
                                    console.error('Error committing transaction:', err);
                                    return connection.rollback(() => {
                                        res.status(500).json({ message: 'Error committing transaction.' });
                                    });
                                }

                                console.log('Data uploaded successfully to customer table, no new bills data.');
                                res.json({ message: 'Data uploaded successfully to customer table, no new bills data.', noNewBills: true });
                            });
                        }
                    })
                    .catch(err => {
                        console.error('Error processing data:', err);
                        connection.rollback(() => {
                            res.status(500).json({ message: 'Error processing data.' });
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

    let gregorianYear = parseInt(thaiYear, 10) - 543;
    let gregorianMonth = parseInt(month, 10) + 1; // Add 1 month

    if (gregorianMonth > 12) {
        // If the month exceeds December, adjust the year and month accordingly
        gregorianYear += 1;
        gregorianMonth = 1; // January
    }

    const paddedMonth = gregorianMonth.toString().padStart(2, '0');
    return `${paddedMonth}.${gregorianYear}`;
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
    // console.log('Data read from Excel:', data);

    // กำหนดตัวแปร orderNumber และ year จาก req.body
    const orderNumber = req.body.orderNumber;
    const year = req.body.year;

    if (!orderNumber || !year) {
        console.error('Order number or year not provided.');
        return res.status(400).json({ message: 'Order number or year not provided.' });
    }

    console.log('Order Number:', orderNumber);
    console.log('Year:', year);

    connection.beginTransaction(err => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ message: 'Error starting transaction.' });
        }
        console.log('Transaction started.');

        const updatePromises = data.map(row => {
            return new Promise((resolve, reject) => {
                let billMonth = row.บิลเดือน;
                const id_command = `${orderNumber}/${year}`;

                if (typeof billMonth === 'number') {
                    const dateObj = convertExcelDateToJSDate(billMonth);
                    const day = dateObj.getUTCDate();
                    const month = dateObj.getUTCMonth() + 1;
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

                const updateToPaidSql = 'UPDATE bills SET status = ? WHERE id_command = ?';
                connection.query(updateToPaidSql, ['ชำระเงินแล้ว', id_command], (error, results) => {
                    if (error) {
                        console.error('Error executing UPDATE to paid query:', error);
                        return reject(error);
                    }
                    console.log('UPDATE to paid query results:', results);

                    const checkSql = 'SELECT * FROM bills WHERE customer_ca = ? AND bill_month = ?';
                    connection.query(checkSql, [row.หมายเลขผู้ใช้ไฟฟ้า, gregorianBillMonth], (error, results) => {
                        if (error) {
                            console.error('Error executing SELECT query:', error);
                            return reject(error);
                        }
                        console.log('SELECT query results:', results);
                        console.log('SELECT ', gregorianBillMonth);
                        if (results.length > 0) {
                            const updateToUnpaidSql = 'UPDATE bills SET status = ? WHERE customer_ca = ? AND bill_month = ? AND id_command = ?';
                            console.log('Executing UPDATE to unpaid query with:', ['ยังไม่ได้ชำระเงิน', row.หมายเลขผู้ใช้ไฟฟ้า, gregorianBillMonth, id_command]);
                            connection.query(updateToUnpaidSql, ['ยังไม่ได้ชำระเงิน', row.หมายเลขผู้ใช้ไฟฟ้า, gregorianBillMonth, id_command], (error, results) => {
                                if (error) {
                                    console.error('Error executing UPDATE to unpaid query:', error);
                                    return reject(error);
                                }
                                console.log('UPDATE to unpaid query results:', results);
                                resolve(results);
                            });
                        } else {
                            resolve(results);
                        }
                    });
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

// Endpoint สำหรับดึงข้อมูลวันหยุด
app.get('/api/holidays', (req, res) => {
    const sql = 'SELECT id, date, description FROM holiday';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching holidays:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

// Endpoint สำหรับบันทึกวันหยุด
app.post('/add_holiday', (req, res) => {
    const { date, description } = req.body;

    if (!date || !description) {
        res.status(400).send('Bad Request: Missing required fields');
        return;
    }

    // ตรวจสอบว่ามีวันที่นี้อยู่แล้วหรือไม่
    const checkDuplicateSql = 'SELECT * FROM holiday WHERE date = ?';
    connection.query(checkDuplicateSql, [date], (err, results) => {
        if (err) {
            console.error('Error checking duplicate holiday:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (results.length > 0) {
            // ถ้ามีวันที่นี้อยู่แล้ว
            res.status(400).send('Duplicate holiday date');
            return;
        }

        // ถ้าไม่มีวันที่นี้ ให้ดำเนินการเพิ่มข้อมูล
        const sql = 'INSERT INTO holiday (date, description) VALUES (?, ?)';
        connection.query(sql, [date, description], (err, results) => {
            if (err) {
                console.error('Error adding holiday:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.send('Holiday added successfully');
        });
    });
});

// Endpoint สำหรับดึงข้อมูลวันหยุดโดย ID
app.get('/holidays/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT id, date, description FROM holiday WHERE id = ?';
    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error fetching holiday:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results[0]);
    });
});

// Endpoint สำหรับอัพเดตวันหยุด
app.put('/update_holiday/:id', (req, res) => {
    const { id } = req.params;
    const { date, description } = req.body;

    // เพิ่มการตรวจสอบค่าที่ได้รับมา
    console.log('Update Holiday ID:', id);
    console.log('Date:', date);
    console.log('Description:', description);

    const sql = 'UPDATE holiday SET date = ?, description = ? WHERE id = ?';
    connection.query(sql, [date, description, id], (err, results) => {
        if (err) {
            console.error('Error updating holiday:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send('Holiday updated successfully');
    });
});


// Endpoint สำหรับลบวันหยุด
app.delete('/delete_holiday/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM holiday WHERE id = ?';
    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error deleting holiday:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send('Holiday deleted successfully');
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

// ฟังก์ชันจัดการการบันทึกข้อมูล
app.post('/save-data', upload.fields([{ name: 'file1' }, { name: 'file2' }]), (req, res) => {
    try {
        console.log('Form data received:', req.body);

        const customerCa = req.body.customer_ca;
        console.log('Customer CA:', customerCa);

        if (!customerCa) {
            throw new Error('Missing customer_ca value');
        }

        const tableData = req.body.tableData;
        const table = JSON.parse(tableData); // แปลง string เป็น JSON

        // ดึงไฟล์จาก req.files
        const file1 = req.files['file1'] ? req.files['file1'][0] : null;
        const file2 = req.files['file2'] ? req.files['file2'][0] : null;

        // ดีบักข้อมูลไฟล์
        console.log('File1:', file1);
        console.log('File2:', file2);

        // ใช้ buffer โดยตรงจาก multer
        const file1Content = file1 ? file1.buffer : null;
        const file2Content = file2 ? file2.buffer : null;

        table.forEach((bill) => {
            const { 
                id,
                dateRegis,
                startDate, 
                endDate, 
                dateSystem, 
                dateEmployee, 
                dateDeferment, 
                dateDeferment2, 
                dateCompany, 
                daysEmployee, 
                daysCompany, 
                daysPea, 
                amountPay, 
                amountEmployee, 
                amountCompany, 
                amountPea 
            } = bill;

            const details = `กฟภ. ${daysPea} วัน ${amountPea} บาท, พนง. ${daysEmployee} วัน ${amountEmployee} บาท, ผรจ. ${daysCompany} วัน ${amountCompany} บาท`;

            // ตรวจสอบว่ามีบันทึกอยู่แล้วหรือไม่
            connection.query(
                `SELECT * FROM customer_has_bills WHERE customer_ca = ? AND bills_id = ?`,
                [customerCa, id],
                (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        return res.status(500).json({ success: false, error: err.message });
                    }

                    if (results.length > 0) {
                        // อัปเดตบันทึกที่มีอยู่แล้ว
                        connection.query(
                            `UPDATE customer_has_bills 
                            SET date_system = ?, date_employee = ?, date_company = ?, date_deferment = ?, date_deferment2 = ?, 
                            image_regis = ?, image_cutmeter = ?, 
                            day_employee = ?, day_company = ?, day_pea = ?, 
                            money_employee = ?, money_company = ?, money_pea = ?,
                            details = ?
                            WHERE customer_ca = ? AND bills_id = ?`,
                            [
                                formatSQLDate(dateSystem), 
                                formatSQLDate(dateEmployee), 
                                formatSQLDate(dateCompany), 
                                formatSQLDate(dateDeferment), 
                                formatSQLDate(dateDeferment2), 
                                file1Content,
                                file2Content,
                                daysEmployee, 
                                daysCompany, 
                                daysPea, 
                                amountEmployee, 
                                amountCompany, 
                                amountPea,
                                details,
                                customerCa, 
                                id
                            ],
                            (err) => {
                                if (err) {
                                    console.error('Error updating record:', err);
                                    return res.status(500).json({ success: false, error: err.message });
                                }
                            }
                        );
                    } else {
                        // แทรกบันทึกใหม่
                        connection.query(
                            `INSERT INTO customer_has_bills (customer_ca, bills_id, date_system, date_employee, date_company, date_deferment, date_deferment2, 
                            image_regis, image_cutmeter, day_employee, day_company, day_pea, money_employee, money_company, money_pea, details) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                customerCa, 
                                id, 
                                formatSQLDate(dateSystem), 
                                formatSQLDate(dateEmployee), 
                                formatSQLDate(dateCompany), 
                                formatSQLDate(dateDeferment), 
                                formatSQLDate(dateDeferment2), 
                                file1Content,
                                file2Content,
                                daysEmployee, 
                                daysCompany, 
                                daysPea, 
                                amountEmployee, 
                                amountCompany, 
                                amountPea,
                                details
                            ],
                            (err) => {
                                if (err) {
                                    console.error('Error inserting record:', err);
                                    return res.status(500).json({ success: false, error: err.message });
                                }
                            }
                        );
                    }

                    // อัปเดตตาราง bills
                    connection.query(
                        `UPDATE bills 
                        SET 
                            status = 'ดำเนินการแล้ว', 
                            date_regis = ?, 
                            bill_start = ?, 
                            bill_end = ?
                        WHERE 
                            customer_ca = ? AND id = ?`,
                        [
                            formatSQLDate(dateRegis), // ใช้วันที่ปัจจุบัน
                            formatSQLDate(startDate), 
                            formatSQLDate(endDate), 
                            customerCa, 
                            id
                        ],
                        (err) => {
                            if (err) {
                                console.error('Error updating bills table:', err);
                                return res.status(500).json({ success: false, error: err.message });
                            }
                        }
                    );
                }
            );
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});




// ฟังก์ชันจัดรูปแบบวันที่ให้ตรงกับ SQL
function formatSQLDate(date) {
    if (!date) return null;

    // ตรวจสอบว่า date เป็น Date object หรือไม่
    if (!(date instanceof Date)) {
        // ลองแปลง string หรือค่าอื่นๆ เป็น Date object
        date = new Date(date);
    }

    // ตรวจสอบว่าการแปลงสำเร็จหรือไม่
    if (isNaN(date)) {
        console.error('Invalid date:', date);
        return null;
    }

    // ถ้าต้องการให้เป็น YYYY-MM-DD สำหรับ SQL
    const [month, day, year] = [date.getMonth() + 1, date.getDate(), date.getFullYear()];
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}



app.get('/debtors', (req, res) => {
    const sql = 'SELECT name, latitude, longitude FROM customer';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});