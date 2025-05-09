from django.shortcuts import render, get_object_or_404

from api.models import BookFormat, Profile
from api.models import Book
import json

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

    # Optionally convert to a list of dictionaries for the template
    #books_data = []
    print(book.book_file)
    book_json = None
    if book.book_file and book.book_file.name:
        print(book.book_file)
        try:
            with book.book_file.open('rb') as file:
                content = file.read().decode('utf-8')
                book_json = json.loads(content) 
        except Exception as e:
            print(f"Error reading file for book {book.name}: {e}")

    
    books_data = {
        "id": book.id,
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
        "content": book_json["published_book"],
    }
    
    profile = None
    if user.is_authenticated:
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            profile = None

    book_format = None
    if user.is_authenticated:
        book_format = BookFormat.objects.filter(book=book, user=user).first()

    print(book_format)
    return render(request, 'read.html', {
        'profile': profile,
        'book': books_data,
        'book_format': book_format
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