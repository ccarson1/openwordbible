from django.shortcuts import redirect, render, get_object_or_404
from django.conf import settings
from django.contrib.auth.views import redirect_to_login
from django.core.exceptions import PermissionDenied
from functools import wraps
from django.views.decorators.http import require_POST
from django import forms
from api.models import Book, Language, Religion, Annotation, POSLabel
from api.book_content import normalize_content, read_book_json
from django.http import JsonResponse

import os
import zipfile
from io import BytesIO
from django.http import HttpResponse


def staff_member_required(view):
    @wraps(view)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect_to_login(request.get_full_path())
        if not request.user.is_staff:
            raise PermissionDenied
        return view(request, *args, **kwargs)
    return wrapper


@staff_member_required
def dashboard(request):

    languages = Language.objects.all()
    religions = Religion.objects.all()

    context = {
        "languages": languages,
        "religions": religions
    }

    return render(request, "dashboard.html", context)


@staff_member_required
def upload(request):

    languages = Language.objects.all()
    religions = Religion.objects.all()

    context = {
        "languages": languages,
        "religions": religions
    }

    return render(request, "upload.html", context)


@staff_member_required
def analytics(request):

    annotations = Annotation.objects.select_related("sentence", "text", "label")
    data = []

    for ann in annotations:
        data.append({
            "book_id": ann.sentence.book_id,
            "chapter": ann.sentence.chapter_id,
            "page": ann.sentence.page,
            "sentence": ann.sentence.text,
            "word_index": ann.word_index,
            "word": ann.text.text,
            "label": ann.label.text,
        })

    pos_data = [{"label": label} for label in POSLabel.objects.values_list("label__text", flat=True)]

    return render(request, "analytics.html", {"annotations": data, "pos": pos_data})


@staff_member_required
def settings_view(request):
    return redirect('profile')


@staff_member_required
def annotations(request, book_id):
    book = get_object_or_404(Book, pk=book_id)

    try:
        content = read_book_json(book)
        content = normalize_content(content['published_book']['content']) if content else []
    except FileNotFoundError:
        content = {'error': 'File not found'}
    except (ValueError, KeyError):
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
            "name": book.name,
            "date": book.date,
            "religion": book.religion.name if book.religion else ""
        },
        "content": content
    })


@staff_member_required
def books(request):
    book_objects = Book.objects.all().select_related('religion')

    return render(request, "books.html", {"books": book_objects})


class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = ['name', 'date', 'language', 'religion', 'authors', 'denomination', 'translator',
                  'book_id', 'description', 'rights', 'publisher', 'image', 'is_published']
        labels = {'book_id': 'ISBN', 'is_published': 'Published'}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['image'].required = False
        for name, field in self.fields.items():
            if name == 'is_published':
                field.widget.attrs['class'] = 'form-check-input'
            elif name in ('language', 'religion'):
                field.widget.attrs['class'] = 'form-select'
            else:
                field.widget.attrs['class'] = 'form-control'


@staff_member_required
def edit_book(request, book_id):
    book = get_object_or_404(Book, pk=book_id)

    if request.method == 'POST':
        form = BookForm(request.POST, request.FILES, instance=book)
        if form.is_valid():
            form.save()
            return redirect('dashboard:books')
    else:
        form = BookForm(instance=book)

    return render(request, "edit_book.html", {"book": book, "form": form})


@staff_member_required
@require_POST
def update_publish_status(request, book_id):
    book = get_object_or_404(Book, pk=book_id)
    book.is_published = not book.is_published
    book.save(update_fields=['is_published'])
    return JsonResponse({'success': True, 'is_published': book.is_published})


@staff_member_required
def download_owb_service(request):
    folder_path = os.path.join(settings.BASE_DIR, 'owb_service')
    zip_filename = 'owb_service.zip'

    if not os.path.exists(folder_path):
        return HttpResponse("The requested folder does not exist.", status=404)

    zip_buffer = BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(folder_path):
            # Exclude __pycache__ folders from walking
            dirs[:] = [d for d in dirs if d != '__pycache__']

            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, folder_path)
                zip_file.write(file_path, arcname)

    zip_buffer.seek(0)

    response = HttpResponse(zip_buffer, content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename="{zip_filename}"'
    return response
