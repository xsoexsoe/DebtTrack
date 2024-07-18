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
    return Math.round((endDate - startDate) / oneDay) + 1; // เพิ่ม 1 วัน
}

// ฟังก์ชันเติมข้อมูลในตาราง
function populateTableWithFilteredData(sumMoneyResults, countResults, joinResults, customerHasBillsResults, params) {
    const tableBody = document.getElementById('tableform');
    const portion = document.getElementById('portion').value;

    tableBody.innerHTML = ''; // เคลียร์ข้อมูลตารางก่อนเติมข้อมูลใหม่

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

            // สร้างแถวใหม่
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', joinRow.id);
            
            tr.innerHTML = `
                <td class="text-center align-middle">${billMonth}</td>
                <td class="text-center align-middle after-col">
                    <input type="text" class="form-control flatpickr-input" style="font-size:0.8rem" value="${afterDateFormatted}" data-id="${joinRow.id}" data-type="after">
                </td>
                <td class="text-center align-middle before-col">
                    <input type="text" class="form-control flatpickr-input" style="font-size:0.8rem" value="${beforeDateFormatted}" data-id="${joinRow.id}" data-type="before">
                </td>
                <td class="text-center align-middle after-col">
                    <input type="text" class="form-control flatpickr-input" style="font-size:0.8rem" value="${afterDateFormatted}" data-id="${joinRow.id}" data-type="after">
                </td>
                <td class="text-center align-middle">${daysBetween}</td>
                <td class="text-end align-middle">${joinRow.money.toFixed(2) || '-'}</td>
                <td class="text-center align-middle">${joinRow.status || '-'}</td>
                <td class="text-center align-middle date-system">${dateSystemFormatted}</td>
                <td class="text-center align-middle date-employee"></td>
                <td class="text-center align-middle date-deferment"></td>
                <td class="text-center align-middle date-deferment2"></td>
                <td class="text-center align-middle date-company"></td>
                <td class="text-center align-middle">-</td>
                <td class="text-center align-middle">-</td>
            `;

            tableBody.appendChild(tr);

            // ตั้งค่า flatpickr
            flatpickr(`input[data-id="${joinRow.id}"][data-type="before"]`, {
                dateFormat: "d.m.Y",
                onChange: function(selectedDates, dateStr, instance) {
                    const afterInput = document.querySelector(`input[data-id="${joinRow.id}"][data-type="after"]`);
                    const beforeDate = new Date(selectedDates[0]);
                    let afterDate = calculateAfterDate(beforeDate);
                    afterInput.value = formatDate(afterDate);
                    const daysBetween = calculateDaysBetween(beforeDate, afterDate);
                    tr.querySelector('.text-center.align-middle:nth-child(5)').innerText = daysBetween;
                }
            });

            flatpickr(`input[data-id="${joinRow.id}"][data-type="after"]`, {
                dateFormat: "d.m.Y",
                onChange: function(selectedDates, dateStr, instance) {
                    const beforeInput = document.querySelector(`input[data-id="${joinRow.id}"][data-type="before"]`);
                    const afterDate = new Date(selectedDates[0]);
                    const beforeDate = new Date(beforeInput.value.split('-').reverse().join('-'));
                    const daysBetween = calculateDaysBetween(beforeDate, afterDate);
                    tr.querySelector('.text-center.align-middle:nth-child(5)').innerText = daysBetween;
                }
            });
        }
    });
}

