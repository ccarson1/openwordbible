from django.shortcuts import render, get_object_or_404

from api.models import BookFormat, Profile
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

    print("Book file path:", normalized_path)
    print("File exists?", os.path.exists(normalized_path))

    book_json = None
    if book.book_file and book.book_file.name:
        try:
            with open(normalized_path, 'rb') as file:
                raw = file.read()
                if not raw:
                    raise ValueError("Book file is empty or unreadable in Docker.")
                content = raw.decode('utf-8')
                book_json = json.loads(content)
        except Exception as e:
            print(f"Error reading file for book {book.name}: {e}")

    ######################Needs moved to PublishBook in api views.py###################################################
    # test = json.loads(book_json['published_book'])
    # #print(test['content'][0]['pages'][1])
    # for cha in range(len(test['content'])):
    #     for s in range(len(test['content'][cha]['pages'])):
    #         sentences = []
    #         for c in test['content'][cha]['pages'][s]:
    #             #print(c.split(" "))
    #             sentence = {
    #                 "labels": [],
    #                 "text": c
    #             }
    #             sentences.append(sentence)
    #         test['content'][cha]['pages'][s] = sentences
            #print(test['content'][cha]['pages'][s])
#######################################################################################################################

    print(type(book_json["published_book"]))
    # print(type(str(test)))
    print(book_json)

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
        "content": book_json['published_book']['content'] if book_json else None,
        "book_index": book_json["book_index"] if book_json else None,
        
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

    # print(books_data['book_index'])
    # print(type(books_data['book_index']))
    book_index = json.loads(books_data['book_index'])
    print(f"Book index: {book_index}")
    print(f"Type: {type(book_index)}")
    print(books_data['book_index'])
    print(books_data['content'])

    # print(books_data['book_index'])
    # print(books_data['book_index'][0])
    # book_index_json = json.dumps(book_index) 

    return render(request, 'read.html', {
        'profile': profile,
        'book': books_data,
        'book_content': books_data['content'],
        'book_index': book_index,
        'book_format': book_format_data
    })

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