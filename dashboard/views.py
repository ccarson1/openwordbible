from django.shortcuts import render
from django.conf import settings
from api.models import Book, Language, Religion

import os
import json


def dashboard(request):

    languages = Language.objects.all()
    religions = Religion.objects.all()

    context = {
        "languages": languages,
        "religions": religions
    }

    return render(request, "dashboard.html", context)

def analytics(request):
    return render(request, "analytics.html")

def settings_view(request):
    return render(request, "settings.html")

# def books(request):
#     json_file_path = os.path.join(settings.MEDIA_ROOT, "books/test_book.json")
#     print(os.path.exists(json_file_path))
#     # Read JSON file
#     try:
#         with open(json_file_path, "r", encoding="utf-8") as file:
#             books_data = json.load(file)  # Load JSON data
#             print(books_data['book_name'])
#     except FileNotFoundError:
#         books_data = {"error": "File not found"}
    
#     return render(request, "books.html", {"books": books_data})

def books(request):
    # Query all books
    book_objects = Book.objects.all()

    # Optionally convert to a list of dictionaries for the template
    books_data = []
    for book in book_objects:
        books_data.append({
            "name": book.name,
            "language": book.language.name if book.language else None,
            "date": book.date,
            "religion": book.religion.name if book.religion else None,
            "authors": book.authors,
            "denomination": book.denomination,
            "translator": book.translator,
            "book_id": book.book_id,
            "description": book.description,
            "rights": book.rights,
            "publisher": book.publisher,
            "image_url": book.image.url if book.image else None,
            "file_url": book.book_file.url if book.book_file else None,
        })

    return render(request, "books.html", {"books": books_data})
