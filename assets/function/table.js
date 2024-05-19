
// $(document).ready(function(){
//     const tableBody = $("#tableBody");
//     const pagination = $("#pagination");
//     const dataInfo = $("#dataTable_info"); // Select data info element
//     let currentPage = 1;
//     let itemsPerPage = 10; // Default number of items per page
//     let fetchedData; // Variable to store fetched data
  

//     // Fetch data from API and populate table
//     function fetchData() {
//       fetch('http://localhost:5500/data')
//         .then(response => response.json())
//         .then(data => {
//           fetchedData = data; // Store fetched data in a variable
//           // Calculate total pages
//           const totalPages = Math.ceil(data.length / itemsPerPage);
//           displayPagination(totalPages);
  
//           // Display data for the current page
//           displayData(currentPage);
//         })
//         .catch(error => console.error('Error fetching data:', error));
//     }

//     // Filter table data based on search input
// $("#dataTable_filter input").on("input", function() {
//     const searchText = $(this).val().trim().toLowerCase(); // Get search text and convert to lowercase
//     const filteredData = fetchedData.filter(row => { // Filter data based on search text
//       return Object.values(row).some(value =>
//         value.toString().toLowerCase().includes(searchText)
//       );
//     });
//     displayDataBySearch(filteredData); // Display filtered data
//   });
  

// // Function to display data based on search
// function displayDataBySearch(data) {
//     tableBody.empty(); // Clear current table data
//     if (!data) return; // Check if data is null or undefined
//     data.forEach(row => { // Iterate through filtered data and display in table
//       if (!row) return; // Check if row is null or undefined
//       const tr = $("<tr>");
//       tr.html(`
//         <td style="border-width: 2px;">${row.idpea ? row.idpea.toString() : ''}</td>
//         <td style="border-width: 2px;">${row.pea_position ? row.pea_position.toString() : ''}</td>
//         <td style="border-width: 2px;">${row.ca ? row.ca.toString() : ''}</td>
//         <td style="border-width: 2px;">${row.name ? row.name.toString() : ''}</td>
//         <td style="border-width: 2px;">${row.bill_num ? row.bill_num.toString() : ''}</td>
//         <td style="border-width: 2px;">${row.bill_amount ? row.bill_amount.toString() : ''}</td>
//         <td style="border-width: 2px;">${row.status ? row.status.toString() : ''}</td>
//       `);
//       tableBody.append(tr);
//     });
//   }

  
  
  
//     // Function to display data
//     function displayData(page) {
//       tableBody.empty();
//       const startIndex = (page - 1) * itemsPerPage;
//       const endIndex = page * itemsPerPage;
  
//       for (let i = startIndex; i < endIndex; i++) {
//         if (i >= fetchedData.length) {
//           break;
//         }
//         const row = fetchedData[i];
//         const tr = $("<tr>");
//         tr.html(`
//           <td style="border-width: 2px;">${row.idpea}</td>
//           <td style="border-width: 2px;">${row.pea_position}</td>
//           <td style="border-width: 2px;">${row.ca}</td>
//           <td style="border-width: 2px;">${row.name}</td>
//           <td style="border-width: 2px;">${row.bill_num}</td>
//           <td style="border-width: 2px;">${row.bill_amount}</td>
//           <td style="border-width: 2px;">${row.status}</td>
//         `);
//         tableBody.append(tr);
//       }
  
//       // Calculate start and end item numbers for display
//       const startItem = Math.min((page - 1) * itemsPerPage + 1, fetchedData.length);
//       const endItem = Math.min(page * itemsPerPage, fetchedData.length);
//       // Update data info
//       dataInfo.text(`Showing ${startItem} to ${endItem} of ${fetchedData.length}`);
//       // Update pagination
//     const totalPages = Math.ceil(fetchedData.length / itemsPerPage);
//     displayPagination(totalPages);
//     }
  
//     // Function to display pagination
//     function displayPagination(totalPages) {
//         pagination.empty();
      
//         // Calculate start and end page numbers for display
//         let startPage = Math.max(1, currentPage - 1);
//         let endPage = Math.min(totalPages, currentPage + 1);
      
//         // If there are more than 3 pages and current page is not the first or last, adjust startPage and endPage
//         if (totalPages > 3 && currentPage > 1 && currentPage < totalPages) {
//           startPage = currentPage - 1;
//           endPage = currentPage + 1;
//         } else if (totalPages <= 3) {
//           startPage = 1;
//           endPage = totalPages;
//         } else if (currentPage === 1) {
//           endPage = 3;
//         } else if (currentPage === totalPages) {
//           startPage = totalPages - 2;
//         }
      
//         // Add "Previous" button
//         if (currentPage > 1) {
//           const prevLi = $("<li>").addClass("page-item");
//           const prevA = $("<a>").addClass("page-link").attr("href", "#").text("Previous");
//           prevA.click(function() {
//             currentPage--;
//             displayData(currentPage); // Display data for the selected page
//             displayPagination(totalPages); // Re-render pagination
//           });
//           prevLi.append(prevA);
//           pagination.append(prevLi);
//         }
      
//         // Add page numbers
//         for (let i = startPage; i <= endPage; i++) {
//           const li = $("<li>").addClass("page-item");
//           const a = $("<a>").addClass("page-link").attr("href", "#").text(i);
//           a.click(function() {
//             currentPage = i;
//             displayData(currentPage); // Display data for the selected page
//             displayPagination(totalPages); // Re-render pagination
//           });
//           li.append(a);
//           pagination.append(li);
//         }
      
//         // Add "Next" button
//         if (currentPage < totalPages) {
//           const nextLi = $("<li>").addClass("page-item");
//           const nextA = $("<a>").addClass("page-link").attr("href", "#").text("Next");
//           nextA.click(function() {
//             currentPage++;
//             displayData(currentPage); // Display data for the selected page
//             displayPagination(totalPages); // Re-render pagination
//           });
//           nextLi.append(nextA);
//           pagination.append(nextLi);
//         }
//       }
//     // Event listener for changing number of items per page
//     $("#rowsPerPage").change(function(){
//       itemsPerPage = parseInt($(this).val());
//       displayData(currentPage); // Display data with the updated items per page
//     });
  
//     // Initial data fetch
//     fetchData();
    
//   });
  