import json
import io
import csv
import os

from django.shortcuts import get_object_or_404
from django.http import HttpResponse, Http404
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.utils.text import get_valid_filename

from rest_framework import serializers, status
from rest_framework.decorators import api_view
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .book_convert import ConvertBook
from .book_content import normalize_content, read_book_json, write_book_json, save_sentences
from .models import (Book, BookFormat, Bookmark, Profile, Note, Tag, Religion, Language,
                     Annotation, Sentence, POSLabel, Chapter)


def get_visible_book(user, book_id):
    book = get_object_or_404(Book, id=book_id)
    if not book.is_published and not user.is_staff:
        raise Http404
    return book


class ProfileAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        profile, created = Profile.objects.get_or_create(user=user)

        username = (request.data.get('username') or '').strip()
        if username and username != user.username:
            if User.objects.filter(username=username).exclude(id=user.id).exists():
                return Response({"error": "Username already taken"}, status=400)
            user.username = username

        email = request.data.get('email')
        if email:
            user.email = email

        password = request.data.get('password')
        if password:
            try:
                validate_password(password, user)
            except ValidationError as e:
                return Response({"error": " ".join(e.messages)}, status=400)
            user.set_password(password)

        user.save()
        if password:
            update_session_auth_hash(request, user)

        profile_image = request.FILES.get('profile-image')
        if profile_image:
            old_image = profile.profile_image.name if profile.profile_image else None
            profile.profile_image.save(get_valid_filename(profile_image.name), profile_image, save=False)
            if old_image and old_image != profile.profile_image.name:
                default_storage.delete(old_image)

        profile.save()

        request.session['username'] = user.username
        request.session['email'] = user.email
        request.session['profile-image'] = profile.profile_image.url if profile.profile_image else None

        return Response({
            "success": "Profile updated successfully",
            "profile_image": profile.profile_image.url if profile.profile_image else None,
        })


class BookmarkAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Save or update a bookmark
        """
        data = request.data
        book = get_visible_book(request.user, data.get("book_id"))

        Bookmark.objects.update_or_create(
            user=request.user,
            book=book,
            defaults={
                "current_chapter": data.get("chapter", 0),
                "current_page": data.get("page", 0),
                "current_word": data.get("word", 0),
                "scroll_position": data.get("scroll", 0)
            }
        )
        return Response({"status": "saved"}, status=status.HTTP_200_OK)

    def get(self, request, book_id):
        """
        Load a bookmark for the given book ID
        """
        book = get_visible_book(request.user, book_id)
        bookmark = Bookmark.objects.filter(user=request.user, book=book).first()
        if not bookmark:
            return Response({"bookmark": None})

        data = {
            "chapter": bookmark.current_chapter,
            "page": bookmark.current_page,
            "word": bookmark.current_word,
            "scroll": bookmark.scroll_position,
            "updated_at": bookmark.updated_at.isoformat() if bookmark.updated_at else None
        }

        return Response({"bookmark": data})


class NoteSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')

    class Meta:
        model = Note
        fields = '__all__'


def user_notes(user, book_id=None):
    notes = Note.objects.filter(user=user).prefetch_related('tags').order_by('-date')
    if book_id:
        notes = notes.filter(book_id=book_id)
    return NoteSerializer(notes, many=True).data


class SaveNote(APIView):
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        data = request.data
        book = get_visible_book(user, data.get('book'))

        tag_names = data.get('tags') or []
        if isinstance(tag_names, str):
            tag_names = [t.strip() for t in tag_names.split(',')]
        tag_names = [t for t in tag_names if t]

        note_id = data.get('note_id')
        if note_id:
            note = get_object_or_404(Note, id=note_id, user=user)
            note.title = data.get('title', note.title)
            note.note = data.get('data', note.note)
            if data.get('note_color'):
                note.color = data.get('note_color')
            note.save()
        else:
            note = Note.objects.create(
                user=user,
                book=book,
                title=data.get('title') or '',
                note=data.get('data') or '',
                color=data.get('note_color') or 'yellow',
                chapter=data.get('chapter') or 0,
                page=data.get('page') or 0,
                sentence_index_start=data.get('sentence_index_start') or 0,
                sentence_index_end=data.get('sentence_index_end') or 0,
                word_index_start=data.get('word_index_start') or 0,
                word_index_end=data.get('word_index_end') or 0,
            )

        if tag_names or 'tags' in data:
            note.tags.clear()
            for name in tag_names:
                tag, _ = Tag.objects.get_or_create(name=name[:50])
                note.tags.add(tag)

        return Response({'status': 'success', 'notes': user_notes(user, book.id)})


class DeleteNote(APIView):
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        note = get_object_or_404(Note, id=request.data.get('note_id'), user=request.user)
        note_id = note.id
        note.delete()

        return Response({'deleted': note_id})


class LoadNotes(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        return Response(user_notes(request.user, request.data.get('book_id')), status=status.HTTP_200_OK)


class UploadBook(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAdminUser]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get("book-file")
        book_type = (request.data.get("book-type") or '').upper()

        if not file:
            return Response({'error': 'No file was uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        convert_book = ConvertBook()
        converters = {
            'TXT': convert_book.convert_from_text,
            'EPUB': convert_book.convert_from_epub,
            'PDF': convert_book.convert_from_pdf,
        }
        if book_type not in converters:
            return Response({'error': f'{book_type or "This"} files are not supported yet'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            words_per_page = max(int(request.data.get("words-per-page") or 600), 50)
        except ValueError:
            words_per_page = 600

        try:
            if book_type == 'TXT':
                book_text = converters[book_type](file, words_per_page)
            else:
                book_text = converters[book_type](file)
        except Exception as e:
            return Response({'error': f'Could not read the file: {e}'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'uploaded-file': book_text,
        }, status=status.HTTP_200_OK)


class PublishBook(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAdminUser]

    def post(self, request, *args, **kwargs):
        book_name = (request.data.get("book_name") or '').strip()
        if not book_name:
            return Response({"error": "Book name is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            loaded_content = json.loads(request.data.get("published_book") or '{}')
            book_index = json.loads(request.data.get("book_index") or '[]')
        except json.JSONDecodeError:
            return Response({"error": "Book content is not valid JSON"}, status=status.HTTP_400_BAD_REQUEST)

        content = normalize_content(loaded_content.get("content"))
        if not content:
            return Response({"error": "The book has no pages. Press Add All before uploading."}, status=status.HTTP_400_BAD_REQUEST)
        loaded_content["content"] = content

        try:
            book_language = Language.objects.get(name=request.data.get("book_language"))
        except Language.DoesNotExist:
            return Response({"error": "Language not found"}, status=status.HTTP_400_BAD_REQUEST)

        book_religion = Religion.objects.filter(name=request.data.get("book_religion")).first()

        filename = get_valid_filename(book_name.replace(" ", "_")) + ".json"
        book_json = json.dumps({'published_book': loaded_content, 'book_index': book_index}, indent=4, ensure_ascii=False)
        book_path = default_storage.save("books/" + filename, ContentFile(book_json.encode('utf-8')))

        book_image = request.FILES.get("book_image")

        new_book = Book(
            name=book_name,
            language=book_language,
            date=request.data.get("book_date") or '',
            religion=book_religion,
            authors=request.data.get("book_author"),
            denomination=request.data.get("book_denom"),
            translator=request.data.get("book_translator"),
            book_id=request.data.get("book_isbn"),
            description=request.data.get("book_description"),
            rights=request.data.get("book_rights"),
            publisher=request.data.get("book_publisher"),
            book_file=book_path,
        )
        if book_image:
            new_book.image = book_image
        new_book.save()

        start = 0
        for index, ch in enumerate(content):
            length = len(ch["pages"])
            Chapter.objects.create(
                book=new_book,
                index=index,
                name=(ch.get("chapter") or f"Chapter {index + 1}")[:150],
                start=start,
                end=start + length,
                length=length
            )
            start += length

        save_sentences(new_book, content)

        return Response({"message": "Book saved successfully!", "book_id": new_book.id}, status=status.HTTP_201_CREATED)


class LoadBook(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        book_id = request.data.get("id")
        if not book_id:
            return Response({"error": "Book ID is required."}, status=400)

        book = get_visible_book(user, book_id)

        try:
            book_json = read_book_json(book)
        except Exception as e:
            return Response({"error": f"Failed to read book file: {str(e)}"}, status=500)

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
            "content": {"content": normalize_content(book_json["published_book"].get("content"))} if book_json else None,
        }

        book_format, created = BookFormat.objects.get_or_create(
            book=book,
            user=user,
            defaults={
                "words": 300,
                "columns": 1,
                "font": "Arial",
                "font_size": 14,
                "color": "#000000",
            }
        )

        format_data = {
            "words": book_format.words,
            "columns": book_format.columns,
            "font": book_format.font,
            "font_size": book_format.font_size,
            "color": book_format.color,
        }

        return Response({
            "book": books_data,
            "book_format": format_data,
        })


class ChapterDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, book_id, chapter_index):
        book = get_visible_book(request.user, book_id)
        chapter = get_object_or_404(Chapter, book=book, index=chapter_index)

        sentences = list(Sentence.objects.filter(chapter=chapter).order_by('page', 'sentence_index'))

        annotations = Annotation.objects.filter(sentence__chapter=chapter).select_related('label')
        pos_labels = POSLabel.objects.filter(sentence__chapter=chapter).select_related('label')

        ann_map = {}
        for a in annotations:
            ann_map.setdefault(a.sentence_id, {})[a.word_index] = a.label.text

        pos_map = {}
        for p in pos_labels:
            pos_map.setdefault(p.sentence_id, {})[p.word_index] = p.label.text

        pages = {}
        for s in sentences:
            words = s.text.split(' ')
            sentence_labels = ann_map.get(s.id, {})
            sentence_pos = pos_map.get(s.id, {})

            pages.setdefault(s.page, []).append({
                "text": s.text,
                "labels": [sentence_labels.get(i, "O") for i in range(len(words))],
                "POS": [sentence_pos.get(i, "") for i in range(len(words))]
            })

        sorted_pages = [pages[p] for p in sorted(pages)]

        return Response({
            "chapter": chapter.name,
            "index": chapter.index,
            "start": chapter.start,
            "end": chapter.end,
            "length": chapter.length,
            "pages": sorted_pages
        })


class UpdateLayout(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        book = get_visible_book(request.user, request.data.get("id"))
        book_format, _ = BookFormat.objects.get_or_create(book=book, user=request.user)

        try:
            book_format.columns = min(max(int(request.data.get("columns")), 1), 4)
            book_format.words = max(int(request.data.get("wordsPerPage")), 1)
            book_format.font_size = max(int(request.data.get("fontSize")), 1)
        except (TypeError, ValueError):
            return Response({"error": "Columns, words per page and font size must be numbers"}, status=400)

        book_format.font = (request.data.get("font") or '')[:25]
        book_format.color = (request.data.get("color") or 'black')[:50]
        book_format.save()

        return Response({
            "message": "Layout updated successfully",
            "book_format": {
                "columns": book_format.columns,
                "words_per_page": book_format.words,
                "font": book_format.font,
                "color": book_format.color,
                "font_size": book_format.font_size
            }
        })


class UpdateAnnotation(APIView):
    parser_classes = (JSONParser,)
    permission_classes = [IsAdminUser]

    def post(self, request, *args, **kwargs):
        book = get_object_or_404(Book, pk=request.data.get("id"))

        content = request.data.get("content")
        if not isinstance(content, list):
            return Response({"error": "Missing book content"}, status=400)

        content = normalize_content(content)
        save_sentences(book, content)

        data = read_book_json(book) or {'published_book': {}, 'book_index': []}
        data['published_book']['content'] = content
        write_book_json(book, data)

        return Response({"message": "Annotation update was successful"})


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'name']


@api_view(['GET'])
def search_books(request):
    query = request.GET.get('query', '')
    if query:
        books = Book.objects.filter(name__icontains=query, is_published=True)
    else:
        books = Book.objects.none()

    serializer = BookSerializer(books, many=True)
    return Response(serializer.data)


class ExportDataset(APIView):
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    permission_classes = [IsAdminUser]

    def post(self, request, *args, **kwargs):
        book = get_object_or_404(Book, pk=request.data.get("book_id"))
        return self.export_to_CSV(book)

    def export_to_CSV(self, book):
        content = read_book_json(book) or {'published_book': {'content': []}}
        file_name = os.path.splitext(os.path.basename(book.book_file.name))[0]

        labels = []
        sentences = []

        for x in normalize_content(content['published_book'].get('content')):
            for y in x['pages']:
                for sent in y:
                    if any(z.strip() != 'O' for z in sent['labels']):
                        labels.append(' '.join(sent['labels']))
                        sentences.append(sent['text'])

        reconstructed = []
        current_word = ""
        current_label = ""

        for token, label in zip(sentences, labels):
            if token.startswith("##"):
                current_word += token[2:]
            else:
                if current_word:
                    reconstructed.append((current_word, current_label))
                current_word = token
                current_label = label

        if current_word:
            reconstructed.append((current_word, current_label))

        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["word", "label"])
        writer.writerows(reconstructed)

        response = HttpResponse(buffer.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{file_name}.csv"'
        return response


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class TagListView(ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['name']
