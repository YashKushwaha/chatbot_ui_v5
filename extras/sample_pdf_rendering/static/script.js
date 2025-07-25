async function loadPdf() {
  const pdf = await pdfjsLib.getDocument(url).promise;
  const container = document.getElementById("pdf-container");
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
    drawBoundingBoxesWithHover(bboxData, page, viewport, ctx, pageWrapper);
  }
}
function drawBoundingBoxesWithHover(bboxes, page, viewport, ctx, containerEl) {
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;

  containerEl.querySelectorAll('.bbox-overlay').forEach(el => el.remove());

  bboxes.forEach((box) => {
    if (box.page !== page.pageNumber - 1) return;

    const [x0, y0, x1, y1] = box.bbox;
    const [vx0, vy0, vx1, vy1] = viewport.convertToViewportRectangle([x0, y0, x1, y1]);

    const x = Math.min(vx0, vx1);
    const y = Math.min(vy0, vy1);
    const width = Math.abs(vx1 - vx0);
    const height = Math.abs(vy1 - vy0);

    ctx.strokeRect(x, y, width, height);

    const overlay = document.createElement('div');
    overlay.className = 'bbox-overlay';
    overlay.style.position = 'absolute';
    overlay.style.left = `${x}px`;
    overlay.style.top = `${y}px`;
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
    overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.05)';
    overlay.style.border = '1px solid red';
    overlay.style.zIndex = 2;

    // Prepare tooltip HTML
    const tooltipHtml = `
      <strong>Section:</strong> ${box.section || 'N/A'}<br/>
      <strong>Type:</strong> ${box.block_type}<br/>
      <strong>Order:</strong> ${box.order}<br/>
      <strong>Text:</strong> ${box.content?.slice(0, 150) || '—'}
    `;

    overlay.setAttribute('data-tippy-content', tooltipHtml);
    containerEl.appendChild(overlay);
  });

  // Initialize Tippy on all overlays (after DOM insertion)
  tippy('.bbox-overlay', {
    allowHTML: true,
    theme: 'light-border',
    placement: 'top',
    delay: [100, 0],
    interactive: true,
    maxWidth: 300
  });
}

const url = '/pdf';        // FastAPI PDF endpoint
const bboxUrl = '/bboxes'; // FastAPI bounding box endpoint

let bboxData = [];

fetch(bboxUrl)
  .then(res => res.json())
  .then(data => {
    bboxData = data;
    loadPdf();
  });

  document.getElementById("open-pdf").addEventListener("click", () => {
  document.getElementById("pdf-modal").style.display = "block";
});

document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("pdf-modal").style.display = "none";
});

// Optional: Close modal if clicked outside content
window.addEventListener("click", (event) => {
  const modal = document.getElementById("pdf-modal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});