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
    
    # def convert_from_epub(self, file):
    #     # Create a temporary file
    #     with tempfile.NamedTemporaryFile(delete=False) as temp_file:
    #         # Write the contents of the in-memory file to the temporary file
    #         for chunk in file.chunks():
    #             temp_file.write(chunk)

    #         # Get the temporary file path
    #         temp_file_path = temp_file.name

    #     # Read the EPUB file using EbookLib
    #     book = epub.read_epub(temp_file_path)

    #     # Extract metadata
    #     title = book.get_metadata('DC', 'title')  # Get the title metadata (Dublin Core)
    #     author = book.get_metadata('DC', 'creator')  # Get the author metadata (Dublin Core)
        

    #     # If you want to include more content or structure
    #     content = []  # Example, you can extract the content from the book
    #     index = book.get_item_with_href('index.xhtml')
    #     counter = 0
    #     for item in book.get_items():
    #         # Check for document type by comparing to 'application/xhtml+xml'
    #         # print(f'Item type: {item.get_type()}')
    #         # print(item.get_content().decode("utf-8"))
    #         #content.append(item.get_content)
    #         if item.get_type() == ebooklib.ITEM_DOCUMENT:
                
    #             soup = BeautifulSoup(item.get_content().decode("utf-8"), 'lxml')
    #             # print(soup)
                
    #             paragraphs = soup.find_all('p')
    #             text_content = [p.get_text() for p in paragraphs]
    #             content.append(text_content)
    #             print(text_content)
    #             print(counter)
    #             content.append(soup)
    #         counter += 1
    #     # print(content)
    #     # Return as a dictionary for easy JSON serialization
    #     book_data = {
    #         'title': title if title else 'No Title Found',
    #         'author': author if author else 'No Author Found',
    #         'content': content,  # This can be further processed as needed
    #     }
    #     #print(book_data['content'][4])

    #     return book_data['content']

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
