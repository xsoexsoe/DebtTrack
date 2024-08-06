function loadDataForUpload() {

     fetch('/api/id_commands')
        .then(response => response.json())
        .then(data => {
            // console.log('Fetched id_commands:', data); // เพิ่ม console.log เพื่อตรวจสอบข้อมูลที่ดึงมา

            const years = new Set();
            const idCommands = {};

            data.forEach(command => {
                const [order, year] = command.split('/');
                years.add(year);
                if (!idCommands[year]) {
                    idCommands[year] = new Set();
                }
                idCommands[year].add(order);
            });

            // console.log('Parsed years:', Array.from(years)); // เพิ่ม console.log เพื่อตรวจสอบปีที่แยกออกมา
            // console.log('Parsed idCommands:', idCommands); // เพิ่ม console.log เพื่อตรวจสอบคำสั่งที่แยกออกมา

            const yearSelect = document.getElementById('year030');
            const orderSelect = document.getElementById('orderNumber030');

            yearSelect.innerHTML = ''; // ล้าง dropdown ก่อนเติมข้อมูลใหม่
            orderSelect.innerHTML = ''; // ล้าง dropdown ก่อนเติมข้อมูลใหม่

            // เพิ่มตัวเลือกปีใน dropdown
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });

            // ตั้งค่าตัวเลือกแรกเริ่มใน dropdown ของปี
            if (years.size > 0) {
                const firstYear = Array.from(years)[0];
                yearSelect.value = firstYear;
                updateOrderNumberDropdown(firstYear);
            }

            // ฟังก์ชันสำหรับอัปเดต dropdown ของ "เลขที่คำสั่ง"
            function updateOrderNumberDropdown(selectedYear) {
                orderSelect.innerHTML = '';
                // console.log('Selected year:', selectedYear); // เพิ่ม console.log เพื่อตรวจสอบปีที่เลือก

                if (idCommands[selectedYear]) {
                    idCommands[selectedYear].forEach(order => {
                        const option = document.createElement('option');
                        option.value = order;
                        option.textContent = order;
                        orderSelect.appendChild(option);
                    });
                    // console.log('Updated orderNumber030 options:', orderSelect.innerHTML); // เพิ่ม console.log เพื่อตรวจสอบ options ใน orderNumber
                } else {
                    console.log('No commands found for selected year'); // เพิ่ม console.log เมื่อไม่พบคำสั่งในปีที่เลือก
                }
            }

            // ตั้งค่า event listener สำหรับ dropdown ของปี
            yearSelect.addEventListener('change', function() {
                const selectedYear = yearSelect.value;
                updateOrderNumberDropdown(selectedYear);
            });
        })
        .catch(error => console.error('Error fetching id_commands:', error));
}

async function uploadExcel030() {
    const fileInput = document.getElementById('fileInput030');
    const file = fileInput.files[0];
    const orderNumber = document.getElementById('orderNumber030').value;
    const year = document.getElementById('year030').value;

    if (!file || !orderNumber || !year) {
        alert('Please fill in all fields and select a file.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('orderNumber', orderNumber);
    formData.append('year', year);

    const overlay = document.getElementById('overlay030');
    overlay.style.display = 'block'; // แสดง pop-up

    try {

        const response = await fetch('/upload030', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        // console.log('Upload response:', data); // เพิ่ม console.log เพื่อตรวจสอบ response จาก server

        if (data.noNewBills) {
            var successModal = new bootstrap.Modal(document.getElementById('noNewBillsModal'));
            successModal.show();
        } else {
            var successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        overlay.style.display = 'none'; // ซ่อน pop-up เมื่ออัปโหลดเสร็จสิ้น
    }
}

