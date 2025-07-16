
import { store } from "./store.js";

function showBoundingBoxes(bboxData) {
  const currentPdfFile = store.get('currentPdfFile');
  const pageWrappers = store.get('pageWrappers');
  
  if (!currentPdfFile ||!Array.isArray(pageWrappers)||pageWrappers.length === 0) {
    console.warn("No PDF currently rendered");
    return;
  }
  bboxData.forEach((box_data) => {
    const page = box_data.page+1;
    const bbox = box_data.bbox;
    const x = bbox[0];
    const y = bbox[1];
    const width = bbox[2] - bbox[0];
    const height = bbox[3] - bbox[1];
    const label = box_data.content;
    const match = pageWrappers.find(p => p.pageNum === page);
    const order = box_data.order;
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
    overlay.style.zIndex = 2;
    //overlay.title = label || "";

    // Prepare tooltip HTML
    const tooltipHtml = `
        <strong>Order:</strong> ${box_data.order}<br/>
      <strong>Section:</strong> ${box_data.section || 'N/A'}<br/>
      <strong>Type:</strong> ${box_data.block_type}<br/>
      <strong>Num_Chars:</strong> ${box_data.content.length || 0}<br/>      
      <strong>Text:</strong> ${box_data.content?.slice(0, 150) || '—'}
    `;


    overlay.setAttribute('data-tippy-content', tooltipHtml);
    overlay.dataset.order = order;

    match.wrapper.appendChild(overlay);
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

function removeBoundingBoxesForCategory(block_type){
    const bboxes = document.querySelectorAll(`.bbox-overlay[data-block-type="${block_type}"]`);
    bboxes.forEach(el => el.remove());
}

export {showBoundingBoxes, removeBoundingBoxesForCategory};