const puppeteer = require('puppeteer');
const path = require('path');

// ฟังก์ชันสำหรับสร้าง PDF จากข้อมูลที่ดึงมาจากฐานข้อมูล
async function generatePDF(data) {
    // กำหนดเส้นทางไปยังไฟล์ฟอนต์
    const fontPath = path.join(__dirname, 'public', 'fonts', 'THSarabunNew.ttf');

    // เนื้อหา HTML ที่จะถูกแปลงเป็น PDF
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>รายละเอียดหนี้ค่าไฟฟ้าที่ค้างชำระ</title>
            <style>
                @font-face {
                    font-family: 'THSarabunNew';
                    src: url('file://${fontPath}') format('truetype');
                }
                body {
                    font-family: 'THSarabunNew', Arial, sans-serif;
                    padding: 20px;
                }
                h1 {
                    text-align: center;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: center;
                }
                th {
                    background-color: #f2f2f2;
                }
            </style>
        </head>
        <body>
            <h1>รายละเอียดหนี้ค่าไฟฟ้าที่ค้างชำระ</h1>
            <p>รหัส: E14201 กฟน.: การไฟฟ้าส่วนภูมิภาคอำเภอเขมราฐ</p>
            <p>หมายเลขผู้ใช้ไฟ (CA): 020012480099 สถานีการจดหน่วย (MRU): EKML0216 คลาสบัญชี: เอกชน - รายย่อย</p>
            <p>ชื่อ นาง เดือนใจ ลุภะโกตร สถานที่ใช้ไฟ 55 บ.ดอนบางนิล ม.10 ต.พะลาน อ.นาตาล จ.อุบลราชธานี 34170</p>
            <table>
                <thead>
                    <tr>
                        <th>ที่</th>
                        <th>บิลเดือน</th>
                        <th>วันที่ครบกำหนด</th>
                        <th>อัตรา</th>
                        <th>ค่าไฟฟ้า</th>
                        <th>ภาษี</th>
                        <th>รวม</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((row, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${row.billing_month}</td>
                            <td>${row.due_date}</td>
                            <td>${row.rate}</td>
                            <td>${row.electricity_fee}</td>
                            <td>${row.tax}</td>
                            <td>${row.total}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

    // เปิดเบราว์เซอร์ Puppeteer
    const browser = await puppeteer.launch();
    // เปิดหน้าใหม่ในเบราว์เซอร์
    const page = await browser.newPage();
    // ตั้งค่าเนื้อหา HTML ในหน้า
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    // สร้าง PDF จากเนื้อหา HTML
    const pdfBuffer = await page.pdf({ format: 'A4' });
    // ปิดเบราว์เซอร์
    await browser.close();

    // ส่งคืนบัฟเฟอร์ของไฟล์ PDF
    return pdfBuffer;
}

// ส่งออกฟังก์ชัน generatePDF เพื่อใช้ในไฟล์อื่นๆ
module.exports = generatePDF;
