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

    // Custom filtering function which will filter data based on the dropdown selections
    $.fn.dataTable.ext.search.push(
        function(settings, data, dataIndex) {
            const selectedYear = $('#yearFilter').val();
            const selectedCommand = $('#commandFilter').val();
            const commandColumn = data[6]; // Assuming the command is in the seventh column
            const [command, year] = commandColumn.split('/'); // Split the column data

            if ((selectedYear === "" || year === selectedYear) &&
                (selectedCommand === "" || command === selectedCommand)) {
                return true;
            }
            return false;
        }
    );

    // Event listeners for the filters
    $('#yearFilter, #commandFilter').on('change', function() {
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
    tableBody.innerHTML = ''; // Clear existing data

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
            <td class="text-center align-middle"><a class="btn btn-outline-warning btn-sm d-none d-sm-inline-block " role="button" href="form.html?id_command=${sumRow.id_command}&customer_ca=${sumRow.customer_ca}&total_money=${sumRow.total_money}&name=${joinRow ? joinRow.name : '-'}&num_bills=${countRow ? countRow.count_bills : '-'}"><i class="fas fa-edit text-yellow-50 fa-sm"></i>&nbsp;แก้ไข</a></td>
        `;
        tableBody.appendChild(tr);
    });

    // Initialize DataTable after data is populated
    initializeDataTable();
}

function fetchDataAndPopulateTable() {
    fetch('http://localhost:5500/data')
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
