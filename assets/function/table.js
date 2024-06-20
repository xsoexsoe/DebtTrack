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

    // Custom filtering function which will filter data based on the dropdown selection
    $.fn.dataTable.ext.search.push(
        function(settings, data, dataIndex) {
            const selectedStatus = $('#statusFilter').val();
            const status = data[7]; // Status column index
            
            if (selectedStatus === "" || status.includes(selectedStatus)) {
                return true;
            }
            return false;
        }
    );

    // Event listener for the status filter dropdown
    $('#statusFilter').on('change', function() {
        table.draw();
    });
}

function populateTable(sumMoneyResults, countResults, joinResults) {
    const tableBody = document.getElementById('tableBody');

    sumMoneyResults.forEach(sumRow => {
        const countRow = countResults.find(cr => cr.customer_ca === sumRow.customer_ca && cr.id_command === sumRow.id_command);
        const joinRow = joinResults.find(jr => jr.customer_ca === sumRow.customer_ca);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center align-middle">${joinRow ? joinRow.id_pea : '-'}</td>
            <td class="text-center align-middle">${joinRow ? joinRow.pea_position : '-'}</td>
            <td class="text-center align-middle">${joinRow ? joinRow.ca : '-'}</td>
            <td class="text-center align-middle">${joinRow ? joinRow.name : '-'}</td>
            <td class="text-center align-middle">${countRow ? countRow.count_bills : '-'}</td>
            <td class="text-end align-middle">${sumRow.total_money.toFixed(2)}</td>
            <td class="text-center align-middle">${sumRow.id_command}</td>
            <td><span class="badge ${joinRow.status === 'ชำระเงินเรียบร้อยแล้ว' ? 'bg-success' : (joinRow.status === 'ดำเนินการแล้ว' ? 'bg-primary' : 'bg-warning')} rounded-pill" style="display: inline-block; width: 100%; padding: 10px;">
    ${joinRow.status || '-'}</td>
            <td><a class="btn btn-outline-warning btn-sm d-none d-sm-inline-block" role="button" href="form.html?id_command=${sumRow.id_command}&customer_ca=${sumRow.customer_ca}&total_money=${sumRow.total_money}&name=${joinRow ? joinRow.name : '-'}&num_bills=${countRow ? countRow.count_bills : '-'}"><i class="fas fa-edit text-yellow-50 fa-sm"></i>&nbsp;แก้ไข</a></td>
        `;
        tableBody.appendChild(tr);
    });

    // Initialize DataTable after data is populated
    initializeDataTable();
}

// Fetch data from API and populate the table
fetch('http://localhost:5500/data')
    .then(response => response.json())
    .then(data => {
        console.log('Data received from API:', data);  // Log the data received from API
        const { sumMoneyResults, countResults, joinResults } = data;

        // Check if the results are arrays before calling populateTable
        if (Array.isArray(sumMoneyResults) && Array.isArray(countResults) && Array.isArray(joinResults)) {
            populateTable(sumMoneyResults, countResults, joinResults);
        } else {
            console.error('Unexpected data format:', data);
        }
    })
    .catch(error => console.error('Error fetching data:', error));

// Initialize DataTable when the document is ready
$(document).ready(function () {
    // DataTable will be initialized after data is populated
});
