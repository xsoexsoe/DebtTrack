document.getElementById('dataForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;

    fetch('/submit-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, date })
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// ดึงข้อมูลวันหยุดพร้อมรายละเอียด
fetch('http://localhost:5500/holidays')
    .then(response => response.json())
    .then(holidays => {
        const holidayDates = holidays.map(holiday => holiday.date.split('T')[0]); // แปลงรูปแบบวันที่ให้เป็น YYYY-MM-DD
        const holidayDescriptions = {};
        holidays.forEach(holiday => {
            holidayDescriptions[holiday.date.split('T')[0]] = holiday.description;
        });

        flatpickr("#date", {
            dateFormat: "Y-m-d",
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
    })
    .catch(error => {
        console.error('Error fetching holidays:', error);
    });
