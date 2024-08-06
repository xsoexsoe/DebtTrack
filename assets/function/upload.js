async function uploadExcel121() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const orderNumber = document.getElementById('orderNumber121').value;
    const year = document.getElementById('year121').value;

    // ตรวจสอบว่าทุก input field ถูกกรอกแล้ว
    if (!file || !orderNumber || !year) {
        alert('กรุณากรอกข้อมูลให้ครบทุกช่องและเลือกไฟล์');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('orderNumber', orderNumber);
    formData.append('year', year);

    const overlay = document.getElementById('overlay');
    overlay.style.display = 'block'; // แสดง pop-up

    try {
 
        const response = await fetch('/upload121', {
            method: 'POST',
            body: formData
        });

        // ตรวจสอบว่า response สำเร็จหรือไม่
        if (!response.ok) {
            throw new Error('การอัปโหลดไฟล์ล้มเหลว');
        }

        const data = await response.json();

        // แสดง modal ตามผลลัพธ์ที่ได้รับ
        if (data.noNewBills) {
            const noNewBillsModal = new bootstrap.Modal(document.getElementById('noNewBillsModal'));
            noNewBillsModal.show();
        } else {
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการอัปโหลด กรุณาลองใหม่อีกครั้ง');
    } finally {
        overlay.style.display = 'none'; // ซ่อน pop-up เมื่ออัปโหลดเสร็จสิ้น
    }
}
