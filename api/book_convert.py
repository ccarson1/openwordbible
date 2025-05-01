import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
import tempfile
import PyPDF2

class ConvertBook():
    
    def __init__(self):
        pass
    
    def convert_from_text(self, file):
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            for chunk in file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name

        with open(temp_file_path, "r", encoding="utf-8") as temp_file:
            file_content = temp_file.read()

        book_data = {
            'title': '',
            'author': '',
            'content': [file_content],
            'identifier': '',
            'publisher' : '',
            'rights': '',
            'coverage' : '',
            'date': '',
            'description': ''


        }

        return book_data
    
    def convert_from_pdf(self, file):
        reader = PyPDF2.PdfReader(file)
        book_text =  [[page.extract_text()] for page in reader.pages]
        metadata = reader.metadata 

        book_data = {
            'title': metadata.title,
            'author': metadata.author,
            'content': book_text,
            'identifier':'',
            'publisher' : metadata.producer,
            'rights': '',
            'coverage' : '',
            'date': metadata.get('/CreationDate'),
            'description': ''
        }

        return book_data
    
    def convert_from_docx():
        pass
    
    def convert_from_odt():
        pass
    

    def convert_from_epub(self, file):

        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            for chunk in file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name

        # Read the EPUB file
        book = epub.read_epub(temp_file_path)

        # Extract metadata
        title = book.get_metadata('DC', 'title')
        author = book.get_metadata('DC', 'creator')
        identifier = book.get_metadata('DC', 'identifier')
        publisher = book.get_metadata('DC', 'publisher')
        rights = book.get_metadata('DC', 'rights')
        coverage = book.get_metadata('DC', 'coverage')
        date = book.get_metadata('DC', 'date')
        description = book.get_metadata('DC', 'description')

        content = []
        
        for item in book.get_items():
            
            if item.get_type() != ebooklib.ITEM_DOCUMENT:
                print(item.get_type())
                #continue  # Skip non-text items

            try:
                raw_content = item.get_content()

                # Try decoding explicitly as UTF-8, fallback to ISO-8859-1 or ignore errors
                decoded_content = raw_content.decode("utf-8", errors="replace")  

                soup = BeautifulSoup(decoded_content, 'lxml')
                
                # Extract all paragraphs
                text_content = [p.get_text() for p in soup.find_all('p')]
                print(text_content)
                # Append plain text instead of the soup object
                content.append(text_content)  # Convert list of paragraphs to a single string

            except Exception as e:
                print(f"Error processing item: {e}")
        
        book_data = {
            'title': title[0] if title else 'No Title Found',
            'author': author[0] if author else 'No Author Found',
            'content': content,
            'identifier': identifier[0],
            'publisher' : publisher,
            'rights': rights,
            'coverage' : coverage,
            'date': date,
            'description': description
        }

        return book_data
