import {renderPdf} from './pdfRender.js';
import {showMarkdownOverlay} from './overlay.js';
import {countItemsMap, createTable} from './functions.js';
import {showBoundingBoxes, removeBoundingBoxesForCategory} from './boundingBoxes.js';

import { store } from "./store.js";

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

function fetchPDFMarkDown(fileName){
    const url = `/get_markdown_data/${fileName}`;
    fetch(url)
        .then(response => response.json())
        .then(markdown =>      
            showMarkdownOverlay(markdown)
        )
        .catch(error => console.error('Error fetching markdown:', error));
}

function fetchBlocksData(fileName){
    const url = `/get_block_data/${fileName}`;
    fetch(url)
        .then(response => response.json())
        .then(block_data_list =>  {
                store.set('SectionData', block_data_list);
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
        )
        .catch(error => console.error('Error fetching markdown:', error));
}

function handleClickOnBlockTypeNames(event) {
  if (event.target && event.target.classList.contains('row-button')) {
    const key = event.target.dataset.key;

    const SectionData = store.get('SectionData');
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

export {handleClickOnPDFNames, fetchPDFMarkDown, fetchBlocksData, handleClickOnBlockTypeNames};