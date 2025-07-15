from pathlib import Path
import os

from pymongo import MongoClient

from marker.converters.pdf import PdfConverter
from marker.models import create_model_dict
from marker.output import text_from_rendered

from src.pdf_store import PDFStoreManager

TEXT_TYPES =  {"Text", "Title", "List", "Table", "Caption", "Equation"}
IMAGE_TYPES = {"Image", "Figure"}
OTHER_TYPES = {
    "Reference", "TextInlineMath", "ListItem", "TableCell",
     "PageHeader", "PageFooter"}

TYPES_FOR_RAG = {'Text'}

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def get_mongo_db_client():
    client = MongoClient("mongodb://root:example@localhost:27017/")
    assert client.admin.command("ping") == {'ok': 1.0}
    return client

def get_batches_from_iterator(iterator, batch_size=100):
    batch = []    
    for doc in iterator:
        batch.append(doc)
        if len(batch) == batch_size:
            yield batch
            batch = []
    if batch:
        yield batch  # Yield any remaining documents

def pdf_to_markdown(file_path):
    converter = PdfConverter(artifact_dict=create_model_dict())
    rendered = converter(file_path)  # replace with your PDF path
    text, _, images = text_from_rendered(rendered)
    return dict(text=text, images=images)

def get_pdf_blocks(file_path):
    converter = PdfConverter(artifact_dict=create_model_dict())
    doc = converter.build_document(file_path)
    chunks = []
    current_section = None
    order = 1
    for page in doc.pages:
        for block in page.contained_blocks(doc):
            block_type = str(block.block_type)
            
            if block_type == "SectionHeader":
                current_section = block.raw_text(doc).strip()

            content = block.raw_text(doc).strip()
            bbox = block.polygon.bbox if block.polygon else None

            chunks.append({
                "content": content,
                "section": current_section,
                "page": page.page_id,
                "bbox": bbox,
                "block_type": block_type,
                "order": order,
                "include_in_index": block_type in TYPES_FOR_RAG
            })
            order+=1

    return chunks

if __name__ == '__main__':
    mongo_db_client = get_mongo_db_client()
    database = mongo_db_client['chatbot_ui_v5']  

    metadata_collection = database['metadata']
    metadata_collection.delete_many({})

    markdown_collection = database['pdf_to_markdown']
    markdown_collection.delete_many({})
    location = os.path.join(PROJECT_ROOT, 'local_only', 'arxiv')
    pdf_store = PDFStoreManager(location)

    for file in pdf_store.get_file_list():
        file_location = pdf_store.resolve_path(file)      

        collection_name = file.replace('.', '_')
        print(file_location, collection_name)
        record = dict(file=file, file_location=file_location, collection_name=collection_name)
        metadata_collection.insert_one(record)

        markdown = pdf_to_markdown(file_location)
        record = dict(file=file, file_location=file_location, collection_name=collection_name, markdown=markdown['text'])
        markdown_collection.insert_one(record)

        pdf_blocks = get_pdf_blocks(file_location)
        
        for batch in get_batches_from_iterator(pdf_blocks, batch_size=64):
            mongo_col = database[collection_name]
            mongo_col.insert_many(batch)