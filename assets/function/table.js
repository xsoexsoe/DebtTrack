
function initializeDataTable() {
    const table = $("#dataTable").DataTable({
        "pagingType": "full_numbers",
        "lengthMenu": [5, 10, 25, 50],
        "pageLength": 10,
        "language": {
            "paginate": {
                "first": "<<",
                "last": ">>",
                "next": ">",
                "previous": "<"
            }
        }
    });

    // ฟังก์ชันกรองข้อมูลแบบกำหนดเอง ที่จะกรองข้อมูลตามตัวเลือกจาก dropdown
    $.fn.dataTable.ext.search.push(
        function(settings, data, dataIndex) {
            const selectedYear = $('#yearFilter').val();
            const selectedCommand = $('#commandFilter').val();
            const selectedStatus = $('#statusFilter').val(); // รับค่าสถานะที่เลือก
            const commandColumn = data[6]; // คำสั่งอยู่ในคอลัมน์ที่เจ็ด
            const statusColumn = data[7]; // สถานะอยู่ในคอลัมน์ที่แปด
            const [command, year] = commandColumn.split('/'); // แยกข้อมูลคอลัมน์

            // ตรวจสอบว่าตัวกรองที่เลือกตรงกับข้อมูลในตาราง
            if ((selectedYear === "" || year === selectedYear) &&
                (selectedCommand === "" || command === selectedCommand) &&
                (selectedStatus === "" || statusColumn.includes(selectedStatus))) {
                return true;
            }
            return false;
        }
    );

    // ตัวดักฟังเหตุการณ์สำหรับฟิลเตอร์
    $('#yearFilter, #commandFilter, #statusFilter').on('change', function() {
        table.draw();
    });
}

function populateFilters(data) {
    const yearSet = new Set();
    const idCommands = {};

    data.forEach(row => {
        const [command, year] = row.id_command.split('/');
        yearSet.add(year);
        if (!idCommands[year]) {
            idCommands[year] = new Set();
        }
        idCommands[year].add(command);
    });

    const yearFilter = document.getElementById('yearFilter');
    yearFilter.innerHTML = '<option value="">All</option>'; // Reset year filter
    yearSet.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.text = year;
        yearFilter.appendChild(option);
    });

    const commandFilter = document.getElementById('commandFilter');
    yearFilter.addEventListener('change', function() {
        const selectedYear = yearFilter.value;
        commandFilter.innerHTML = '<option value="">All</option>'; // Reset command filter
        if (idCommands[selectedYear]) {
            idCommands[selectedYear].forEach(command => {
                const option = document.createElement('option');
                option.value = command;
                option.text = command;
                commandFilter.appendChild(option);
            });
        }
    });
}

function populateTable(sumMoneyResults, countResults, joinResults) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // เคลียร์ข้อมูลเก่า

    sumMoneyResults.forEach(sumRow => {
        const countRow = countResults.find(cr => cr.customer_ca === sumRow.customer_ca && cr.id_command === sumRow.id_command);
        const joinRow = joinResults.find(jr => jr.customer_ca === sumRow.customer_ca);

        // ทำให้แน่ใจว่า total_money เป็นตัวเลขที่ถูกต้อง
        let totalMoney = parseFloat(sumRow.total_money);

        // ตรวจสอบ NaN, null หรือ undefined และจัดการอย่างเหมาะสม
        if (isNaN(totalMoney) || totalMoney == null) {
            console.error('Invalid total_money value:', sumRow.total_money);
            totalMoney = 0; // ตั้งค่าเริ่มต้นเป็น 0 หรือจัดการตามที่จำเป็น
        }

        const formattedTotalMoney = totalMoney.toFixed(2);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center align-middle">${joinRow ? joinRow.id_pea : '-'}</td>
            <td class="text-center align-middle">${joinRow ? joinRow.pea_position : '-'}</td>
            <td class="text-center align-middle">${joinRow ? joinRow.ca : '-'}</td>
            <td class="text-center align-middle">${joinRow ? joinRow.name : '-'}</td>
            <td class="text-center align-middle">${countRow ? countRow.count_bills : '-'}</td>
            <td class="text-end align-middle">${formattedTotalMoney}</td>
            <td class="text-center align-middle">${sumRow.id_command}</td>
            <td><span class="badge ${joinRow.status === 'ชำระเงินแล้ว' ? 'status-paid-count' : joinRow.status === 'ดำเนินการแล้ว' ? 'status-complete' : (joinRow.status === 'ยังไม่ได้ชำระเงิน' ? 'status-unpaid-count':'status-pending-count')} rounded-pill text-center align-middle" style="display: inline-block; width: 100%; padding: 10px;">
            ${joinRow.status || '-'}</span></td>
            <td class="text-center align-middle"><a class="btn btn-outline-warning  d-none d-sm-inline-block" role="button" href="form.html?id_command=${sumRow.id_command}&customer_ca=${sumRow.customer_ca}&total_money=${sumRow.total_money}&name=${joinRow ? joinRow.name : '-'}&num_bills=${countRow ? countRow.count_bills : '-'}"><i class="fas fa-edit text-yellow-50 fa-sm"></i>&nbsp;แก้ไข</a></td>
        `;
        tableBody.appendChild(tr);
    });

    // เรียกใช้ DataTable หลังจากเติมข้อมูลเรียบร้อยแล้ว
    initializeDataTable();
}


function fetchDataAndPopulateTable() {

    fetch('/data')
        .then(response => response.json())
        .then(data => {
            console.log('Data received from API:', data);  // Log the data received from API
            const { sumMoneyResults, countResults, joinResults } = data;

            // Check if the results are arrays before calling populateTable
            if (Array.isArray(sumMoneyResults) && Array.isArray(countResults) && Array.isArray(joinResults)) {
                populateFilters(sumMoneyResults);
                populateTable(sumMoneyResults, countResults, joinResults);
            } else {
                console.error('Unexpected data format:', data);
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}


// Initialize DataTable when the document is ready
$(document).ready(function () {
    fetchDataAndPopulateTable();
});
