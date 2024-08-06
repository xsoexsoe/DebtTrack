// ฟังก์ชันเพื่อดึง query parameters จาก URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const queryParams = {};
    for (const [key, value] of params.entries()) {
        queryParams[key] = value;
    }
    return queryParams;
}

// เรียกใช้ฟังก์ชันเพื่อเติมข้อมูลในฟอร์ม
const params = getQueryParams();
populateForm(params);


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

// // ฟังก์ชันเติมข้อมูลในตาราง
// function populateTableWithFilteredData(sumMoneyResults, countResults, joinResults, customerHasBillsResults, params) {
//     const tableBody = document.getElementById('tableform');
//     const portion = document.getElementById('portion').value;

//     tableBody.innerHTML = ''; // เคลียร์ข้อมูลตารางก่อนเติมข้อมูลใหม่

//     joinResults.forEach(joinRow => {
//         if (joinRow.customer_ca === params.customer_ca && joinRow.id_command === params.id_command) {
//             const sumRow = sumMoneyResults.find(sr => sr.customer_ca === joinRow.customer_ca && sr.id_command === joinRow.id_command);
//             const countRow = countResults.find(cr => cr.customer_ca === joinRow.customer_ca && cr.id_command === joinRow.id_command);
//             const customerHasBillsRow = customerHasBillsResults.find(chb => chb.customer_ca === joinRow.customer_ca && chb.bills_id === joinRow.id);

//             const dateSystemFormatted = customerHasBillsRow ? formatDate(customerHasBillsRow.date_system) : '';
//             const billMonth = joinRow.bill_month || '-';

//             let beforeDate = calculateBeforeDate(billMonth);
//             let afterDate = calculateAfterDate(beforeDate);

//             const adjustment = portionAdjustments[portion] || 0;
//             beforeDate.setDate(beforeDate.getDate() + adjustment);
//             afterDate.setDate(afterDate.getDate() + adjustment);

//             const daysBetween = calculateDaysBetween(beforeDate, afterDate);

//             const beforeDateFormatted = formatDate(beforeDate);
//             const afterDateFormatted = formatDate(afterDate);

//             const money = parseFloat(joinRow.money);

//             const moneyValue = !isNaN(money) ? money.toFixed(2) : '-';

//             // สร้างแถวใหม่
//             const tr = document.createElement('tr');
//             tr.setAttribute('data-id', joinRow.id);

//             tr.innerHTML = `
//                 <td class="text-center align-middle">${billMonth}</td>
//                 <td class="text-center align-middle after-col">
//                     <input type="text" class="form-control flatpickr-input pf16n"  value="${afterDateFormatted}" data-id="${joinRow.id}" data-type="after">
//                 </td>
//                 <td class="text-center align-middle before-col">
//                     <input type="text" class="form-control flatpickr-input pf16n"  value="${beforeDateFormatted}" data-id="${joinRow.id}" data-type="before">
//                 </td>
//                 <td class="text-center align-middle after-col">
//                     <input type="text" class="form-control flatpickr-input pf16n"  value="${afterDateFormatted}" data-id="${joinRow.id}" data-type="after">
//                 </td>
//                 <td class="text-center align-middle">${daysBetween}</td>
//                 <td class="text-end align-middle">${moneyValue}</td> <!-- บรรทัดที่อัปเดต -->
//                 <td class="text-center align-middle">${joinRow.status || '-'}</td>
//                 <td class="text-center align-middle date-system"></td>
//                 <td class="text-center align-middle date-employee"></td>
//                 <td class="text-center align-middle date-deferment"></td>
//                 <td class="text-center align-middle date-deferment2"></td>
//                 <td class="text-center align-middle date-company"></td>
//                 <td class="text-center align-middle">-</td>
//                 <td class="text-center align-middle">-</td>
//                 <td class="text-center align-middle"></td>
//                 <td class="text-center align-middle"></td>
//                 <td class="text-center align-middle"></td>
//                 <td class="text-center align-middle"></td>
//                 <td class="text-center align-middle"></td>
//                 <td class="text-center align-middle"></td>
//                 <td class="text-center align-middle"></td>
//                 <td class="text-center align-middle"></td>
//             `;

//             tableBody.appendChild(tr);

