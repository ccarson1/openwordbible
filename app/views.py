from django.shortcuts import render, get_object_or_404

from api.models import BookFormat, Profile, Sentence, Chapter, Bookmark
from api.models import Book
import json
import os

def home(request):
    user = request.user
    if user.is_authenticated:
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            profile = None


        return render(request, 'home.html', {'profile': profile})
    else:
        return render(request, 'home.html')
    
    
def read(request, id):
    user = request.user
    book = get_object_or_404(Book, id=id)

    normalized_path = os.path.normpath(book.book_file.path)
    normalized_path = normalized_path.replace("\\", "/")

    # saved_bookmark = Bookmark.objects.filter(user=user,book=id)
    # print(saved_bookmark.get().current_chapter)

    # serialized_bookmark = {
    #     "current_chapter": saved_bookmark.get().current_chapter,
    #     "current_page": saved_bookmark.get().current_page,
    #     "current_word": saved_bookmark.get().current_word,
    #     "scroll_position": saved_bookmark.get().scroll_position
    # }

    saved_bookmark = Bookmark.objects.filter(user=user, book=id).first()
    if saved_bookmark:
        print(saved_bookmark.current_chapter)
        serialized_bookmark = {
            "current_chapter": saved_bookmark.current_chapter,
            "current_page": saved_bookmark.current_page,
            "current_word": saved_bookmark.current_word,
            "scroll_position": saved_bookmark.scroll_position
        }
    else:
        # Default to chapter 0 if no bookmark exists
        print("No bookmark found, defaulting to chapter 0")
        serialized_bookmark = {
            "current_chapter": 0,
            "current_page": 0,
            "current_word": 0,
            "scroll_position": 0
        }


    # print("Book file path:", normalized_path)
    # print("File exists?", os.path.exists(normalized_path))

    sentences = Sentence.objects.filter(book_id=id).select_related('chapter').order_by('sentence_index')
    chapters = Chapter.objects.filter(book_id=id).order_by('index')

    bookmark = Bookmark.objects.filter(user=user, book=book).first()
    bookmark_index = bookmark.current_chapter if bookmark else 0

    chapters_array = []
    book_index = []

    for c in chapters:
        print(f"Chapter: {c.name} : {c.index}")

        book_index.append({"header":c.name,"page": c.index})
        if c.index == bookmark_index:
            # Load full content for bookmarked chapter
            chapter_sentences = [s for s in sentences if s.chapter_id == c.id]
            pages_dict = {}

            for s in chapter_sentences:
                pages_dict.setdefault(s.page, []).append({"text": s.text})

            sorted_pages = [pages_dict[page_num] for page_num in sorted(pages_dict)]

            pages_data = sorted_pages
        else:
            # Leave content empty, will be fetched later
            pages_data = []

        chapters_array.append({
            "chapter": c.name,
            "index": c.index,
            "start": c.start,
            "end": c.end,
            "length": c.length,
            "pages": pages_data
        })

    print(book_index)
    #json_string = json.dumps(chapters_array, ensure_ascii=False, indent=2)
    #print(json_string)

    # book_json = None
    # if book.book_file and book.book_file.name:
    #     try:
    #         with open(normalized_path, 'rb') as file:
    #             raw = file.read()
    #             if not raw:
    #                 raise ValueError("Book file is empty or unreadable in Docker.")
    #             content = raw.decode('utf-8')
    #             book_json = json.loads(content)
    #     except Exception as e:
    #         print(f"Error reading file for book {book.name}: {e}")

    books_data = {
        "id": book.id,
        "name": book.name,
        "language": book.language.name if book.language else None,
        "date": str(book.date) if book.date else None,
        "religion": book.religion.name if book.religion else None,
        "authors": book.authors,
        "denomination": book.denomination,
        "translator": book.translator,
        "book_id": book.book_id,
        "description": book.description,
        "rights": book.rights,
        "publisher": book.publisher,
        "image_url": book.image.url if book.image else None,
        "content": chapters_array,
        "bookmark": serialized_bookmark,
        #"content": book_json['published_book']['content'] if book_json else None,
        #"book_index": book_json["book_index"] if book_json else None,
        "book_index": str(book_index)
        
    }

    profile = None
    if user.is_authenticated:
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            profile = None

    book_format_obj = None
    book_format_data = None
    if user.is_authenticated:
        book_format_obj, created = BookFormat.objects.get_or_create(
            book=book,
            user=user,
            defaults={
                "words": 300,
                "columns": 1,
                "font": "Arial",
                "font_size": 15,
                "color": "#000000",
            }
        )
        if created == True:
            print(f"New format object has been created for {book.name} with id {book.id}")
        else:
            print(f"Book format id: {book_format_obj.id}")

        if book_format_obj:
            book_format_data = {
                "book": book_format_obj.book.id,
                "user": book_format_obj.user.id,
                "words": book_format_obj.words,
                "columns": book_format_obj.columns,
                "font": book_format_obj.font,
                "font_size": book_format_obj.font_size,
                "color": book_format_obj.color,
            }

    #book_index = json.loads(books_data['book_index'])


    return render(request, 'read.html', {
        'profile': profile,
        'book': books_data,
        'book_content': books_data['content'],
        'book_index': book_index,
        'book_format': book_format_data
    })