// ฟังก์ชันจัดรูปแบบวันที่ให้แสดงเฉพาะวันที่
function formatDate(date) {
    if (!date) return '';
    const buddhistYear = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}.${month}.${buddhistYear}`;
}

// ฟังก์ชันอัปเดตคอลัมน์ "ระบบอนุมัติจ่ายไฟ"
function updateApprovalDates(date) {
    const formattedDate = formatDate(date);
    const tableBody = document.getElementById('tableform');
    const rows = tableBody.querySelectorAll('tr');

    rows.forEach(row => {
        const dateSystemCell = row.querySelector('.date-system');
        dateSystemCell.innerText = formattedDate;
    });
}

// ฟังก์ชันอัปเดตคอลัมน์ "พบช.สั่งงดจ่ายไฟ"
function updateEmployeeDates(date) {
    const formattedDate = formatDate(date);
    const tableBody = document.getElementById('tableform');
    const rows = tableBody.querySelectorAll('tr');

    rows.forEach(row => {
        const dateEmployeeCell = row.querySelector('.date-employee');
        dateEmployeeCell.innerText = formattedDate;
    });
}

// ฟังก์ชันอัปเดตคอลัมน์ "ผรจ.ถอดมิเตอร์"
function updateCompanyDates(date) {
    const formattedDate = formatDate(date);
    const tableBody = document.getElementById('tableform');
    const rows = tableBody.querySelectorAll('tr');

    rows.forEach(row => {
        const dateCompanyCell = row.querySelector('.date-company');
        dateCompanyCell.innerText = formattedDate;
    });
}

// ฟังก์ชันอัปเดตคอลัมน์ "ผรจ.ผ่อนผัน ครั้งที่ 1"
function updateDefermentDates(date) {
    const formattedDate = formatDate(date);
    const tableBody = document.getElementById('tableform');
    const rows = tableBody.querySelectorAll('tr');

    rows.forEach(row => {
        const dateDefermentCell = row.querySelector('.date-deferment');
        dateDefermentCell.innerText = formattedDate;
    });
}

// ฟังก์ชันอัปเดตคอลัมน์ "ผรจ.ผ่อนผัน ครั้งที่ 2"
function updateDeferment2Dates(date) {
    const formattedDate = formatDate(date);
    const tableBody = document.getElementById('tableform');
    const rows = tableBody.querySelectorAll('tr');

    rows.forEach(row => {
        const dateDeferment2Cell = row.querySelector('.date-deferment2');
        dateDeferment2Cell.innerText = formattedDate;
    });
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
        const dateInputs = ['#date_system', '#date_employee', '#date_company', '#date_deferment', '#date_deferment2'];
    
        dateInputs.forEach(id => {
            const datepicker = flatpickr(id, {
                dateFormat: "d-m-Y",
                allowInput: true,
                disable: [
                    function(date) {
                        const dateStr = date.toISOString().split('T')[0];
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
                },
                onChange: function(selectedDates, dateStr, instance) {
                    instance.input.value = dateStr; // แสดงวันที่ในฟอร์แมต d-m-Y
    
                    switch (id) {
                        case '#date_system':
                            updateApprovalDates(selectedDates[0]);
                            break;
                        case '#date_employee':
                            updateEmployeeDates(selectedDates[0]);
                            break;
                        case '#date_company':
                            updateCompanyDates(selectedDates[0]);
                            break;
                        case '#date_deferment':
                            updateDefermentDates(selectedDates[0]);
                            break;
                        case '#date_deferment2':
                            updateDeferment2Dates(selectedDates[0]);
                            break;
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
// ฟังก์ชันแปลงรูปแบบวันที่จาก d-m-Y เป็น YYYY-MM-DD
function convertToISODate(dateStr) {
    const [day, month, year] = dateStr.split('-');
    return `${month}-${day}-${year}`;
}
// ปุ่มคำนวณ
document.getElementById('calculateButton').addEventListener('click', function () {
    const dateSystem = new Date(convertToISODate(document.getElementById('date_system').value));
    const dateEmployee = new Date(convertToISODate(document.getElementById('date_employee').value));
    const dateCompany = new Date(convertToISODate(document.getElementById('date_company').value));
    const dateDeferment = new Date(document.getElementById('date_deferment').value);
    const dateDeferment2 = new Date(document.getElementById('date_deferment2').value);
    const totalMoney = parseFloat(document.getElementById('total_money').value);
    console.log(dateSystem);
    console.log(dateEmployee);
    console.log(dateCompany);
    // คำนวณจำนวนวันในเดือนที่ระบุ
    const daysInMonth = getDaysInMonth(dateSystem);
    console.log(daysInMonth);
    // อัตราค่าใช้จ่ายต่อวัน
    const dailyRate = totalMoney / daysInMonth;
    console.log(dailyRate);
    // คำนวณจำนวนวันที่พนักงานล่าช้า
    const daysLateEmployee = calculateBusinessDays(dateSystem, dateEmployee) - 1; // ไม่รวมวันเริ่มต้น
    console.log(daysLateEmployee);
    // คำนวณจำนวนเงินที่พนักงานต้องรับผิดชอบ
    const responsibilityAmountEmployee = daysLateEmployee * dailyRate;
    console.log(responsibilityAmountEmployee);
    // คำนวณจำนวนวันที่ผู้รับจ้างล่าช้าจากวันที่พนักงานสั่งงาน
    const daysLateContractor = calculateBusinessDays(dateEmployee, dateCompany) - 8; // ไม่รวมวันเริ่มต้นและระยะเวลา 7 วัน
    console.log(dateEmployee);
    console.log(dateCompany);
    console.log(daysLateContractor);
    // คำนวณจำนวนเงินที่ผู้รับจ้างต้องรับผิดชอบ
    const responsibilityAmountContractor = daysLateContractor * dailyRate;
    console.log(responsibilityAmountContractor);
    alert(`พนักงานต้องรับผิดชอบเป็นจำนวน ${daysLateEmployee} วัน และเป็นเงิน ${responsibilityAmountEmployee.toFixed(2)} บาท\nผู้รับจ้างต้องรับผิดชอบเป็นจำนวน ${daysLateContractor} วัน และเป็นเงิน ${responsibilityAmountContractor.toFixed(2)} บาท`);
});

// ปุ่มปริ้น
document.getElementById('printButton').addEventListener('click', function () {
    window.print();
});


document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชันเพื่อแสดง/ซ่อนฟิลด์วันที่ผ่อนผันตามสถานะของ Checkboxes
    function toggleDateField(checkboxId, containerId) {
        const checkbox = document.getElementById(checkboxId);
        const container = document.getElementById(containerId);
        checkbox.addEventListener('change', function() {
            if (checkbox.checked) {
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        });
    }

    // เรียกใช้ฟังก์ชัน toggleDateField สำหรับฟิลด์วันที่ผ่อนผัน
    toggleDateField('enable_date_deferment', 'date_deferment_container');
    toggleDateField('enable_date_deferment2', 'date_deferment2_container');

    // เรียกใช้งาน event change เมื่อโหลดหน้า เพื่อให้สถานะเริ่มต้นถูกต้อง
    document.getElementById('enable_date_deferment').dispatchEvent(new Event('change'));
    document.getElementById('enable_date_deferment2').dispatchEvent(new Event('change'));
});