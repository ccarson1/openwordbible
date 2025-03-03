import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
import tempfile

class ConvertBook():
    
    def __init__(self):
        pass
    
    def convert_from_text():
        pass
    
    def convert_from_pdf():
        pass
    
    def convert_from_docx():
        pass
    
    def convert_from_odt():
        pass
    
    def convert_from_epub(self, file):
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            # Write the contents of the in-memory file to the temporary file
            for chunk in file.chunks():
                temp_file.write(chunk)

            # Get the temporary file path
            temp_file_path = temp_file.name

        # Read the EPUB file using EbookLib
        book = epub.read_epub(temp_file_path)

        # Extract metadata
        title = book.get_metadata('DC', 'title')  # Get the title metadata (Dublin Core)
        author = book.get_metadata('DC', 'creator')  # Get the author metadata (Dublin Core)

        # If you want to include more content or structure
        content = []  # Example, you can extract the content from the book
        index = book.get_item_with_href('index.xhtml')
        counter = 0
        for item in book.get_items():
            # Check for document type by comparing to 'application/xhtml+xml'
            print(f'Item type: {item.get_type()}')
            if item.get_type() == ebooklib.ITEM_DOCUMENT:
                
                soup = BeautifulSoup(item.get_content(), 'lxml')
                print(soup)
                paragraphs = soup.find_all('p')
                text_content = [p.get_text() for p in paragraphs]
                content.append(text_content)
                print(text_content)
                print(counter)
            counter += 1
        # Return as a dictionary for easy JSON serialization
        book_data = {
            'title': title if title else 'No Title Found',
            'author': author if author else 'No Author Found',
            'content': content,  # This can be further processed as needed
        }
        #print(book_data['content'][4])

        return book_data['content'][3]