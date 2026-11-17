import os
import re
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


def clean_text(text):
    # Join words split by a hyphen at the end of a line
    text = re.sub(r'(\w)-[ \t]*\n\s*([a-z])', r'\1\2', text)
    text = text.replace('\r', '')
    # Collapse runs of spaces/tabs but keep line breaks
    text = re.sub(r'[ \t\u00a0]+', ' ', text)
    text = re.sub(r' *\n *', '\n', text)
    return text.strip()


def split_into_pages(text, words_per_page=600):
    # Keep paragraphs together where possible
    pages = []
    current = []
    count = 0
    for paragraph in re.split(r'\n\s*\n', text):
        paragraph = paragraph.strip()
        if not paragraph:
            continue
        words = len(paragraph.split())
        if current and count + words > words_per_page:
            pages.append('\n\n'.join(current))
            current = []
            count = 0
        current.append(paragraph)
        count += words
    if current:
        pages.append('\n\n'.join(current))
    return pages


class ConvertBook():
    
    def __init__(self):
        # self.nlp = spacy.load("en_core_web_sm")
        pass

    
    # def fix_text_with_spacy(self, text):
    #     doc = self.nlp(text)
    #     return ' '.join([token.text for token in doc])
    
    def convert_from_text(self, file, words_per_page=600):
        raw = b''.join(file.chunks())
        try:
            file_content = raw.decode('utf-8-sig')
        except UnicodeDecodeError:
            file_content = raw.decode('latin-1')

        book_data = {
            'title': '',
            'author': '',
            'book_outline': [],
            'content': split_into_pages(clean_text(file_content), words_per_page),
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


        # def get_outline(reader, offset_page):
        #     try:
        #         outlines = reader.outline
        #     except AttributeError:
        #         outlines = reader.get_outlines()

        #     book_outline = []
        #     for item in outlines:
        #         if isinstance(outlines, list):
        #             if isinstance(item, list):
        #                 for title in item:
        #                     cleaned_title = clean_title(title.title)
        #                     print(type(cleaned_title))
        #                     print(f"- {cleaned_title} (Page: {reader.get_destination_page_number(title) + 1})")
        #                     book_outline.append({"title": cleaned_title, "page": (reader.get_destination_page_number(title) + 1)})
        #             else:
        #                 cleaned_item = clean_title(item.title)
        #                 print(type(cleaned_item))
        #                 print(f"- {cleaned_item} (Page: {reader.get_destination_page_number(item) + 1})")
        #                 book_outline.append({"title": f"{cleaned_item}", "page": f"{(reader.get_destination_page_number(item) + 1)}"})
        #     print(reader)
        #     return book_outline

        def get_outline(reader, offset_page):
            try:
                outlines = reader.outline
            except AttributeError:
                outlines = reader.get_outlines()

            book_outline = []

            def extract_title(item):
                if hasattr(item, "title"):
                    return item.title
                elif isinstance(item, dict) and "/Title" in item:
                    return item["/Title"]
                return str(item)

            def get_page(item):
                try:
                    return reader.get_destination_page_number(item) + 1
                except:
                    return None

            def process(items):
                for item in items:
                    if isinstance(item, list):
                        process(item)  # recursion preserved
                    else:
                        raw_title = extract_title(item)
                        cleaned_title = clean_title(raw_title)

                        page = get_page(item)

                        if page is None:
                            continue

                        # Outline pages count blank pages, the converted content doesn't
                        blank_before = len([o for o in offset_page if o['page'] < page - 1])

                        book_outline.append({
                            "title": cleaned_title,
                            "page": page - blank_before
                        })

            process(outlines)

            book_outline.sort(key=lambda o: o["page"])
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
            page_text = clean_text(page_text)
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
        try:
            book = epub.read_epub(temp_file_path)
        finally:
            os.remove(temp_file_path)

        def first(values):
            if not values:
                return ''
            value = values[0]
            return value[0] if isinstance(value, tuple) else value

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
        
        for item in book.get_items_of_type(ebooklib.ITEM_DOCUMENT):
            try:
                raw_content = item.get_content()

                # Try decoding explicitly as UTF-8, fallback to ISO-8859-1 or ignore errors
                decoded_content = raw_content.decode("utf-8", errors="replace")  

                soup = BeautifulSoup(decoded_content, 'lxml')
                
                # Extract all paragraphs
                text_content = [clean_text(p.get_text()) for p in soup.find_all('p')]
                text_content = '\n\n'.join(t for t in text_content if t)
                if text_content:
                    content.append(text_content)

            except Exception as e:
                print(f"Error processing item: {e}")
        
        book_data = {
            'title': first(title) or 'No Title Found',
            'author': first(author) or 'No Author Found',
            'book_outline': [],
            'content': content,
            'identifier': first(identifier),
            'publisher' : first(publisher),
            'rights': first(rights),
            'coverage' : first(coverage),
            'date': first(date),
            'description': first(description)
        }

        return book_data
