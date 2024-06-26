// ฟังก์ชันเพื่อดึง query parameters จาก URL
function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const regex = /([^&=]+)=([^&]*)/g;
    let m;
    while (m = regex.exec(queryString)) {
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return params;
}

const portionAdjustments = {
    'A1': 0, 'A2': 1, 'A3': 2, 'A4': 3,
    'B1': 4, 'B2': 5, 'B3': 6, 'B4': 7,
    'C1': 8, 'C2': 9, 'C3': 10, 'C4': 11,
    'D1': 12, 'D2': 13, 'D3': 14, 'D4': 15
};

// ฟังก์ชันคำนวณวันที่ก่อน
function calculateBeforeDate(billMonth) {
    const [month, year] = billMonth.split('.');
    const date = new Date(year, month - 1, 1); // month - 1 เพราะ index ของเดือนใน JavaScript เริ่มต้นที่ 0
    date.setMonth(date.getMonth() - 1); // ลดเดือนลงหนึ่งเดือน

    let beforeDate;
    const adjustedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    
    if (['01', '03', '05', '07', '08', '10', '12'].includes(adjustedMonth)) {
        beforeDate = 17;
    } else if (adjustedMonth === '02') {
        beforeDate = date.getFullYear() % 4 === 0 ? 14 : 13;
    } else {
        beforeDate = 16;
    }

    return new Date(date.getFullYear(), date.getMonth(), beforeDate);
}

// ฟังก์ชันคำนวณวันที่หลัง
function calculateAfterDate(beforeDate) {
    const date = new Date(beforeDate);
    date.setMonth(date.getMonth() + 1);

    let afterDate;
    const nextMonth = date.getMonth() + 1;
    
    if (['1', '3', '5', '7', '8', '10', '12'].includes(nextMonth.toString())) {
        afterDate = 16;
    } else if (nextMonth === 2) { // เดือนกุมภาพันธ์
        afterDate = date.getFullYear() % 4 === 0 ? 13 : 12;
    } else {
        afterDate = 15;
    }

    return new Date(date.getFullYear(), date.getMonth(), afterDate);
}

// ฟังก์ชันคำนวณจำนวนวันระหว่างสองวันที่
function calculateDaysBetween(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((endDate - startDate) / oneDay) + 1;// เพิ่ม 1 วัน
}

// ฟังก์ชันเติมข้อมูลในตาราง
function populateTableWithFilteredData(sumMoneyResults, countResults, joinResults, customerHasBillsResults, params) {
    const tableBody = document.getElementById('tableform');
    const portion = document.getElementById('portion').value;

    joinResults.forEach(joinRow => {
        if (joinRow.customer_ca === params.customer_ca && joinRow.id_command === params.id_command) {
            const sumRow = sumMoneyResults.find(sr => sr.customer_ca === joinRow.customer_ca && sr.id_command === joinRow.id_command);
            const countRow = countResults.find(cr => cr.customer_ca === joinRow.customer_ca && cr.id_command === joinRow.id_command);
            const customerHasBillsRow = customerHasBillsResults.find(chb => chb.customer_ca === joinRow.customer_ca && chb.bills_id === joinRow.id);

            const dateSystemFormatted = customerHasBillsRow ? formatDate(customerHasBillsRow.date_system) : '';
            const billMonth = joinRow.bill_month || '-';

            let beforeDate = calculateBeforeDate(billMonth);
            let afterDate = calculateAfterDate(beforeDate);

            const adjustment = portionAdjustments[portion] || 0;
            beforeDate.setDate(beforeDate.getDate() + adjustment);
            afterDate.setDate(afterDate.getDate() + adjustment);

            const daysBetween = calculateDaysBetween(beforeDate, afterDate);

            const beforeDateFormatted = formatDate(beforeDate);
            const afterDateFormatted = formatDate(afterDate);

            // ค้นหาแถวที่มีอยู่แล้ว
            let tr = tableBody.querySelector(`tr[data-id="${joinRow.id}"]`);
            
            if (!tr) {
                // สร้างแถวใหม่ถ้ายังไม่มี
                tr = document.createElement('tr');
                tr.setAttribute('data-id', joinRow.id);
                tableBody.appendChild(tr);
            }

            // อัปเดตข้อมูลในแถว
            tr.innerHTML = `
                <td class="text-center align-middle">${billMonth}</td>
                <td class="text-center align-middle">${afterDateFormatted}</td>
                <td class="text-center align-middle">${beforeDateFormatted}</td>
                <td class="text-center align-middle">${afterDateFormatted}</td>
                <td class="text-center align-middle">${daysBetween}</td>
                <td class="text-center align-middle">${joinRow.pea_position || '-'}</td>
                <td class="text-center align-middle">${joinRow.ca || '-'}</td>
                <td class="text-center align-middle">${joinRow.name || '-'}</td>
                <td class="text-end align-middle">${joinRow.money.toFixed(2) || '-'}</td>
                <td class="text-center align-middle">${joinRow.id_command || '-'}</td>
            `;
        }
    });
}

