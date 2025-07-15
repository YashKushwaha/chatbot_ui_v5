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
    renderPdf(fileName);
    const index_blocks_value_counts_container = document.getElementById('block-types-to-index');
    index_blocks_value_counts_container.innerHTML="";

    const non_index_blocks_value_counts_container = document.getElementById('block-types-to-not-index');
    non_index_blocks_value_counts_container.innerHTML="";
    }
}

async function renderPdf(fileName) {
  const url = `/pdf/${fileName}`;
  const container = document.getElementById("pdf-container");
  container.innerHTML = "";
  pageWrappers = [];

  const pdf = await pdfjsLib.getDocument(url).promise;
  const scale = 1.5;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.marginBottom = "20px";
    wrapper.style.width = `${viewport.width}px`;
    wrapper.style.height = `${viewport.height}px`;
    wrapper.dataset.page = pageNum;

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    wrapper.appendChild(canvas);
    container.appendChild(wrapper);

    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    pageWrappers.push({ pageNum, viewport, wrapper });
  }

  currentPdfFile = fileName;
}

function showBoundingBoxes(bboxData) {
  if (!currentPdfFile || pageWrappers.length === 0) {
    console.warn("No PDF currently rendered");
    return;
  }

  // Remove previous overlays if any
  pageWrappers.forEach(({ wrapper }) => {
    const existing = wrapper.querySelectorAll('.bbox-overlay');
    existing.forEach(el => el.remove());
  });

  //  bboxData.forEach(({ page, x, y, width, height, label }) => {
  bboxData.forEach((box_data) => {
    page = box_data.page+1;
    bbox = box_data.bbox;
    x = bbox[0];
    y = bbox[1];
    width = bbox[2] - bbox[0];
    height = bbox[3] - bbox[1];
    label = box_data.content;
    const match = pageWrappers.find(p => p.pageNum === page);
    if (!match) return;

    const overlay = document.createElement("div");
    overlay.className = "bbox-overlay";
     overlay.setAttribute("data-block-type", box_data.block_type);
    overlay.style.position = "absolute";
    overlay.style.left = `${x * match.viewport.scale}px`;
    overlay.style.top = `${y * match.viewport.scale}px`;
    overlay.style.width = `${width * match.viewport.scale}px`;
    overlay.style.height = `${height * match.viewport.scale}px`;
    overlay.style.border = "2px solid red";
    overlay.title = label || "";

    match.wrapper.appendChild(overlay);
  });
}

function countItems(list) {
  return list.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
}

function fetchPDFMarkDown(fileName){
    const url = `/get_markdown_data/${fileName}`;
    fetch(url)
        .then(response => response.json())
        .then(markdown => 
            //console.log(markdown.length, typeof markdown)
            
            showMarkdownOverlay(markdown)
        )
        .catch(error => console.error('Error fetching markdown:', error));
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


function fetchBlocksData(fileName){
    const url = `/get_block_data/${fileName}`;
    fetch(url)
        .then(response => response.json())
        .then(block_data_list =>  {
                SectionData = block_data_list;

                const index_blocks =  block_data_list.filter(i => i.include_in_index === true).map(i => i.block_type);
                const index_blocks_value_counts = countItemsMap(index_blocks);

                const non_index_blocks =  block_data_list.filter(i => i.include_in_index === false).map(i => i.block_type);
                const non_index_blocks_counts = countItemsMap(non_index_blocks);

                const index_blocks_value_counts_container = document.getElementById('block-types-to-index');
                index_blocks_value_counts_container.innerHTML="";
                index_blocks_value_counts_container.appendChild(createTable(index_blocks_value_counts));

                const non_index_blocks_value_counts_container = document.getElementById('block-types-to-not-index');
                non_index_blocks_value_counts_container.innerHTML="";
                non_index_blocks_value_counts_container.appendChild(createTable(non_index_blocks_counts));

            }
            //showMarkdownOverlay(markdown)
        )
        .catch(error => console.error('Error fetching markdown:', error));
}



function showMarkdownOverlay(markdownText) {
  const overlay = document.createElement('div');
  overlay.className = 'markdown-overlay';

  const content = document.createElement('div');
  content.className = 'markdown-content';
  content.innerHTML = marked.parse(markdownText); // ← Use Marked.js here

  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // Dismiss on click outside content
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });

  // Dismiss on Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(overlay);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
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

function removeBoundingBoxesForCategory(block_type){
    const bboxes = document.querySelectorAll(`.bbox-overlay[data-block-type="${block_type}"]`);
    console.log('BBoxes will be selected for ', block_type)
    bboxes.forEach(el => el.remove());
}

function handleClickOnBlockTypeNames(event) {
  if (event.target && event.target.classList.contains('row-button')) {
    const key = event.target.dataset.key;
    const bboxes = SectionData.filter(i => i.block_type === key);
    const isSelected = event.target.classList.contains('selected');

    if (isSelected) {
        removeBoundingBoxesForCategory(key);
    } else {
      const bboxes = SectionData.filter(i => i.block_type === key);
      showBoundingBoxes(bboxes); 
    }
    event.target.classList.toggle('selected');
    }
}

const pdfListContainer = document.getElementById("pdf-list-container")
pdfListContainer.addEventListener('click', handleClickOnPDFNames)

pdfListContainer.innerHTML=""

let currentPdfFile = null;
let pageWrappers = [];
let SectionData = null;

fetch('/get_pdf_list')
  .then(response => response.json())
  .then(file_list => showPDFList(file_list, pdfListContainer));

const showMarkDownButton = document.getElementById("command-button");
showMarkDownButton.addEventListener('click', () => {fetchPDFMarkDown(currentPdfFile)});

const showBBoxesButton = document.getElementById("command-button-bbox");
showBBoxesButton.addEventListener('click', () => {fetchBlocksData(currentPdfFile)});

const blockTypeList = document.getElementById("block-type-list");
blockTypeList.addEventListener('click', handleClickOnBlockTypeNames);