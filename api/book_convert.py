import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
import tempfile
import PyPDF2
#import pdfplumber
from pdfminer.high_level import extract_text
from pdfminer.layout import LAParams
from io import BytesIO
# import spacy

class ConvertBook():
    
    def __init__(self):
        # self.nlp = spacy.load("en_core_web_sm")
        pass

    
    # def fix_text_with_spacy(self, text):
    #     doc = self.nlp(text)
    #     return ' '.join([token.text for token in doc])
    
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

        def clean_title(raw_title):
            # If it's a byte string, decode it
            if isinstance(raw_title, bytes):
                raw_title = raw_title.decode('utf-8', errors='ignore')
            # Strip null characters and whitespace
            return raw_title.replace('\x00', '').strip()

        def get_outline(reader, offset_page):



            

            try:
                outlines = reader.outline
            except AttributeError:
                outlines = reader.get_outlines()

            book_outline = []
            for item in outlines:
                if isinstance(outlines, list):
                    if isinstance(item, list):
                        for title in item:
                            cleaned_title = clean_title(title.title)
                            print(type(cleaned_title))
                            print(f"- {cleaned_title} (Page: {reader.get_destination_page_number(title) + 1})")
                            book_outline.append({"title": cleaned_title, "page": (reader.get_destination_page_number(title) + 1)})
                    else:
                        cleaned_item = clean_title(item.title)
                        print(type(cleaned_item))
                        print(f"- {cleaned_item} (Page: {reader.get_destination_page_number(item) + 1})")
                        book_outline.append({"title": f"{cleaned_item}", "page": f"{(reader.get_destination_page_number(item) + 1)}"})
            print(reader)
            return book_outline
        
        file.seek(0)  # rewind to start
        file_stream = BytesIO(file.read())
        
        # sanity check for PDF magic bytes
        if not file_stream.getvalue().startswith(b'%PDF'):
            raise ValueError("Uploaded file is not a valid PDF")
        
        laparams = LAParams(
        line_margin=0.5,       # tweak this (default is 0.5)
        word_margin=0.1,       # reduce or increase to control word spacing (default 0.1)
        char_margin=2.0        # increase this if characters are too close
        )

        
        full_text = extract_text(file_stream, laparams=laparams)
        pages = full_text.split('\f')
        
        book_text = []
        offset_page = []
        count = 0

        for index, page_text in enumerate(pages):
            page_text = page_text.strip()
            if page_text:
                book_text.append(page_text)
            else:
                offset_page.append({'offset': count, 'page': index})
                count += 1
                
        
        book_outline = get_outline(reader, offset_page)

        

        # with pdfplumber.open(file) as pdf:
        #     for page in pdf.pages:
        #         text = page.extract_text(layout=True)
        #         book_text.append(text)
        # doc = fitz.open(stream=BytesIO(file.read()), filetype="pdf")
        # print(doc.page_count)
        # print(doc[0].get_text())

        book_data = {
            'title': '',
            'author': '',
            'book_outline': book_outline,
            'content': book_text,
            'identifier':'',
            'publisher' : '',
            'rights': '',
            'coverage' : '',
            'date': '',
            'description': '',
            'offest_page': offset_page
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