// ฟังก์ชันจัดรูปแบบวันที่ให้แสดงเฉพาะวันที่
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}.${month}.${year}`;
}

// Event listener สำหรับ dropdown
document.getElementById('portion').addEventListener('change', function() {
    fetch('http://localhost:5500/data')
        .then(response => response.json())
        .then(data => {
            console.log('Data received from API:', data);  // แสดงข้อมูลที่ได้รับจาก API
            const params = getQueryParams();
            populateTableWithFilteredData(data.sumMoneyResults, data.countResults, data.joinResults, data.customerHasBillsResults, params);
        })
        .catch(error => console.error('Error fetching data:', error));
});


// ฟังก์ชันเพื่อเติมข้อมูลในฟอร์มด้วย query parameters
function populateForm(params) {
    if (params.id_command) {
        document.getElementById('id_command').value = params.id_command;
    }
    if (params.customer_ca) {
        document.getElementById('customer_ca').value = params.customer_ca;
    }
    if (params.total_money) {
        document.getElementById('total_money').value = params.total_money;
    }
    if (params.name) {
        document.getElementById('name').value = params.name;
    }
    if (params.num_bills) {
        document.getElementById('num_bills').value = params.num_bills;
    }
}

// ฟังก์ชัน ดูไฟล์รูป
function previewFile(inputId, imgId) {
    const fileInput = document.getElementById(inputId);
    const preview = document.getElementById(imgId);
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = function () {
        preview.src = reader.result;
        preview.style.display = 'block';
    }

    if (file) {
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
        preview.style.display = 'none';
    }
}

// ดึงข้อมูลจาก API และเติมข้อมูลลงในตาราง
fetch('http://localhost:5500/data')
    .then(response => response.json())
    .then(data => {
        console.log('Data received from API:', data);  // แสดงข้อมูลที่ได้รับจาก API
        const params = getQueryParams();
        populateTableWithFilteredData(data.sumMoneyResults, data.countResults, data.joinResults, data.customerHasBillsResults, params);
    })
    .catch(error => console.error('Error fetching data:', error));


// ฟังก์ชันเพื่อส่งข้อมูลฟอร์มไปยังเซิร์ฟเวอร์
document.getElementById('dataForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {};

    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch('http://localhost:5500/save-date', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(data => {
        alert('Data saved successfully');
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// ดึงข้อมูลวันหยุดพร้อมรายละเอียด
let holidayDates = [];
let holidayDescriptions = {};

fetch('http://localhost:5500/holidays')
    .then(response => response.json())
    .then(holidays => {
        holidayDates = holidays.map(holiday => holiday.date.split('T')[0]); // แปลงรูปแบบวันที่ให้เป็น YYYY-MM-DD
        holidays.forEach(holiday => {
            holidayDescriptions[holiday.date.split('T')[0]] = holiday.description;
        });

        // Initialize flatpickr หลังจากดึงข้อมูลวันหยุดเรียบร้อยแล้ว
        initializeFlatpickr();
    })
    .catch(error => {
        console.error('Error fetching holidays:', error);
    });

function initializeFlatpickr() {
    const dateInputs = ['#date_system', '#date_employee', '#date_company', '#date_deferment'];

    dateInputs.forEach(id => {
        const datepicker = flatpickr(id, {
            dateFormat: "Y-m-d",
            allowInput: true,
            disable: [
                function(date) {
                    const dateStr = date.toISOString().split('T')[0];
                    // ปิดการเลือกวันเสาร์และวันอาทิตย์ รวมถึงวันหยุด
                    return (date.getDay() === 0 || date.getDay() === 6 || holidayDates.includes(dateStr));
                }
            ],
            locale: {
                firstDayOfWeek: 1 // เริ่มต้นสัปดาห์ที่วันจันทร์
            },
            onDayCreate: function (dObj, dStr, fp, dayElem) {
                const date = dayElem.dateObj.toISOString().split('T')[0];
                if (holidayDescriptions[date]) {
                    dayElem.setAttribute('title', holidayDescriptions[date]);
                    dayElem.classList.add('holiday');
                }
            }
        });

        const toggleButton = document.querySelector(`[data-toggle="${id.substring(1)}"]`);
        const clearButton = document.querySelector(`[data-clear="${id.substring(1)}"]`);

        if (toggleButton) {
            toggleButton.addEventListener('click', function() {
                datepicker.open();
            });
        }

        if (clearButton) {
            clearButton.addEventListener('click', function() {
                datepicker.clear();
            });
        }
    });
}

// ดึง query parameters และเติมข้อมูลลงในฟอร์มเมื่อเอกสารโหลดเสร็จ
document.addEventListener('DOMContentLoaded', (event) => {
    const params = getQueryParams();
    populateForm(params);
});

// ฟังก์ชันคำนวณจำนวนวันที่ไม่รวมวันหยุดเสาร์-อาทิตย์
function calculateBusinessDays(startDate, endDate) {
    let count = 0;
    let curDate = new Date(startDate);

    while (curDate <= endDate) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // ไม่รวมวันเสาร์และวันอาทิตย์
            count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
}

// คำนวณจำนวนวันในเดือนที่ให้มาสำหรับการคำนวณอัตรารายวัน
function getDaysInMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return new Date(year, month, 0).getDate();
}

// ปุ่มคำนวณ
document.getElementById('calculateButton').addEventListener('click', function () {
    const dateSystem = new Date(document.getElementById('date_system').value);
    const dateEmployee = new Date(document.getElementById('date_employee').value);
    const dateCompany = new Date(document.getElementById('date_company').value);
    const totalMoney = parseFloat(document.getElementById('total_money').value);

    // คำนวณจำนวนวันในเดือนที่ระบุ
    const daysInMonth = getDaysInMonth(dateSystem);

    // อัตราค่าใช้จ่ายต่อวัน
    const dailyRate = totalMoney / daysInMonth;

    // คำนวณจำนวนวันที่พนักงานล่าช้า
    const daysLateEmployee = calculateBusinessDays(dateSystem, dateEmployee) - 1; // ไม่รวมวันเริ่มต้น

    // คำนวณจำนวนเงินที่พนักงานต้องรับผิดชอบ
    const responsibilityAmountEmployee = daysLateEmployee * dailyRate;

    // คำนวณจำนวนวันที่ผู้รับจ้างล่าช้าจากวันที่พนักงานสั่งงาน
    const daysLateContractor = calculateBusinessDays(dateEmployee, dateCompany) - 8; // ไม่รวมวันเริ่มต้นและระยะเวลา 7 วัน

    // คำนวณจำนวนเงินที่ผู้รับจ้างต้องรับผิดชอบ
    const responsibilityAmountContractor = daysLateContractor * dailyRate;

    alert(`พนักงานต้องรับผิดชอบเป็นจำนวน ${daysLateEmployee} วัน และเป็นเงิน ${responsibilityAmountEmployee.toFixed(2)} บาท\nผู้รับจ้างต้องรับผิดชอบเป็นจำนวน ${daysLateContractor} วัน และเป็นเงิน ${responsibilityAmountContractor.toFixed(2)} บาท`);
});

// ปุ่มปริ้น
document.getElementById('printButton').addEventListener('click', function () {
    window.print();
});
