### Overview

This is my 5th project exploring the advanced concepts in Generative AI particularly through the use of frameworks like `llama index`.

Focus of this project is data/text extraction from pdfs and build a RAG pipeline on it.

I have taken papers from ArXiv as the data source.

---

### Data Extraction From PDFs
We have multiple libraries in Python for extracting text from pdf such as 
- [PyPDF2](https://pypi.org/project/PyPDF2/)
- [PyMuPDF](https://pypi.org/project/PyMuPDF/)
- [pdfminer.six](https://pypi.org/project/pdfminer.six/)

However when text is extracted underling structure of the document is lost. There are multiple commercial offerings to extract data from pdfs especially for RAG applications such as 
- [llamaparse](https://www.llamaindex.ai/llamaparse)
- [Unstructured by Unstructured.io](https://unstructured.io/)

These use Machine Learning techniques to intelligently parse the structure of the pdf and return data in a neatly formatted strucutered form. However these are paid services and will act as a black box. Before moving to commercial offerings we may want to check similar offerings that are available for free.

For this project I have used `marker-pdf`([installation](https://pypi.org/project/marker-pdf/))([code repo](https://github.com/datalab-to/marker)) which is freely available (though there are restrictions on commerical use)

To check the `marker` library, a sample pdf was downloaded from [arxiv](https://arxiv.org/abs/2412.17149). Text extracted from the pdf is available here in this [.md file](docs/2412.17149v1.md), images extracted are [here](docs/2412.17149v1) and the original pdf is [here](docs/2412.17149v1.pdf)

> Note: the library downloads models of size ~ 2 GB to the `.cache/datalabs/models` folder

The extracted markdown can be directly passed into LLM pipeline and used for tasks like summary generation, metadata enrichment etc.

To build a vector database, we can read the markdown file and split it into smaller chnuks.

We can use the [`MarkdownReader`](https://github.com/run-llama/llama_index/blob/131df8869d22049ee503edcc293da22dfb95ac1b/llama-index-integrations/readers/llama-index-readers-file/llama_index/readers/file/markdown/base.py) to load the data.

It splits the markdown file into smaller chunks. The logic can be found in the `markdown_to_tups` function defined in the [source code](https://github.com/run-llama/llama_index/blob/131df8869d22049ee503edcc293da22dfb95ac1b/llama-index-integrations/readers/llama-index-readers-file/llama_index/readers/file/markdown/base.py)

Since document is split by sections, we get documents of varying length. We can loop through the nodes and further split the nodes into smaller nodes with some overlap.

---
It turns out that the `text_from_rendered` method in `marker` library returns pdf into a nice Markdown format which is great if we want to generate a summary of the paper or directly feed into the LLM. However for RAG application, we need smaller chunks along with their metadata (e.g. page number, location on the page etc) so that we can evaluate retrieval pipeline. But the resulting markdown lacks metadata. 

To get metadata we will have to manually parse through different block types that make up the pdf (such as Text, Title, Caption, Image, PageHeader etc). We can decide which blocks to keep and which blocks to discard.

---
**Understanding the blocks extracted**

To visualize which parts of the part have been processed and which have been filtered out, we can extract the bounding box coordinates from the blocks and then plot these bounding boxes on the pdf. 

In this project, I have extracted details from the block and stored them in mongo db database. A sample record looks like this 
```json
{
    "content": "Agentic AI systems, composed of specialized\nagents working collaboratively to achieve com-\nplex objectives, have transformed industries such\nas market research, business process optimization,\nand product recommendation. These systems excel\nin automating decision-making and streamlining\nworkflows. However, their optimization remains\nchallenging due to the complexity of agent interac-\ntions and reliance on manual configurations.",
    "section": "1 Introduction",
    "page": 0,
    "bbox": [
        69.26171875,
        588.3491973876953,
        290.9458923339844,
        707.8177642822266
    ],
    "block_type": "Text",
    "order": 6
}
```

I have created end points on my FastAPI app to return the pdf along with the data from mongodb. 
- In frontend, [`PDF.js`](https://mozilla.github.io/pdf.js/) ([cdn link](https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js)) is used to display the pdf
- `Tippy.js` ([repo link](https://github.com/atomiks/tippyjs)) is used to format the hover toolip shown over the bounding boxes.

The resulting output can be seen in the following video

https://github.com/user-attachments/assets/e8908db8-a77c-4310-8790-c98e17363456

---

To further expand the idea of visualizing the pdf, the extracted markdown and the blocks in pdf, I have built a front end. The code is given [here]('extras/visualize_pdf_data_extraction/').

This UI allows the following:

- view list of pdf files available in the repository
- render the pdf itself in the UI
- see the markdown version of the pdf
- see bounding boxes around the content blocks
- selectively create bounding boxes around different types of content blocks such as text, image, references etc

