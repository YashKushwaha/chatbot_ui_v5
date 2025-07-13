async function loadPdf() {
  const pdf = await pdfjsLib.getDocument(url).promise;
  const container = document.getElementById("pdf-container");
  const scale = 1.5;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Create canvas for each page
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.marginBottom = "20px";

    container.appendChild(canvas); // Append canvas to container

    const renderContext = {
      canvasContext: ctx,
      viewport
    };

    await page.render(renderContext).promise;

    // Draw bounding boxes for this page
    drawBoundingBoxes(bboxData, page, viewport, ctx);
  }
}

function drawBoundingBoxes(bboxes, page, viewport, ctx) {
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;

  bboxes.forEach((box) => {
    if (box.page !== page.pageNumber - 1) return; // pageNumber is 1-based, backend 0-based

    const [x0, y0, x1, y1] = box.bbox;
    const [vx0, vy0, vx1, vy1] = viewport.convertToViewportRectangle([x0, y0, x1, y1]);

    const x = Math.min(vx0, vx1);
    const y = Math.min(vy0, vy1);
    const width = Math.abs(vx1 - vx0);
    const height = Math.abs(vy1 - vy0);

    ctx.strokeRect(x, y, width, height);
  });
}


//const canvas = document.getElementById('pdf-container');
// const ctx = canvas.getContext('2d');

const url = '/pdf';  // From FastAPI
const bboxUrl = '/bboxes';

let bboxData = [];

fetch(bboxUrl)
  .then(res => res.json())
  .then(data => {
    bboxData = data;
    loadPdf();
  });
