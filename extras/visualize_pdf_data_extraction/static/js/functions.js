function showPDFList(file_list, pdf_list_container){
    file_list.forEach(file_name => {
        const child = document.createElement('div');
        child.className  = 'file-name';
        child.innerHTML = file_name;
        pdf_list_container.appendChild(child);
    })
}

function countItems(list) {
  return list.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
}

function createTable(table_data){
    const container = document.createElement('div');
    container.className = "table"
    table_data.forEach(line => {
        const row = document.createElement('div');
        row.className = "row-button";
        row.innerHTML = `${line[0]} (${line[1]})`;
        row.dataset.key = line[0];      // becomes data-key="..."
        row.dataset.count = line[1];  
        container.appendChild(row);
    }
    )
  
    return container;
}

function countItemsMap(list) {
  const counts = new Map();
  list.forEach(item => {
    counts.set(item, (counts.get(item) || 0) + 1);
  });
  // Convert Map to array and sort by count (value)
  const sortedArray = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  return sortedArray;
}

export {showPDFList, countItems, createTable, countItemsMap};

