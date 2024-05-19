function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        const files = fileInput.files;
        if (files.length > 0) {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data); // เมื่ออัปโหลดเสร็จสิ้น รับข้อมูลที่ส่งกลับจากเซิร์ฟเวอร์
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            console.log("ไม่พบไฟล์ที่จะอัปโหลด");
        }
    } else {
        console.log("ไม่พบอิลิเมนต์ input ของไฟล์");
    }
}
