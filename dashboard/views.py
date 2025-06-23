from django.shortcuts import redirect, render, get_object_or_404
from django.conf import settings
from api.models import Book, Language, Religion, Profile, Annotation, Word, Label, POSLabel
from django.http import JsonResponse

import os
import json
import csv


def dashboard(request):

    languages = Language.objects.all()
    religions = Religion.objects.all()

    context = {
        "languages": languages,
        "religions": religions
    }

    return render(request, "dashboard.html", context)

def analytics(request):

    annotations = Annotation.objects.select_related("sentence__book", "text", "label")
    data = []

    for ann in annotations:
        data.append({
            "book_id": ann.sentence.book.id,
            "chapter": ann.sentence.chapter,
            "page": ann.sentence.page,
            "sentence": ann.sentence.text,
            "word_index": ann.word_index,
            "word": ann.text.text,
            "label": ann.label.text,
        })

    pos_data = []
    pos = POSLabel.objects.all()

    for p in pos:
        pos_data.append({
            "label": p.label
        })



    return render(request, "analytics.html", {"annotations": data})




def settings_view(request):
    user = request.user
    profile, created = Profile.objects.get_or_create(user=user)

    if request.method == 'POST':
        profile_image = request.FILES.get('profile_image')
        if profile_image:
            profile.profile_image = profile_image
            profile.save()

        

        return redirect('dashboard:settings_view')

    context = {
        'user_settings': profile,
    }
    return render(request, "settings.html", context)


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


def annotations(request, book_id):
    book = get_object_or_404(Book, pk=book_id)

    # Attempt to read and parse the JSON file
    try:
        with open(book.book_file.path, 'r', encoding='utf-8') as f:
            content = json.load(f)
            content = content['published_book']
            content = content['content']
            
            print(content)
    except FileNotFoundError:
        content = {'error': 'File not found'}
    except json.JSONDecodeError:
        content = {'error': 'Invalid JSON format'}

    if request.method == 'POST':
        return JsonResponse({
            'success': True,
            'book_id': book.id,
            'book_name': book.name,
            'content': content
        })

    return render(request, "annotations.html", {
        "book": {
            "id": book.id,
            "path": book.book_file.path
        },
        "content": content
    })





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
