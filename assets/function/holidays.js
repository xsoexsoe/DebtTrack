// ฟังก์ชันจัดรูปแบบวันที่ให้แสดงเฉพาะวันที่
function formatDate(date) {
    if (!date) return '';
    const buddhistYear = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${buddhistYear}`;
}

// ดึงข้อมูลวันหยุดพร้อมรายละเอียด
let holidayDates = [];
let holidayDescriptions = {};


fetch('/api/holidays')
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
        const dateInputs = ['#date_holiday'];
    
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

document.addEventListener('DOMContentLoaded', function () {
    const holidayForm = document.querySelector('.user');
    const holidayList = document.getElementById('holiday-list');
    const saveButton = document.getElementById('save-button');
    let editMode = false;
    let editId = null;

    fetchHolidays();

    saveButton.addEventListener('click', function () {
        const date = document.getElementById('date_holiday').value;
        const description = document.getElementById('description').value;

        if (!date || !description) {
            alert("กรุณากรอกวันที่และรายละเอียด");
            return;
        }

        const formattedDate = formatDateToYYYYMMDD(date);
        if (editMode) {
            updateHoliday(editId, formattedDate, description);
        } else {
            addHoliday(formattedDate, description);
        }
    });

    function addHoliday(date, description) {

        fetch('/add_holiday', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, description })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.text();
        })
        .then(result => {
            alert(result);
            fetchHolidays();
            holidayForm.reset();
        })
        .catch(error => {
            if (error.message === 'Duplicate holiday date') {
                alert('มีข้อมูลวันที่นี้อยู่แล้ว');
            } else {
                alert('Error: ' + error.message);
            }
            console.error('Error:', error);
        });
    }

    function updateHoliday(id, date, description) {
        console.log('Update Holiday ID:', id);
        console.log('Date:', date);
        console.log('Description:', description);

        fetch('/update_holiday/${id}', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, description })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.text();
        })
        .then(result => {
            alert(result);
            fetchHolidays();
            holidayForm.reset();
            editMode = false;
            editId = null;
        })
        .catch(error => {
            alert('Error: ' + error.message);
            console.error('Error:', error);
        });
    }

    function fetchHolidays() {
        fetch('/api/holidays')
            .then(response => response.json())
            .then(holidays => {
                holidayList.innerHTML = '';
                holidays.forEach(holiday => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="text-center align-middle" style="width: 25%;">${formatDateForDisplay(new Date(holiday.date))}</td>
                        <td class="text-center align-middle">${holiday.description}</td>
                        <td>
                            <button class="btn btn-outline-danger btn-md d-sm-inline-block" style="font-family: Prompt, sans-serif;font-size: 18px;" onclick="deleteHoliday(${holiday.id}, event)">ลบ</button>
                        </td>
                    `;
                    row.addEventListener('click', () => loadHolidayToForm(holiday));
                    holidayList.appendChild(row);
                });
            })
            .catch(error => console.error('Error fetching holidays:', error));
    }

    function loadHolidayToForm(holiday) {
        document.getElementById('holiday-id').value = holiday.id;
        document.getElementById('date_holiday').value = formatDateForInput(new Date(holiday.date));
        document.getElementById('description').value = holiday.description;
        editMode = true;
        editId = holiday.id;
    }

    window.deleteHoliday = function(id, event) {
    
        console.log('Deleting Holiday ID:', id); // ตรวจสอบว่า id ถูกส่งมาถูกต้อง

        fetch('/delete_holiday/${id}', {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(result => {
            alert(result);
            fetchHolidays();
        })
        .catch(error => console.error('Error:', error));
    }

    function formatDateToYYYYMMDD(dateStr) {
        const [day, month, year] = dateStr.split('-');
        return `${year}-${month}-${day}`;
    }

    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    }

    function formatDateForDisplay(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    }
});
