async function uploadExcel121() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const orderNumber = document.getElementById('orderNumber121').value;
    const year = document.getElementById('year121').value;

    // ตรวจสอบว่าทุก input field ถูกกรอกแล้ว
    if (!file || !orderNumber || !year) {
        alert('Please fill in all fields and select a file.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('orderNumber', orderNumber);
    formData.append('year', year);

    const overlay = document.getElementById('overlay');
    overlay.style.display = 'block'; // แสดง pop-up

    try {
        const response = await fetch('http://localhost:5500/upload121', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

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

