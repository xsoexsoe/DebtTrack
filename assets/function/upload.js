// upload.js

async function uploadExcel121() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const overlay = document.getElementById('overlay');
    overlay.style.display = 'block'; // แสดง pop-up

    try {
        const response = await fetch('http://localhost:5500/upload121', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // แสดง Modal เมื่ออัปโหลดสำเร็จ
        var successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
    } catch (error) {
        console.error('Error:', error);
    } finally {
        overlay.style.display = 'none'; // ซ่อน pop-up เมื่ออัปโหลดเสร็จสิ้น
    }
}

async function uploadExcel030() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const overlay = document.getElementById('overlay');
    overlay.style.display = 'block'; // แสดง pop-up

    try {
        const response = await fetch('http://localhost:5500/upload030', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        // แสดง Modal เมื่ออัปโหลดสำเร็จ
        var successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
    } catch (error) {
        console.error('Error:', error);
    } finally {
        overlay.style.display = 'none'; // ซ่อน pop-up เมื่ออัปโหลดเสร็จสิ้น
    }
}