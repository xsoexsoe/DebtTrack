function uploadExcelEtsx() {
    var fileInput = document.getElementById('fileInputEtsx');
    if (fileInput.files.length === 0) {
        alert('Please select a file!');
        return;
    }
    var file = fileInput.files[0];
    var formData = new FormData();
    formData.append('file', file);

    var overlay = document.getElementById('overlayEtsx');
    overlay.style.display = 'block';

    fetch('/upload-etsx', {
        method: 'POST',
        body: formData
    }).then(response => {
        overlay.style.display = 'none';
        if (!response.ok) {
            // Check if the response is not OK
            return response.text().then(text => {
                throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
            });
        }
        return response.json();
    }).then(data => {
        if (data.success) {
            alert('File uploaded and database updated successfully!');
        } else {
            alert('An error occurred while uploading the file: ' + data.message);
        }
    }).catch(error => {
        overlay.style.display = 'none';
        alert('An error occurred: ' + error.message);
    });
}
