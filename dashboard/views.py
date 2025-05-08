from django.shortcuts import render
from django.conf import settings
from api.models import Book, Language, Religion
from django.http import JsonResponse

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


    return render(request, "books.html", {"books": book_objects})

def update_publish_status(request, book_id):
    if request.method == 'POST':
        try:
            book = Book.objects.get(pk=book_id)
            book.is_published = not book.is_published
            book.save()
            return JsonResponse({'success': True, 'is_published': book.is_published})
        except Book.DoesNotExist:
            return JsonResponse({'error': 'Book not found'}, status=404)
    return JsonResponse({'error': 'Invalid method'}, status=405)
