import json
import re
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.conf import settings
import os
import io
import csv
from django.http import StreamingHttpResponse

from django.contrib.auth.models import User



from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.files.storage import default_storage
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib import messages
from .models import BookFormat, Bookmark, Profile, Note, Tag

import PyPDF2
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.permissions import IsAuthenticated
from .book_convert import ConvertBook
# from .annotations import Annotation
from .models import Book, Religion, Language, Word, Label, Annotation, Profile, Sentence, POSLabel, Chapter
from django.core.files import File
from django.db import transaction

from rest_framework import serializers
from rest_framework.decorators import api_view
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter
from rest_framework import serializers
from django.http import JsonResponse
from django.views.decorators.http import require_GET


class ProfileAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        username = request.session.get('username')

        if not username:
            return Response({"error": "User not logged in"}, status=403)

        try:
            user = User.objects.get(username=username)
            profile, created = Profile.objects.get_or_create(user=user)  # Ensure profile exists

            if request.data.get('email'):
                email = request.data.get('email')
                print(email)
            else:
                email = user.email

            if request.FILES.get('profile-image'):
                profile_image = request.FILES.get('profile-image')
                filename = profile_image.name
                profile_images_dir = os.path.join(settings.MEDIA_ROOT, 'profile_images')

                # Create the directory if it doesn't exist
                if not os.path.exists(profile_images_dir):
                    os.makedirs(profile_images_dir)

                file_path = os.path.join(profile_images_dir, filename)

                with default_storage.open(file_path, 'wb') as destination:
                    for chunk in profile_image.chunks():
                        destination.write(chunk)

                new_image_path = f'profile_images/{filename}'
                profile.profile_image = new_image_path
                request.session['profile-image'] = new_image_path
            else:
                profile_image = profile.profile_image
            if email:
                user.email = email
                user.save()

            profile.save()

            return Response({"success": "Profile updated successfully"})

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)


class BookmarkAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Save or update a bookmark
        """
        data = request.data
        try:
            book = Book.objects.get(id=data.get("book_id"))
            defaults={
                    "current_chapter": data.get("chapter", 0),
                    "current_page": data.get("page", 0),
                    "current_word": data.get("word", 0),
                    "scroll_position": data.get("scroll", 0)
                }
            print(defaults)

            bookmark, _ = Bookmark.objects.update_or_create(
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

        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request, book_id):
        """
        Load a bookmark for the given book ID
        """
        try:
            book = Book.objects.get(id=book_id)
            bookmark = Bookmark.objects.get(user=request.user, book=book)

            data = {
                "chapter": bookmark.current_chapter,
                "page": bookmark.current_page,
                "word": bookmark.current_word,
                "scroll": bookmark.scroll_position,
                "updated_at": bookmark.updated_at.isoformat() if hasattr(bookmark, "updated_at") else None
            }

            return Response({"bookmark": data})
        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)
        except Bookmark.DoesNotExist:
            return Response({"bookmark": None})

        
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'
        
class SaveNote(APIView):
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        if user.is_authenticated:
            data = request.data
            title = data.get('title')
            book_id  = data.get('book')
            note_data = data.get('data')
            color = data.get('note_color')
            chapter = data.get('chapter')
            page = data.get('page')
            sentence_index_start = data.get('sentence_index_start')
            sentence_index_end = data.get('sentence_index_end')
            word_index_start = data.get('word_index_start')
            word_index_end = data.get('word_index_end')
            tag_names = data.get('tags', [])

            try:
                book = Book.objects.get(id=book_id)
            except Book.DoesNotExist:
                return Response({'error': 'Book not found'}, status=404)
            
            print({
                user.username: user.id,
                'title': title,
                'book': book,
                'note_data': note_data,
                'color': color,
                'chapter': chapter,
                'page': page,
                'sentence_index_start': sentence_index_start,
                'sentence_index_end': sentence_index_end,
                'word_index_start': word_index_start,
                'word_index_end': word_index_end,
                'tag_names': tag_names
            })

            # Save or process note here
            ##################################################################
            note = Note.objects.create(
                user = user,
                title = title,
                book = book,
                note = note_data,
                color = color,
                chapter = chapter,
                page = page,
                sentence_index_start = sentence_index_start,
                sentence_index_end = sentence_index_end,
                word_index_start = word_index_start,
                word_index_end = word_index_end,
            )
            
            for name in tag_names:
                tag, _ = Tag.objects.get_or_create(name=name)
                note.tags.add(tag)

            all_notes = Note.objects.filter(user=user, book=book).order_by('-date')
            serialized = NoteSerializer(all_notes, many=True)
            return Response({'status': 'success', 'notes': serialized.data})
        
        return Response({'error': 'Unauthorized'}, status=401)
    
class DeleteNote(APIView):
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        if user.is_authenticated:
            data = request.data
            print(data)

            note_id = request.data.get('note_id')
            book_id = request.data.get('book_id')

            Note.objects.filter(id=note_id).delete()
        
        return Response({'deleted': note_id})
    

class LoadNotes(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        book_id = request.data.get('book_id')

        notes_qs = Note.objects.filter(user=user)
        if book_id:
            notes_qs = notes_qs.filter(book_id=book_id)

        notes_list = list(notes_qs.values(
            'id', 'book', 'title', 'note', 'color', 'tags', 'chapter', 'page', 
            'sentence_index_start', 'sentence_index_end',
            'word_index_start', 'word_index_end', 'date'
        ))

        return Response(notes_list, status=status.HTTP_200_OK)
        
class UploadBook(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]  
    
    def post(self, request, *args, **kwargs):

        
        
        user = request.user
        
        print(user)
        file = request.FILES.get("book-file")

        
        if user.is_authenticated:
            #annotation.print_tensorflow_version()
            file = request.FILES.get("book-file")
            book_type = request.data.get("book-type")
            print(f"The file uploaded was {file.name}")
            print(book_type)
            convert_book = ConvertBook()
            if book_type == 'TXT':
                book_text = convert_book.convert_from_text(file)
            elif book_type == 'EPUB':
                book_text = convert_book.convert_from_epub(file)
            elif book_type == 'PDF':
                book_text = convert_book.convert_from_pdf(file)
            # try:
                
            # except:
            #     return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
            return Response({
                    'uploaded-file': book_text,
                }, status=status.HTTP_200_OK)
        
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    


class PublishBook(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        if user.is_authenticated:
            # Extract form data
            book_name = request.data.get("book_name")
            published_book = request.data.get("published_book")
            book_date = request.data.get("book_date")
            book_religion_id = request.data.get("book_religion")
            book_denom = request.data.get("book_denom")
            book_author = request.data.get("book_author")
            book_translator = request.data.get("book_translator")
            book_id = request.data.get("book_isbn")
            book_description = request.data.get("book_description")
            book_rights = request.data.get("book_rights")
            book_publisher = request.data.get("book_publisher")
            book_language_id = request.data.get("book_language")
            book_image = request.FILES.get("book_image")
            book_index = request.data.get("book_index")

            # Get Language and Religion objects by ID
            try:
                book_language = Language.objects.get(name=book_language_id)  # Changed from .get(id=...)
                print("Book Language")
                print(book_language)
            except Language.DoesNotExist:
                return Response({"error": "Language not found"}, status=status.HTTP_400_BAD_REQUEST)

            book_religion = None
            religion_name = None
            print(book_religion_id)
            #print(published_book)
            print("book_name:", book_name)
            #print("published_book:", published_book)
            print("book_date:", book_date)
            print("book_religion_id:", book_religion_id)
            print("book_denom:", book_denom)
            print("book_author:", book_author)
            print("book_translator:", book_translator)
            print("book_id (ISBN):", book_id)
            print("book_description:", book_description)
            print("book_rights:", book_rights)
            print("book_publisher:", book_publisher)
            print("book_language_id:", book_language_id)
            print("book_image:", book_image)
            print("book_index", book_index)
            print("Content Type: ", type(published_book))
            print("This is the Published book")
            #print(published_book)
            loaded_content = json.loads(published_book)
            for index, ch in enumerate(loaded_content["content"]):
                print(loaded_content["content"][index])
                print("Chapter Name: ", loaded_content["content"][index]["chapter"])
                print("Start: ", loaded_content["content"][index]["start"])
                print("End: ", loaded_content["content"][index]["end"])
                print("Length: ", loaded_content["content"][index]["length"])
                print("Index: ", index)


            language_name = book_language.name
            print("Language Name:", language_name)
            
            # Write JSON to disk
            book_dir = os.path.join(settings.MEDIA_ROOT, "books")
            
            filename = book_name.replace(" ", "_").replace(":", "").replace("/", "").replace("\\", "") + ".json"
            file_path = os.path.join(book_dir, filename)
            print(f"File path for saving: {file_path}")


            os.makedirs(book_dir, exist_ok=True)

            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump({'published_book': json.loads(published_book), 'book_index': book_index}, f, indent=4, ensure_ascii=False)
                
                # Reopen the file as a Django File to assign to FileField
                with open(file_path, 'rb') as f:
                    django_file = File(f)
                    
                    print(f"Django File: {django_file}")
                    # Save the book details to the database
                    new_book = Book.objects.create(
                        name=book_name,
                        language=book_language,
                        date=book_date,
                        religion=book_religion,
                        authors=book_author,
                        denomination=book_denom,
                        translator=book_translator,
                        book_id=book_id,
                        description=book_description,
                        rights=book_rights,
                        publisher=book_publisher,
                        image=book_image,
                        book_file=os.path.join("books", filename)
                    )

                    # Save chapters to the database
                    for index, ch in enumerate(loaded_content["content"]):
                        chapter_name = ch["chapter"]
                        start = ch["start"]
                        end = ch["end"]
                        length = ch["length"]

                        Chapter.objects.create(
                            book=new_book,
                            index=index,
                            name=chapter_name,
                            start=start,
                            end=end,
                            length=length
                        )

                        print(f"Chapter '{chapter_name}' saved.")

                print(f"Book {book_name} saved successfully with ID {new_book.id}")
                return Response({"message": "Book saved successfully!", "book_id": new_book.id}, status=status.HTTP_201_CREATED)

            except Exception as e:
                print(f"Error while saving the book: {str(e)}")


        return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({"message": "Book saved successfully!", "book_id": 1}, status=status.HTTP_201_CREATED)


class LoadBook(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        book_id = request.data.get("id")
        print(f"The Book id is {book_id}")
        if not book_id:
            return Response({"error": "Book ID is required."}, status=400)

        book = get_object_or_404(Book, id=book_id)

        book_json = None
        if book.book_file and book.book_file.name:
            try:
                with book.book_file.open('rb') as file:
                    content = file.read().decode('utf-8')
                    book_json = json.loads(content)
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
            "content": book_json["published_book"] if book_json else None,
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

        if created == True:
            print(f"New format object has been created for {book.name} with id {book.id}")
        else:
            print(f"Book format id: {book_format.id}")

        format_data = {
            "words": book_format.words,
            "columns": book_format.columns,
            "font": book_format.font,
            "font_size": book_format.font_size,
            "color": book_format.color,
        } if book_format else None

        return Response({
            "book": books_data,
            "book_format": format_data,
        })
    
# class ChapterDetailAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, book_id, chapter_index):
#         user = request.user
#         book = get_object_or_404(Book, id=book_id)
#         chapter = get_object_or_404(Chapter, book=book, index=chapter_index)

#         # Fetch sentences for this chapter, grouped by page
#         sentences = Sentence.objects.filter(chapter=chapter).order_by('sentence_index')

#         pages = {}
#         for s in sentences:
#             pages.setdefault(s.page, []).append({"text": s.text})

#         sorted_pages = [pages[p] for p in sorted(pages)]

#         return Response({
#             "chapter": chapter.name,
#             "index": chapter.index,
#             "start": chapter.start,
#             "end": chapter.end,
#             "length": chapter.length,
#             "pages": sorted_pages
#         })


class ChapterDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, book_id, chapter_index):
        user = request.user
        book = get_object_or_404(Book, id=book_id)
        chapter = get_object_or_404(Chapter, book=book, index=chapter_index)

        # Fetch all relevant sentences
        sentences = Sentence.objects.filter(chapter=chapter).order_by('sentence_index')

        # Prefetch annotations and pos labels for efficiency
        annotations = Annotation.objects.filter(sentence__in=sentences).select_related('label', 'text')
        pos_labels = POSLabel.objects.filter(sentence__in=sentences).select_related('label', 'text')

        # Build index: sentence_id → list of (word_index, label/text)
        ann_map = {}
        for a in annotations:
            ann_map.setdefault(a.sentence_id, []).append((a.word_index, a.label.text, a.text.text))

        pos_map = {}
        for p in pos_labels:
            pos_map.setdefault(p.sentence_id, []).append((p.word_index, p.label.text, p.text.text))

        # Group sentences by page
        pages = {}
        for s in sentences:
            # Get the word-level info
            sentence_annotations = sorted(ann_map.get(s.id, []), key=lambda x: x[0])
            sentence_pos = sorted(pos_map.get(s.id, []), key=lambda x: x[0])

            labels = [label for _, label, _ in sentence_annotations]
            pos_tags = [pos for _, pos, _ in sentence_pos]
            words = [text for _, _, text in sentence_annotations] or s.text.split()  # fallback

            sentence_dict = {
                "text": " ".join(words),
                "labels": labels,
                "POS": pos_tags
            }

            pages.setdefault(s.page, []).append(sentence_dict)

        # Sort pages
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

    def post(self, request, *args, **kwargs):
        print(request.data)
        format_data = ''
        print(request.user.id)

        columns = request.data.get("columns")
        words_per_page = request.data.get("wordsPerPage")
        textFont = request.data.get("font")
        textColor = request.data.get("color")
        fontSize = request.data.get("fontSize")
        book_id = request.data.get("id")

        book = get_object_or_404(Book, id=book_id)

        book_format = BookFormat.objects.filter(book=book).first()

        if not book_format:
            return Response({"error": "BookFormat not found"}, status=404)
        print(words_per_page)
        book_format.columns = int(columns)
        book_format.words = int(words_per_page)
        book_format.font = textFont
        book_format.color = textColor
        book_format.font_size = int(fontSize)
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

    def post(self, request, *args, **kwargs):
        content = request.data.get("content")
        path = request.data.get("path")
        book_id = request.data.get("id")
        print(path)
        #print(content[0]["pages"][0])

        try:
            book = Book.objects.get(pk=book_id)
        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=404)
        
        

        with transaction.atomic():
            for chapter_index, chapter in enumerate(content):
                chapter_obj = Chapter.objects.get(book=book, index=chapter_index) 
                for page_index, page in enumerate(chapter['pages']):
                    for sentence_index, sentence in enumerate(page):
                        words = sentence['text'].split(" ")
                        labels = sentence['labels']
                        pos = sentence['POS']

                        if len(words) != len(labels):
                            continue  # Skip inconsistent entries

                        # Create and save the Sentence
                        sentence_obj = Sentence.objects.create(
                            text=sentence['text'],
                            book=book,
                            chapter=chapter_obj, 
                            page=page_index,
                            sentence_index=sentence_index
                        )

                        

                        for word_index, (word_text, label_text, pos_text) in enumerate(zip(words, labels, pos)):

                             # Get or create the Word and Label
                            word_obj, _ = Word.objects.get_or_create(text=word_text)
                            label_obj, _ = Label.objects.get_or_create(text=label_text, type="NER")
                            pos_obj, _ = Label.objects.get_or_create(text=pos_text, type="POS")

                            poslabel, pos_created = POSLabel.objects.get_or_create(
                                text=word_obj,
                                label=pos_obj,
                                defaults={
                                    'word_index': word_index,
                                    'sentence': sentence_obj
                                }
                            )

                            if label_text == "O":
                                continue  # Skip non-entity labels

                            # Prevent duplicate Annotation
                            annotation, created = Annotation.objects.get_or_create(
                                text=word_obj,
                                label=label_obj,
                                defaults={
                                    'word_index': word_index,
                                    'sentence': sentence_obj
                                }
                            )

        if not path:
            return Response({"error": "Missing file path"}, status=400)

        print(f"Received path: {path}")

        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            data['published_book']['content'] = content

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)


        return Response({"message": "Annotation update was successful"})

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'name']

    
@api_view(['GET'])
def search_books(request):
    query = request.GET.get('query', '')
    print(f"The query is {query}")
    if query:
        books = Book.objects.filter(name__icontains=query, is_published=True)
    else:
        books = Book.objects.none()

    serializer = BookSerializer(books, many=True)
    return Response(serializer.data)


class ExportDataset(APIView):
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        if user.is_authenticated:
            file_path = request.data.get("file_path")
            if not file_path:
                return Response({"error": "file_path is required"}, status=400)

            return self.export_to_CSV(file_path)

    def export_to_CSV(self, file_path):
        with open("media/" + file_path, 'r', encoding='utf-8') as file:
            content = json.load(file)

        labels = []
        sentences = []
        file_name = file_path.split("\\")
        file_name = file_name[-1]

        for x in content['published_book']['content']:
            for y in x['pages']:
                for sent in y:
                    for z in sent['labels']:
                        if z != 'O ' and z != 'O':
                            temp_labels = ' '.join(sent['labels'])
                            labels.append(temp_labels)
                            sentences.append(sent['text'])
                            break
        
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

        # Write to in-memory buffer
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["word", "label"])
        writer.writerows(reconstructed)

        # Prepare the buffer for reading
        buffer.seek(0)
        response = StreamingHttpResponse(
            buffer,
            content_type='text/csv'
        )
        print(file_name)
        response['Content-Disposition'] = 'attachment; filename="'+ file_name +'.csv"'
        return response
    
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']
    
class TagListView(ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter]
    search_fields = ['name']



                