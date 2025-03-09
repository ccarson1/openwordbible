from django.shortcuts import render
from django.conf import settings

import os
import json


def dashboard(request):
    return render(request, "dashboard.html")

def analytics(request):
    return render(request, "analytics.html")

def books(request):
    json_file_path = os.path.join(settings.MEDIA_ROOT, "books/test_book.json")
    print(os.path.exists(json_file_path))
    # Read JSON file
    try:
        with open(json_file_path, "r", encoding="utf-8") as file:
            books_data = json.load(file)  # Load JSON data
            print(books_data['book_name'])
    except FileNotFoundError:
        books_data = {"error": "File not found"}
    
    return render(request, "books.html", {"books": books_data})
