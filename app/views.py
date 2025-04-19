from django.shortcuts import render

from api.models import Profile
from api.models import Book

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

def read(request):
    user = request.user
    if user.is_authenticated:
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            profile = None

        return render(request, 'read.html', {'profile': profile})
    else:
        return render(request, 'read.html')


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

        return render(request, 'library.html', {'profile': profile, 'books': books_data})
    else:
        return render(request, 'library.html')