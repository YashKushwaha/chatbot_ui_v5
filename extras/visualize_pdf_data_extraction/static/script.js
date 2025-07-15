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

function handleClickOnPDFNames(event) {
  if (event.target && event.target.classList.contains('file-name')) {
    document.querySelectorAll('.file-name').forEach(el => el.classList.remove('selected'));
    event.target.classList.add('selected');
    const fileName = event.target.textContent.trim(); 
    const url = `/pdf/${encodeURIComponent(fileName)}`;
    loadPdf(url);
    }
}

async function loadPdf(url) {
  const pdf = await pdfjsLib.getDocument(url).promise;
  const container = document.getElementById("pdf-container");
  container.innerHTML="";
  const scale = 1.5;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Container for canvas + overlays
    const pageWrapper = document.createElement("div");
    pageWrapper.style.position = "relative";
    pageWrapper.style.marginBottom = "20px";
    pageWrapper.style.width = `${viewport.width}px`;
    pageWrapper.style.height = `${viewport.height}px`;

    // Canvas rendering the PDF page
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.position = "absolute";
    canvas.style.top = 0;
    canvas.style.left = 0;

    pageWrapper.appendChild(canvas);
    container.appendChild(pageWrapper);

    const renderContext = {
      canvasContext: ctx,
      viewport
    };

    await page.render(renderContext).promise;

    // Draw bounding boxes and hoverable overlays
    // drawBoundingBoxesWithHover(bboxData, page, viewport, ctx, pageWrapper);
  }
}

fetch('/get_pdf_list')
  .then(response => response.json())
  .then(file_list => showPDFList(file_list, pdfListContainer));


pdfListContainer.addEventListener('click', handleClickOnPDFNames)