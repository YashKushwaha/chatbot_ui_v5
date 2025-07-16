import { store } from "./store.js";

async function renderPdf(fileName) {
  const url = `/pdf/${fileName}`;
  const container = document.getElementById("pdf-container");
  container.innerHTML = "";
  const pageWrappers = [];

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

  const currentPdfFile = fileName;
  store.set('currentPdfFile', fileName);
  store.set('pageWrappers', pageWrappers);
}

export {renderPdf};