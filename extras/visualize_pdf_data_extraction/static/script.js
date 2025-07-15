const pdfListContainer = document.getElementById("pdf-list-container")
pdfListContainer.innerHTML=""

function showPDFList(file_list, pdf_list_container){
    file_list.forEach(file_name => {
        child = document.createElement('div')
        child.className  = 'file-name'
        child.innerHTML = file_name
        pdf_list_container.appendChild(child)
    })

}


fetch('/get_pdf_list')
  .then(response => response.json())
  .then(file_list => showPDFList(file_list, pdfListContainer));