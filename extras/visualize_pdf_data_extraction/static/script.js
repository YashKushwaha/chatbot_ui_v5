import {showPDFList} from './js/functions.js';
import { store } from "./js/store.js";
import {handleClickOnPDFNames, fetchPDFMarkDown, fetchBlocksData, handleClickOnBlockTypeNames} from './js/handlers.js';

const pdfListContainer = document.getElementById("pdf-list-container")
pdfListContainer.addEventListener('click', handleClickOnPDFNames)
pdfListContainer.innerHTML=""

fetch('/get_pdf_list')
  .then(response => response.json())
  .then(file_list => showPDFList(file_list, pdfListContainer));

const showMarkDownButton = document.getElementById("command-button");
showMarkDownButton.addEventListener('click', () => {fetchPDFMarkDown(store.get('currentPdfFile'))});

const showBBoxesButton = document.getElementById("command-button-bbox");
showBBoxesButton.addEventListener('click', () => {fetchBlocksData(store.get('currentPdfFile'))});

const blockTypeList = document.getElementById("block-type-list");
blockTypeList.addEventListener('click', handleClickOnBlockTypeNames);