//             // ตั้งค่า flatpickr
//             flatpickr(`input[data-id="${joinRow.id}"][data-type="before"]`, {
//                 dateFormat: "d-m-Y",
//                 onChange: function(selectedDates, dateStr, instance) {
//                     const afterInput = document.querySelector(`input[data-id="${joinRow.id}"][data-type="after"]`);
//                     const beforeDate = new Date(selectedDates[0]);
//                     let afterDate = calculateAfterDate(beforeDate);
//                     afterInput.value = formatDate(afterDate);
//                     const daysBetween = calculateDaysBetween(beforeDate, afterDate);
//                     tr.querySelector('.text-center.align-middle:nth-child(5)').innerText = daysBetween;
//                 }
//             });

//             flatpickr(`input[data-id="${joinRow.id}"][data-type="after"]`, {
//                 dateFormat: "d-m-Y",
//                 onChange: function(selectedDates, dateStr, instance) {
//                     const beforeInput = document.querySelector(`input[data-id="${joinRow.id}"][data-type="before"]`);
//                     const afterDate = new Date(selectedDates[0]);
//                     const beforeDate = new Date(beforeInput.value.split('-').reverse().join('-'));
//                     const daysBetween = calculateDaysBetween(beforeDate, afterDate);
//                     tr.querySelector('.text-center.align-middle:nth-child(5)').innerText = daysBetween;
//                 }
//             });
//         }
//     });
// }

