
import { store } from "./store.js";

function showBoundingBoxes(bboxData) {
  const currentPdfFile = store.get('currentPdfFile');
  const pageWrappers = store.get('pageWrappers');
  
  if (!currentPdfFile ||!Array.isArray(pageWrappers)||pageWrappers.length === 0) {
    console.warn("No PDF currently rendered");
    return;
  }

  // Remove previous overlays if any
  /*
  pageWrappers.forEach(({ wrapper }) => {
    const existing = wrapper.querySelectorAll('.bbox-overlay');
    existing.forEach(el => el.remove());
  });
    */
  //  bboxData.forEach(({ page, x, y, width, height, label }) => {
  bboxData.forEach((box_data) => {
    const page = box_data.page+1;
    const bbox = box_data.bbox;
    const x = bbox[0];
    const y = bbox[1];
    const width = bbox[2] - bbox[0];
    const height = bbox[3] - bbox[1];
    const label = box_data.content;
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

function removeBoundingBoxesForCategory(block_type){
    const bboxes = document.querySelectorAll(`.bbox-overlay[data-block-type="${block_type}"]`);
    bboxes.forEach(el => el.remove());
}

export {showBoundingBoxes, removeBoundingBoxesForCategory};