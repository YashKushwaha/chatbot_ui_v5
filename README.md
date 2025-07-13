### Overview

This is my 5th project exploring the advanced concepts in Generative AI particularly through the use of frameworks like `llama index`.

Focus of this project is data/text extraction from pdfs and build a RAG pipeline on it.

I have taken papers on ArXiv as the data source.

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

Note: that the library downloads models of size ~ 2 GB to the `.cache/datalabs/models` folder

Once data has been extracted from pdf in markdown format, we can use the [`MarkdownReader`](https://github.com/run-llama/llama_index/blob/131df8869d22049ee503edcc293da22dfb95ac1b/llama-index-integrations/readers/llama-index-readers-file/llama_index/readers/file/markdown/base.py) to load the data.

It splits the markdown file into smaller chunks. The logic can be found in the `markdown_to_tups` function defined in the [source code](https://github.com/run-llama/llama_index/blob/131df8869d22049ee503edcc293da22dfb95ac1b/llama-index-integrations/readers/llama-index-readers-file/llama_index/readers/file/markdown/base.py)

Since document is split by sections, we get documents of varying length