from fastapi import FastAPI
from fastapi.responses import JSONResponse, FileResponse
import uvicorn
from pathlib import Path
from fastapi.staticfiles import StaticFiles
import os
from fastapi.templating import Jinja2Templates

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse

app = FastAPI()
def flip_bbox_y(bbox, page_height):
    x0, y0, x1, y1 = bbox
    flipped_y0 = page_height - y1
    flipped_y1 = page_height - y0
    return [x0, flipped_y0, x1, flipped_y1]


#x0,y0,x1,y1
bbox= [69.26171875,
  588.3491973876953,
  290.9458923339844,
  707.8177642822266]


bbox = flip_bbox_y(bbox, 842.0)

BASE = '/mnt/f/chatbot_ui_v5/local_only/sample_pdf_rendering/'
TEMPLATES_DIR = os.path.join(BASE, 'templates')
STATIC_DIR = os.path.join(BASE, 'static')


templates = Jinja2Templates(directory=TEMPLATES_DIR)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
#app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="images")

@app.get("/", response_class=HTMLResponse)
def root(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
        "chat_endpoint": "/echo"
    })


@app.get("/pdf")
def get_pdf():
    PDF_PATH = '/mnt/f/chatbot_ui_v5/docs/2412.17149v1.pdf'
    return FileResponse(PDF_PATH, media_type='application/pdf')

@app.get("/bboxes")
def get_bboxes():
    content = [
    {
        "page": 0,
        "bbox": bbox,
        "text": "Example chunk",
        "section": "Introduction"
    },

    ]
    return JSONResponse(content = content)
    # Replace with real bounding boxes and dimensions
    """
    return JSONResponse(content={
        "page_height": 842,
        "page_width": 595,
        "bboxes": [
            {"page": 0, "x0": x0, "x0": x0, "x1": x1, "y1": y1, "label": "Introduction"},
            {"page": 1, "x0": x0, "x0": x0, "x1": x1, "y1": y1, "label": "Introduction"},
            {"page": 2, "x0": x0, "x0": x0, "x1": x1, "y1": y1, "label": "Introduction"},

        ]
    })

    """

if __name__ == "__main__":
    import uvicorn
    app_path = Path(__file__).resolve().with_suffix('').name  # gets filename without .py
    uvicorn.run(f"{app_path}:app", host="localhost", port=8000, reload=True, workers = 4)