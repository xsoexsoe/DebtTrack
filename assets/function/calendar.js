function isWeekend(date) {
    const day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    return day === 0 || day === 6; // Sunday or Saturday
}

function isHoliday(date) {
    // เพิ่มเงื่อนไขเพิ่มเติมที่นี่เพื่อตรวจสอบว่าวันที่เป็นวันหยุดหรือไม่
    // สำหรับตัวอย่างเราจะใช้วันหยุดที่เป็นวันหยุดประจำของประเทศไทย
    const thaiHolidays = [
        "2024-05-01",
        "2024-05-06"
        // เพิ่มวันหยุดเพิ่มเติมตรงนี้
    ];
    const dateString = date.toISOString().split('T')[0]; // แปลงวันที่เป็นรูปแบบ ISO (YYYY-MM-DD)
    return thaiHolidays.includes(dateString);
}

function countWorkingDays(startDate, endDate) {
    let currentDate = new Date(startDate);
    let workingDays = 0;
    while (currentDate <= endDate) {
        if (!isWeekend(currentDate) && !isHoliday(currentDate)) {
            workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1); // เพิ่มจำนวนวันลงไปทีละ 1
    }
    return workingDays;
}

// ตัวอย่างการใช้งาน
const startDate = new Date("2024-05-01"); // วันที่เริ่มต้น
const endDate = new Date("2024-05-10");   // วันที่สิ้นสุด
const workingDays = countWorkingDays(startDate, endDate);
console.log("จำนวนวันทำงาน:", workingDays);