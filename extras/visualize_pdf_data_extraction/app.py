from fastapi import FastAPI
from fastapi.responses import JSONResponse, FileResponse
import uvicorn
from pathlib import Path
from fastapi.staticfiles import StaticFiles
import os
from fastapi.templating import Jinja2Templates

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse

from pymongo import MongoClient

def get_mongo_db_client():
    client = MongoClient("mongodb://root:example@localhost:27017/")
    assert client.admin.command("ping") == {'ok': 1.0}
    return client

def flip_bbox_y(bbox, page_height):
    x0, y0, x1, y1 = bbox
    flipped_y0 = page_height - y1
    flipped_y1 = page_height - y0
    return [x0, flipped_y0, x1, flipped_y1]

app = FastAPI()
app.state.mongo_db_client = get_mongo_db_client()

BASE = '/mnt/f/chatbot_ui_v5/extras/visualize_pdf_data_extraction/'
TEMPLATES_DIR = os.path.join(BASE, 'templates')
STATIC_DIR = os.path.join(BASE, 'static')

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PDF_LOCATION = os.path.join(PROJECT_ROOT, 'local_only', 'arxiv')


templates = Jinja2Templates(directory=TEMPLATES_DIR)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
#app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="images")

@app.get("/", response_class=HTMLResponse)
def root(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
    })


@app.get("/get_pdf_list")
def get_pdf_list():
    mongo_db_client = app.state.mongo_db_client
    database = mongo_db_client['chatbot_ui_v5']  
    collection = database['metadata']
    files = [i.get('file') for i in collection.find({})]
    return JSONResponse(content = files)

@app.get("/get_block_data/{filename}")
def get_block_data(filename):
    mongo_db_client = app.state.mongo_db_client
    database = mongo_db_client['chatbot_ui_v5']  
    collection = database['metadata']
    collection_name = list(collection.find({"file": filename}, {'_id':0}))
    if collection_name:
        collection_name = collection_name[0]['collection_name']
        coll = database[collection_name]
        records = list(coll.find({}, {'_id':0}))
        return JSONResponse(content = records)
    else:
        return JSONResponse(content = [])



@app.get("/bboxes")
def get_bboxes():
    mongo_db_client = app.state.mongo_db_client
    database = mongo_db_client['chatbot_ui_v5']  
    collection = database['test']
    content = list(collection.find({}, {'_id': 0}))
    for i in content:
        i['bbox'] = flip_bbox_y(i['bbox'], 842.0)
    return JSONResponse(content = content)

@app.get("/pdf/{file_name}")
def get_pdf(file_name):
    file = os.path.join(PDF_LOCATION, file_name)
    return FileResponse(file, media_type='application/pdf', headers={"Content-Disposition": f'inline; filename="{file_name}"'})

@app.get("/get_markdown_data/{filename}")
def get_markdown_data(filename):
    mongo_db_client = app.state.mongo_db_client
    database = mongo_db_client['chatbot_ui_v5']  
    collection = database['pdf_to_markdown']
    collection_name = list(collection.find({"file": filename}, {'_id':0}))
    if collection_name:
        collection_name = collection_name[0]['markdown']
        return JSONResponse(content = collection_name)
    else:
        return JSONResponse(content = "Markdown Not Found")


if __name__ == "__main__":
    import uvicorn
    app_path = Path(__file__).resolve().with_suffix('').name  # gets filename without .py
    uvicorn.run(f"{app_path}:app", host="localhost", port=8000, reload=True, workers = 4)