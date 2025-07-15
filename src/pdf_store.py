import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

class PDFStoreManager:
    def __init__(self, location):
        self.location = location
        if not os.path.exists(self.location):
            os.makedirs(self.location, exist_ok=True)

    def get_file_list(self, file_type='pdf'):
        if not file_type is None:
            return [i for i in os.listdir(self.location) if i.endswith(file_type)]
        else:
            return [i for i in os.listdir(self.location)]
    
    def resolve_path(self, filename):
        return os.path.join(self.location, filename)


if __name__ == '__main__':
    location = os.path.join(PROJECT_ROOT, 'local_only', 'arxiv')

    pdf_store = PDFStoreManager(location)

    print(pdf_store.get_file_list())