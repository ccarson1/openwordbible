from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.http import Http404

from api.models import BookFormat, Profile, Sentence, Chapter, Bookmark
from api.models import Book


def get_profile(user):
    if user.is_authenticated:
        return Profile.objects.filter(user=user).first()
    return None


def home(request):
    return render(request, 'home.html', {'profile': get_profile(request.user)})


@login_required
def read(request, id):
    user = request.user
    book = get_object_or_404(Book, id=id)
    if not book.is_published and not user.is_staff:
        raise Http404

    saved_bookmark = Bookmark.objects.filter(user=user, book=book).first()
    if saved_bookmark:
        serialized_bookmark = {
            "current_chapter": saved_bookmark.current_chapter,
            "current_page": saved_bookmark.current_page,
            "current_word": saved_bookmark.current_word,
            "scroll_position": saved_bookmark.scroll_position
        }
    else:
        serialized_bookmark = {
            "current_chapter": 0,
            "current_page": 0,
            "current_word": 0,
            "scroll_position": 0
        }

    chapters = list(Chapter.objects.filter(book=book).order_by('index'))

    bookmark_index = serialized_bookmark["current_chapter"]
    if not any(c.index == bookmark_index for c in chapters):
        bookmark_index = chapters[0].index if chapters else 0
        serialized_bookmark["current_chapter"] = bookmark_index
        serialized_bookmark["current_page"] = 0

    chapters_array = []
    book_index = []
    page_index = 0
    for c in chapters:
        if c.index == bookmark_index:
            # Load full content for bookmarked chapter, the rest is fetched later
            pages_dict = {}
            for s in Sentence.objects.filter(chapter=c).order_by('page', 'sentence_index'):
                pages_dict.setdefault(s.page, []).append({"text": s.text})

            pages_data = [pages_dict[page_num] for page_num in sorted(pages_dict)]
        else:
            pages_data = []

        if c.length > 0:
            book_index.append({"header": c.name, "page": page_index + 1})

        chapters_array.append({
            "chapter": c.name,
            "index": c.index,
            "start": page_index,
            "end": page_index + c.length,
            "length": c.length,
            "pages": pages_data,
            "page_index": page_index
        })
        page_index += c.length

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
        "book_index": book_index,
        "total_pages": page_index
    }

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

    book_format_data = {
        "book": book_format_obj.book.id,
        "user": book_format_obj.user.id,
        "words": book_format_obj.words,
        "columns": book_format_obj.columns,
        "font": book_format_obj.font,
        "font_size": book_format_obj.font_size,
        "color": book_format_obj.color,
    }

    return render(request, 'read.html', {
        'profile': get_profile(user),
        'book': books_data,
        'book_content': books_data['content'],
        'book_index': book_index,
        'book_format': book_format_data
    })


def profile(request):
    return render(request, 'profile.html', {'profile': get_profile(request.user)})


def library(request):
    user = request.user
    if user.is_authenticated:
        book_objects = Book.objects.filter(is_published=True).select_related('religion')

        return render(request, 'library.html', {'profile': get_profile(user), 'books': book_objects})
    else:
        return render(request, 'library.html')
