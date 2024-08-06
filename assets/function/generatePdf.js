const ejs = require('ejs');
const fs = require('fs');
const pdf = require('html-pdf-node');

// แปลงรูปภาพเป็น base64
const imagePath = 'images/logo.jpg';
const imageBase64 = fs.readFileSync(imagePath, 'base64');

const data = {
    imageBase64: imageBase64
    // ข้อมูลตัวแปรที่ต้องการใส่ในเทมเพลต
};

ejs.renderFile('template.ejs', data, (err, html) => {
    if (err) {
        console.log(err);
    } else {
        // ตั้งค่าขนาดกระดาษ A4 และขอบกระดาษ
        let options = {
            format: 'A4',
            margin: {
                top: '60px',
                bottom: '60px',
                left: '60px',
                right: '60px'
            }
        };
        let file = { content: html };

        pdf.generatePdf(file, options).then(pdfBuffer => {
            fs.writeFileSync('document.pdf', pdfBuffer);
            console.log('PDF generated successfully');
        }).catch(error => {
            console.log('Error generating PDF:', error);
        });
    }
});