# def read(request, id):
#     user = request.user
#     book = get_object_or_404(Book, id=id)

#     normalized_path = os.path.normpath(book.book_file.path)
#     normalized_path = normalized_path.replace("\\", "/")

#     saved_bookmark = Bookmark.objects.filter(user=user,book=id)
#     print(saved_bookmark.get().current_chapter)

#     serialized_bookmark = {
#         "current_chapter": saved_bookmark.get().current_chapter,
#         "current_page": saved_bookmark.get().current_page,
#         "current_word": saved_bookmark.get().current_word,
#         "scroll_position": saved_bookmark.get().scroll_position
#     }


#     # print("Book file path:", normalized_path)
#     # print("File exists?", os.path.exists(normalized_path))

#     sentences = Sentence.objects.filter(book_id=id).select_related('chapter').order_by('sentence_index')
#     chapters = Chapter.objects.filter(book_id=id).order_by('index')

#     chapters_array = []
#     sentences_array = []

#     for c in chapters:
#         # Group sentences by page number for this chapter
#         chapter_sentences = [s for s in sentences if s.chapter_id == c.id]

#         # Build a dict where key = page number, value = list of sentences
#         pages_dict = {}
#         for s in chapter_sentences:
#             pages_dict.setdefault(s.page, []).append({
#                 "text": s.text
#             })

#         #print(pages_dict)

#         # Sort pages by page number and convert to list of lists
#         sorted_pages = [pages_dict[page_num] for page_num in sorted(pages_dict)]

#         chapters_array.append({
#             "chapter": c.name,
#             "index": c.index,
#             "start": c.start,
#             "end": c.end,
#             "length": c.length,
#             "pages": sorted_pages  # list of page-lists
#         })

    
#     json_string = json.dumps(chapters_array, ensure_ascii=False, indent=2)
#     #print(json_string)

#     book_json = None
#     if book.book_file and book.book_file.name:
#         try:
#             with open(normalized_path, 'rb') as file:
#                 raw = file.read()
#                 if not raw:
#                     raise ValueError("Book file is empty or unreadable in Docker.")
#                 content = raw.decode('utf-8')
#                 book_json = json.loads(content)
#         except Exception as e:
#             print(f"Error reading file for book {book.name}: {e}")

#     books_data = {
#         "id": book.id,
#         "name": book.name,
#         "language": book.language.name if book.language else None,
#         "date": str(book.date) if book.date else None,
#         "religion": book.religion.name if book.religion else None,
#         "authors": book.authors,
#         "denomination": book.denomination,
#         "translator": book.translator,
#         "book_id": book.book_id,
#         "description": book.description,
#         "rights": book.rights,
#         "publisher": book.publisher,
#         "image_url": book.image.url if book.image else None,
#         "content": chapters_array,
#         "bookmark": serialized_bookmark,
#         #"content": book_json['published_book']['content'] if book_json else None,
#         "book_index": book_json["book_index"] if book_json else None,
        
#     }

#     profile = None
#     if user.is_authenticated:
#         try:
#             profile = Profile.objects.get(user=request.user)
#         except Profile.DoesNotExist:
#             profile = None

#     book_format_obj = None
#     book_format_data = None
#     if user.is_authenticated:
#         book_format_obj, created = BookFormat.objects.get_or_create(
#             book=book,
#             user=user,
#             defaults={
#                 "words": 300,
#                 "columns": 1,
#                 "font": "Arial",
#                 "font_size": 15,
#                 "color": "#000000",
#             }
#         )
#         if created == True:
#             print(f"New format object has been created for {book.name} with id {book.id}")
#         else:
#             print(f"Book format id: {book_format_obj.id}")

#         if book_format_obj:
#             book_format_data = {
#                 "book": book_format_obj.book.id,
#                 "user": book_format_obj.user.id,
#                 "words": book_format_obj.words,
#                 "columns": book_format_obj.columns,
#                 "font": book_format_obj.font,
#                 "font_size": book_format_obj.font_size,
#                 "color": book_format_obj.color,
#             }

#     book_index = json.loads(books_data['book_index'])


#     return render(request, 'read.html', {
#         'profile': profile,
#         'book': books_data,
#         'book_content': books_data['content'],
#         'book_index': book_index,
#         'book_format': book_format_data
#     })

def profile(request):

    user = request.user
    if user.is_authenticated:
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            profile = None

        return render(request, 'profile.html', {'profile': profile})
    else:
        return render(request, 'profile.html')

def library(request):
    user = request.user
    if user.is_authenticated:
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            profile = None

        # Query all books
        book_objects = Book.objects.all()

        
        

        return render(request, 'library.html', {'profile': profile, 'books': book_objects})
    else:
        return render(request, 'library.html')