function populateTableWithFilteredData(sumMoneyResults, countResults, joinResults, customerHasBillsResults, params) {
    const tableBody = document.getElementById('tableform');
    const portion = document.getElementById('portion').value;

    tableBody.innerHTML = ''; // เคลียร์ข้อมูลตารางก่อนเติมข้อมูลใหม่

    joinResults.forEach(joinRow => {
        if (joinRow.customer_ca === params.customer_ca && joinRow.id_command === params.id_command) {
            const sumRow = sumMoneyResults.find(sr => sr.customer_ca === joinRow.customer_ca && sr.id_command === joinRow.id_command);
            const countRow = countResults.find(cr => cr.customer_ca === joinRow.customer_ca && cr.id_command === joinRow.id_command);
            const customerHasBillsRow = customerHasBillsResults.find(chb => chb.customer_ca === joinRow.customer_ca && chb.bills_id === joinRow.id);
           
            const dateSystemFormatted = customerHasBillsRow && customerHasBillsRow.date_system ? formatDate(customerHasBillsRow.date_system) : '-';
            const dateEmployeeFormatted = customerHasBillsRow && customerHasBillsRow.date_employee ? formatDate(customerHasBillsRow.date_employee) : '-';
            const dateCompanyFormatted = customerHasBillsRow && customerHasBillsRow.date_company ? formatDate(customerHasBillsRow.date_company) : '-';

            // ตรวจสอบ date_deferment และ date_deferment2
            const dateDefermentFormatted = customerHasBillsRow && customerHasBillsRow.date_deferment ? formatDate(customerHasBillsRow.date_deferment) : '-';
            const dateDeferment2Formatted = customerHasBillsRow && customerHasBillsRow.date_deferment2 ? formatDate(customerHasBillsRow.date_deferment2) : '-';

            const dayPea = customerHasBillsRow ? customerHasBillsRow.day_pea : 0;
            const dayEmployee = customerHasBillsRow ? customerHasBillsRow.day_employee : 0;
            const dayCompany = customerHasBillsRow ? customerHasBillsRow.day_company : 0;

            const moneyPea = customerHasBillsRow ? customerHasBillsRow.money_pea.toFixed(2) : '0.00';
            const moneyEmployee = customerHasBillsRow ? customerHasBillsRow.money_employee.toFixed(2) : '0.00';
            const moneyCompany = customerHasBillsRow ? customerHasBillsRow.money_company.toFixed(2) : '0.00';

            const details = customerHasBillsRow ? customerHasBillsRow.details : '-';

            const billMonth = joinRow.bill_month || '-';

            let beforeDate = calculateBeforeDate(billMonth);
            let afterDate = calculateAfterDate(beforeDate);

            const adjustment = portionAdjustments[portion] || 0;
            beforeDate.setDate(beforeDate.getDate() + adjustment);
            afterDate.setDate(afterDate.getDate() + adjustment);

            const daysBetween = calculateDaysBetween(beforeDate, afterDate);

            const beforeDateFormatted = formatDate(beforeDate);
            const afterDateFormatted = formatDate(afterDate);

            const money = parseFloat(joinRow.money);

            const moneyValue = !isNaN(money) ? money.toFixed(2) : '-';

            // สร้างแถวใหม่
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', joinRow.id);

            tr.innerHTML = `
                <td class="text-center align-middle">${billMonth}</td>
                <td class="text-center align-middle after-col">
                    <input type="text" class="form-control flatpickr-input pf16n"  value="${afterDateFormatted}" data-id="${joinRow.id}" data-type="after">
                </td>
                <td class="text-center align-middle before-col">
                    <input type="text" class="form-control flatpickr-input pf16n"  value="${beforeDateFormatted}" data-id="${joinRow.id}" data-type="before">
                </td>
                <td class="text-center align-middle after-col">
                    <input type="text" class="form-control flatpickr-input pf16n"  value="${afterDateFormatted}" data-id="${joinRow.id}" data-type="after">
                </td>
                <td class="text-center align-middle">${daysBetween}</td>
                <td class="text-end align-middle">${moneyValue}</td>
                <td class="text-center align-middle">${joinRow.status || '-'}</td>
                <td class="text-center align-middle date-system">${dateSystemFormatted}</td>
                <td class="text-center align-middle date-employee">${dateEmployeeFormatted}</td>
                <td class="text-center align-middle date-deferment">${dateDefermentFormatted}</td>
                <td class="text-center align-middle date-deferment2">${dateDeferment2Formatted}</td>
                <td class="text-center align-middle date-company">${dateCompanyFormatted}</td>
                <td class="text-center align-middle"></td>
                <td class="text-center align-middle"></td>
                <td class="text-center align-middle">${dayEmployee}</td>
                <td class="text-center align-middle">${dayCompany}</td>
                <td class="text-center align-middle">${dayPea}</td>
                <td class="text-center align-middle"></td>
                <td class="text-right align-middle">${moneyEmployee}</td>
                <td class="text-right align-middle">${moneyCompany}</td>
                <td class="text-right align-middle">${moneyPea}</td>
                <td class="text-center align-middle"></td>

            `;

            tableBody.appendChild(tr);

            // ตั้งค่า flatpickr
            flatpickr(`input[data-id="${joinRow.id}"][data-type="before"]`, {
                dateFormat: "d-m-Y",
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
                dateFormat: "d-m-Y",
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
    
    // แปลง string เป็น Date ถ้าจำเป็น
    if (typeof date === 'string') {
        date = new Date(date); // ใช้ ISO string ในการสร้าง Date object
    }
    
    // ตรวจสอบว่า date เป็น object ประเภท Date
    if (isNaN(date)) return ''; // ตรวจสอบว่า date ถูกต้องหรือไม่

    const year = date.getFullYear(); 
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
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
    fetch('/data')
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

// ดึง query parameters และเติมข้อมูลลงในฟอร์มเมื่อเอกสารโหลดเสร็จ
document.addEventListener('DOMContentLoaded', (event) => {
    const params = getQueryParams();
    populateForm(params);
});

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
fetch('/data')
    .then(response => response.json())
    .then(data => {
        console.log('Data received from API:', data);  // แสดงข้อมูลที่ได้รับจาก API
        const params = getQueryParams();
        populateTableWithFilteredData(data.sumMoneyResults, data.countResults, data.joinResults, data.customerHasBillsResults, params);

         // ตรวจสอบและแสดงภาพ
         if (data.customerHasBillsResults && data.customerHasBillsResults.length > 0) {
            const customerHasBillsRow = data.customerHasBillsResults[0]; // สมมติว่าต้องการแค่รายการแรก
            const imageCutMeter = customerHasBillsRow.image_cutmeter;
            const imageRegis = customerHasBillsRow.image_regis;

            if (imageCutMeter) {
                previewFileFromData(imageCutMeter, 'preview1');
            }

            if (imageRegis) {
                previewFileFromData(imageRegis, 'preview2');
            }
        }
})
    .catch(error => console.error('Error fetching data:', error));

    function previewFileFromData(imageData, imgId) {
        const preview = document.getElementById(imgId);
    
        if (imageData && imageData.type === 'Buffer') {
            // แปลง Buffer เป็น Data URL
            const binaryString = new Uint8Array(imageData.data).reduce((acc, byte) => acc + String.fromCharCode(byte), '');
            const base64String = btoa(binaryString);
            preview.src = `data:image/png;base64,${base64String}`; // สมมติว่าเป็น PNG
            preview.style.display = 'block';
        } else {
            preview.src = "";
            preview.style.display = 'none';
        }
    }
    

document.getElementById('dataForm').addEventListener('submit', async (event) => {
        event.preventDefault();
    
        // ดึงค่าจากฟอร์ม
        const customerCa = document.getElementById('customer_ca').value;
        const tableData = getTableData(); // ฟังก์ชันที่คุณมีอยู่แล้ว
        const file1 = document.getElementById('file1').files[0];
        const file2 = document.getElementById('file2').files[0];
    
        // ใช้ FormData เพื่อส่งข้อมูลไฟล์
        const formData = new FormData();
        formData.append('customer_ca', customerCa);
        formData.append('tableData', JSON.stringify(tableData));
        formData.append('file1', file1);
        formData.append('file2', file2);
    
        try {

            const response = await fetch('/save-data', {
                method: 'POST',
                body: formData
            });
    
            const result = await response.json();
            if (result.success) {
                alert('บันทึกข้อมูลเรียบร้อย');
            } else {
                alert('บันทึกข้อมูลไม่สำเร็จ');
            }
        } catch (error) {
            console.error('เกิดข้อผิดพลาดขณะส่งข้อมูล:', error);
            alert('เกิดข้อผิดพลาดขณะบันทึกข้อมูล');
        }
    });
    


// ดึงข้อมูลวันหยุดพร้อมรายละเอียด
let holidayDates = [];
let holidayDescriptions = {};

fetch('/api/holidays')
// fetch(apiUrl3)
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



// ฟังก์ชันดึงข้อมูลวันหยุดจากเซิร์ฟเวอร์
async function fetchHolidays() {
    try {
        const response = await fetch('/api/holidays');
        const holidays = await response.json();
        return holidays.map(holiday => new Date(holiday.date).toISOString().split('T')[0]); // แปลงวันหยุดให้เป็นรูปแบบ 'YYYY-MM-DD'
    } catch (error) {
        console.error('Error fetching holidays:', error);
        return [];
    }
}

// ฟังก์ชันคำนวณจำนวนวันทำการระหว่างสองวันที่ ไม่รวมวันหยุด
const calculateBusinessDaysBetween = (startDate, endDate, holidays) => {
    let count = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const formattedDate = currentDate.toISOString().split('T')[0];
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(formattedDate)) { // ไม่ใช่วันเสาร์หรืออาทิตย์และไม่ใช่วันหยุด
            count++;
        }
        currentDate.setDate(currentDate.getDate()+1);
    }

    return count;
}

// ฟังก์ชันเพิ่มวันทำการ
const addBusinessDays = (startDate, days, holidays) => {
    let currentDate = new Date(startDate);
    let addedDays = 0;
    currentDate.setDate(currentDate.getDate() +1);
    while (addedDays < days) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay();
        const formattedDate = currentDate.toISOString().split('T')[0];
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(formattedDate)) { // ไม่ใช่วันเสาร์หรืออาทิตย์และไม่ใช่วันหยุด
            addedDays++;
        }
    }

    return currentDate;
}

// ฟังก์ชันคำนวณความรับผิดชอบ
async function calculateResponsibility() {
    const approvalDate = new Date(document.getElementById('date_system').value.split('-').reverse().join('-'));
    const accountantOrderDate = new Date(document.getElementById('date_employee').value.split('-').reverse().join('-'));
    const contractorActionDate = new Date(document.getElementById('date_company').value.split('-').reverse().join('-'));
    const postpone1DateInput = document.getElementById('date_deferment').value;
    const postpone2DateInput = document.getElementById('date_deferment2').value;

    const postpone1Date = postpone1DateInput ? new Date(postpone1DateInput.split('-').reverse().join('-')) : null;
    const postpone2Date = postpone2DateInput ? new Date(postpone2DateInput.split('-').reverse().join('-')) : null;

    console.log(`calculateResponsibility: approvalDate=${approvalDate}, accountantOrderDate=${accountantOrderDate}, contractorActionDate=${contractorActionDate}, postpone1Date=${postpone1Date}, postpone2Date=${postpone2Date}`);

    const bills = getTableData();
    const holidays = await fetchHolidays();

    const calculateDaysBetween = (startDate, endDate) => {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round((endDate - startDate) / oneDay)+1;
    }

    const addDays = (date, days) => {
        let result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    const clampDate = (date, minDate, maxDate) => {
        return new Date(Math.max(minDate, Math.min(date, maxDate)));
    }

    const initialStartDate = addBusinessDays(approvalDate, 22, holidays);
    console.log(`Initial start date: ${initialStartDate}`);

    let currentStartDate = initialStartDate;

    let responsibilityData = {};

    bills.forEach((bill) => {
        if (bill.startDate && bill.endDate) {
            let responsibilityPeriods = {};

            console.log(`Processing bill for month ${bill.month}: startDate=${bill.startDate}, endDate=${bill.endDate}, amount=${bill.amount}`);

            const addResponsibilityPeriod = (startDate, endDate, responsibleParty) => {
                if (endDate > startDate) {
                    const days = calculateDaysBetween(startDate, endDate);
                    if (!responsibilityPeriods[responsibleParty]) {
                        responsibilityPeriods[responsibleParty] = { days: 0, amount: 0 };
                    }
                    responsibilityPeriods[responsibleParty].days += days;
                    responsibilityPeriods[responsibleParty].amount += (days * (bill.amount / calculateDaysBetween(bill.startDate, bill.endDate)));
                    console.log(`Added ${days} days of responsibility for ${responsibleParty} from ${startDate.toDateString()} to ${endDate.toDateString()}`);
                }
            }

            const totalDays = calculateDaysBetween(bill.startDate, bill.endDate);
            console.log(totalDays);
            const accountantLate = calculateBusinessDaysBetween(approvalDate, accountantOrderDate, holidays) > 22;
            if (!(accountantLate)) {
                currentStartDate = accountantOrderDate;
            }
            const deferment1 = calculateDaysBetween(currentStartDate, postpone1Date) > 7 && postpone1Date != null;
            if (!(deferment1) && postpone1Date != null ) {
                currentStartDate = postpone1Date;
            }
            const deferment2 = calculateDaysBetween(postpone1Date, postpone2Date) > 2 && postpone2Date != null;
            if (!(deferment2) && postpone2Date != null ) {
                currentStartDate = postpone2Date;
            }
            const contractorLate = calculateBusinessDaysBetween(currentStartDate, contractorActionDate, holidays) > 7;
            const pea = calculateDaysBetween(approvalDate, bill.endDate) < 0;
            console.log(`accountantLate=${accountantLate}, deferment1=${deferment1}, deferment2=${deferment2}, contractorLate=${contractorLate}, pea=${pea}`);

            let totalResponsibilityDays = 0;
            
            console.log()
            if (accountantLate && accountantOrderDate >= bill.endDate && approvalDate <= bill.startDate) {
                addResponsibilityPeriod(currentStartDate, bill.endDate, 'Accountant');
                totalResponsibilityDays += calculateDaysBetween(currentStartDate, bill.endDate);
                console.log(totalResponsibilityDays);
                currentStartDate = accountantOrderDate;
                console.log(`accountantLate period: ${calculateDaysBetween(currentStartDate, bill.endDate)} days`);
                console.log(`Updated currentStartDate to ${currentStartDate.toDateString()} after accounting late period`);
            }
            if (accountantLate && accountantOrderDate >= bill.startDate && accountantOrderDate <= bill.endDate && approvalDate <= bill.startDate) {
                addResponsibilityPeriod(bill.startDate , accountantOrderDate, 'Accountant');
                totalResponsibilityDays += calculateDaysBetween(bill.startDate , accountantOrderDate,);
                console.log(totalResponsibilityDays);
                currentStartDate = accountantOrderDate;
                console.log(`accountantLate period: ${calculateDaysBetween(bill.startDate , accountantOrderDate,)} days`);
                console.log(`Updated currentStartDate to ${currentStartDate.toDateString()} after accounting late period`);
            }

            if (deferment1 && currentStartDate < postpone1Date) {
                const postpone1EndDate = clampDate(addDays(currentStartDate, 7), bill.startDate, bill.endDate);
                addResponsibilityPeriod(currentStartDate, postpone1EndDate, 'Deferment 1');
                totalResponsibilityDays += calculateDaysBetween(currentStartDate, postpone1EndDate);
                console.log(`Deferment 1 period: ${calculateDaysBetween(currentStartDate, postpone1EndDate)} days`);
                currentStartDate = postpone1EndDate;
                console.log(`Updated currentStartDate to ${currentStartDate.toDateString()} after deferment 1 period`);
            }

            if (deferment2 && currentStartDate < postpone2Date) {
                const postpone2EndDate = clampDate(addDays(currentStartDate, 2), bill.startDate, bill.endDate);
                addResponsibilityPeriod(currentStartDate, postpone2EndDate, 'Deferment 2');
                totalResponsibilityDays += calculateDaysBetween(currentStartDate, postpone2EndDate);
                console.log(`Deferment 2 period: ${calculateDaysBetween(currentStartDate, postpone2EndDate)} days`);
                currentStartDate = postpone2EndDate;
                console.log(`Updated currentStartDate to ${currentStartDate.toDateString()} after deferment 2 period`);
            }

            if (contractorLate){
                    if (contractorLate && addBusinessDays(currentStartDate, 7, holidays) <= bill.startDate && contractorActionDate < bill.endDate) {
                        const contractorStartDate = addBusinessDays(currentStartDate, 7, holidays);
                        addResponsibilityPeriod(bill.startDate, contractorActionDate, 'Contractor');
                        console.log(totalResponsibilityDays);
                        totalResponsibilityDays += calculateDaysBetween(bill.startDate, contractorActionDate);
                       
                        console.log(`Contractor period: ${calculateDaysBetween(bill.startDate, contractorActionDate)} days`);
                        
                        console.log(`Updated currentStartDate to ${currentStartDate.toDateString()} after contractor period`);
                    }
                    console.log(addBusinessDays(currentStartDate, 7, holidays));
                    console.log(approvalDate);
                    if(contractorLate && addBusinessDays(currentStartDate, 7, holidays) >= bill.startDate && contractorActionDate < bill.endDate && approvalDate <= bill.startDate){
                        const contractorStartDate = addBusinessDays(currentStartDate, 7, holidays);
                        console.log(contractorStartDate);
                        addResponsibilityPeriod(contractorStartDate, contractorActionDate, 'Contractor');
                        totalResponsibilityDays += calculateDaysBetween(contractorStartDate, contractorActionDate);
                        console.log(`Contractor period: ${calculateDaysBetween(contractorStartDate, contractorActionDate)} days`);
                        
                        console.log(`Updated currentStartDate to ${contractorStartDate.toDateString()} after contractor period`);
                    }
                    if(contractorLate && addBusinessDays(currentStartDate, 7, holidays) >= bill.startDate && contractorActionDate >= bill.endDate && approvalDate <= bill.startDate && addBusinessDays(currentStartDate, 7, holidays)<= bill.endDate){
                        const contractorStartDate = addBusinessDays(currentStartDate, 7, holidays);
                        addResponsibilityPeriod(contractorStartDate, bill.endDate, 'Contractor');
                        totalResponsibilityDays += calculateDaysBetween(contractorStartDate, bill.endDate);
                        console.log(`Contractor period: ${calculateDaysBetween(contractorStartDate, bill.endDate)} days`);
                        console.log(`Updated currentStartDate to ${currentStartDate.toDateString()} after contractor period`);
                    }
                    // if(contractorLate && addBusinessDays(currentStartDate, 7, holidays) >= bill.startDate && contractorActionDate >= bill.endDate && approvalDate <= bill.startDate && accountantLate ){
                    //     const contractorStartDate = addBusinessDays(currentStartDate, 7, holidays);
                    //     addResponsibilityPeriod(contractorStartDate, bill.endDate, 'Contractor');
                    //     totalResponsibilityDays += calculateDaysBetween(contractorStartDate, bill.endDate);
                    //     console.log(`Contractor period: ${calculateDaysBetween(contractorStartDate, bill.endDate)} days`);
                    //     console.log(`Updated currentStartDate to ${currentStartDate.toDateString()} after contractor period`);
                    // }
                    if(contractorLate && addBusinessDays(currentStartDate, 7, holidays) <= bill.startDate && contractorActionDate >= bill.endDate){
                        const contractorStartDate = addBusinessDays(currentStartDate, 7, holidays);
                        addResponsibilityPeriod(bill.startDate, bill.endDate, 'Contractor');
                        totalResponsibilityDays += calculateDaysBetween(bill.startDate, bill.endDate);
                        console.log(`Contractor period: ${calculateDaysBetween(bill.startDate, bill.endDate)} days`);
                        
                        console.log(`Updated currentStartDate to ${currentStartDate.toDateString()} after contractor period`);
                    }
                    
                    // if (contractorLate && contractorActionDate <= bill.endDate) {
                    //     const contractorStartDate = addDays(currentStartDate, 7);
                    //     addResponsibilityPeriod(bill.startDate, contractorActionDate, 'Contractor');
                    //     totalResponsibilityDays += calculateDaysBetween(bill.startDate, contractorActionDate);
                    //     console.log(`Contractor period: ${calculateDaysBetween(contractorStartDate, contractorActionDate)} days`);
                    //     currentStartDate = contractorActionDate;
                    //     console.log(`Updated currentStartDate to ${currentStartDate.toDateString()} after contractor period`);
                    // }
                    
            }   
            if(totalResponsibilityDays<0){
                totalResponsibilityDays=0;
            }
            const electricityAuthorityDays = totalDays - totalResponsibilityDays;
            console.log(electricityAuthorityDays)
            if (electricityAuthorityDays > 0) {
                const days = electricityAuthorityDays;
                    if (!responsibilityPeriods['Electricity Authority']) {
                        responsibilityPeriods['Electricity Authority'] = { days: 0, amount: 0 };
                    }
                    responsibilityPeriods['Electricity Authority'].days += days;
                    responsibilityPeriods['Electricity Authority'].amount += (days * (bill.amount / calculateDaysBetween(bill.startDate, bill.endDate)));
                    console.log(`Added ${days} days of responsibility for Electricity Authority from ${days} days`);
            }

            responsibilityData[bill.month] = {
                Accountant: responsibilityPeriods['Accountant'] || { days: 0, amount: 0 },
                Deferment1: responsibilityPeriods['Deferment 1'] || { days: 0, amount: 0 },
                Deferment2: responsibilityPeriods['Deferment 2'] || { days: 0, amount: 0 },
                Contractor: responsibilityPeriods['Contractor'] || { days: 0, amount: 0 },
                ElectricityAuthority: responsibilityPeriods['Electricity Authority'] || { days: electricityAuthorityDays, amount: (electricityAuthorityDays * (bill.amount / totalDays)) },
            };
            console.log( responsibilityData[bill.month]);
        } else {
            console.error(`calculateResponsibility: startDate or endDate is null for bill ${bill.month}`);
        }
    });

    updateTable(responsibilityData);
}
// ฟังก์ชันอัปเดตตารางด้วยข้อมูลความรับผิดชอบสำหรับบิลแต่ละเดือน
function updateTable(responsibilityData) {
    const rows = document.querySelectorAll('#dataTable tbody tr');
    rows.forEach(row => {
        const monthCell = row.querySelector('td:nth-child(1)'); // สมมติว่าเดือนอยู่ในคอลัมน์ที่ 1
        const month = monthCell.textContent.trim();
        if (responsibilityData[month]) {
            const data = responsibilityData[month];
            updateTableCell(row, 15, `${data.Accountant.days} วัน`, `${data.Accountant.amount.toFixed(2)} บาท`);
            updateTableCell(row, 16, `${data.Deferment1.days} วัน`, `${data.Deferment1.amount.toFixed(2)} บาท`);
            updateTableCell(row, 16, `${data.Deferment2.days} วัน`, `${data.Deferment2.amount.toFixed(2)} บาท`);
            updateTableCell(row, 16, `${data.Contractor.days} วัน`, `${data.Contractor.amount.toFixed(2)} บาท`);
            updateTableCell(row, 17, `${data.ElectricityAuthority.days} วัน`, `${data.ElectricityAuthority.amount.toFixed(2)} บาท`);
        }
    });
}

// ฟังก์ชันอัปเดตเซลล์ในตาราง
function updateTableCell(row, dayColumnIndex, daysText, amountText) {
    const daysCell = row.querySelector(`td:nth-child(${dayColumnIndex})`);
    const amountCell = row.querySelector(`td:nth-child(${dayColumnIndex + 4})`);
    if (daysCell) {
        daysCell.textContent = daysText;
    }
    if (amountCell) {
        amountCell.textContent = amountText;
    }
}

// ฟังก์ชันดึงข้อมูลจากตาราง
function getTableData() {
    const tableRows = document.querySelectorAll('#tableform tr'); // เลือกทุกแถวในตารางที่มี id #tableform
    const bills = [];

    tableRows.forEach(row => {
        const cells = row.querySelectorAll('td'); // เลือกทุกเซลล์ในแถว
        if (cells.length >= 6) { // ตรวจสอบว่ามีจำนวนเซลล์เพียงพอหรือไม่
            const regisDateInput = cells[1].querySelector('input'); // ดึง input ของวันที่เริ่มต้น
            const startDateInput = cells[2].querySelector('input'); // ดึง input ของวันที่เริ่มต้น
            const endDateInput = cells[3].querySelector('input'); // ดึง input ของวันที่สิ้นสุด
            const totalDays = parseInt(cells[4].textContent.trim()); // ดึงจำนวนวันที่ใช้ไฟฟ้า
            const id = row.getAttribute('data-id'); // ดึง `id` จากแอตทริบิวต์ data-id ของแถว

            const bill = {
                id: id, // เก็บ id
                month: cells[0].textContent.trim(), // ดึงข้อมูลเดือน
                dateRegis: regisDateInput ? new Date(regisDateInput.value.trim().split('-').reverse().join('-')) : null, // ดึงวันที่เริ่มต้น
                startDate: startDateInput ? new Date(startDateInput.value.trim().split('-').reverse().join('-')) : null, // ดึงวันที่เริ่มต้น
                endDate: endDateInput ? new Date(endDateInput.value.trim().split('-').reverse().join('-')) : null, // ดึงวันที่สิ้นสุด
                totalDays: totalDays,
                amount: parseFloat(cells[5].textContent.trim().replace(/,/g, '')), // ดึงจำนวนเงิน
                dateSystem: formatDateJS(cells[7].textContent.trim()), // ดึงวันที่ระบบ
                dateEmployee: formatDateJS(cells[8].textContent.trim()), // ดึงวันที่พนักงาน
                dateDeferment: formatDateJS(cells[9].textContent.trim()), // ดึงวันที่เลื่อนกำหนด
                dateDeferment2: formatDateJS(cells[10].textContent.trim()), // ดึงวันที่เลื่อนกำหนดครั้งที่สอง
                dateCompany: formatDateJS(cells[11].textContent.trim()), // ดึงวันที่บริษัท
                daysEmployee: parseInt(cells[14].textContent.trim()), // ดึงจำนวนวันที่พนักงาน
                daysCompany: parseInt(cells[15].textContent.trim()), // ดึงจำนวนวันที่บริษัท
                daysPea: parseInt(cells[16].textContent.trim()), // ดึงจำนวนวันที่ PEA
                amountPay: parseFloat(cells[17].textContent.trim().replace(/,/g, '')), // ดึงจำนวนเงินที่ต้องจ่าย
                amountEmployee: parseFloat(cells[18].textContent.trim().replace(/,/g, '')), // ดึงจำนวนเงินที่พนักงานจ่าย
                amountCompany: parseFloat(cells[19].textContent.trim().replace(/,/g, '')), // ดึงจำนวนเงินที่บริษัทจ่าย
                amountPea: parseFloat(cells[20].textContent.trim().replace(/,/g, '')) // ดึงจำนวนเงินที่ PEA จ่าย
            };

            bills.push(bill); // เพิ่มข้อมูลของบิลเข้าไปในอาร์เรย์ bills
        } else {
            console.error(`getTableData: row has insufficient cells ${row.innerHTML}`); // แจ้งเตือนเมื่อแถวมีเซลล์ไม่ครบถ้วน
        }
    });

    return bills; // คืนค่าข้อมูลที่ดึงได้ทั้งหมด
}

// ฟังก์ชันจัดรูปแบบวันที่จาก dd-mm-yyyy เป็น JavaScript Date หรือฟอร์แมตอื่นที่ต้องการ
function formatDateJS(dateStr) {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('-'); // แยกวันที่ เดือน ปี ออกจากกัน
    return new Date(`${year}-${month}-${day}`); // สร้างวันที่ในฟอร์แมตที่ JS เข้าใจ (yyyy-mm-dd)
}


// ปุ่มคำนวณ
document.getElementById('calculateButton').addEventListener('click', calculateResponsibility);



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