import json
import re
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
import os

from django.contrib.auth.models import User
from api.models import Profile


from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.files.storage import default_storage
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib import messages
from .models import Profile, Note
import os
import PyPDF2
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .book_convert import ConvertBook
from .models import Book, Religion, Language 
from django.core.files import File
import os
import json




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


class LoadBookmarkAPIView(APIView):

    def create_html_text(self, passages):
        # Initialize the HTML with the heading
        head = passages[0].pop(0)  # Assuming the first element in passages contains the header
        page_text = "<h4 class='text-center'>" + head + " <small id='header-page' style='margin-left: 50%;'></small></h4><hr>"
        counter = 0
        for page_count, g in enumerate(passages):
            spans = ''

            for count, i in enumerate(g):
                # Split the text by spaces and process each word
                words = i.split()

                for j in words:
                    if j.strip():  # Check if the word is not just whitespace
                        if re.search(r"{\d+:\d+}", j):
                            counter = counter +1
                            spans += '<span class="passage p' + str(counter) + '">' + j + '</span>'
                        else:
                            spans += '<span class="word w' + str(counter) + ' p'+ str(page_count) +'">' + j + '</span>'

            # Append the constructed spans to the page_text
            page_text += '<div class="read_cols">' + spans + '</div>'

        return page_text
    
    def get_book_text(self, book_name):

        #pdf_file = 'D:\Library/bible\KJVBible\kjvbible\pdfs/'+ book_name +'.pdf'
        pdf_file = 'pdfs/'+ book_name +'.pdf'
        #print(pdf_file)

        file = open(pdf_file, 'rb')
        pdfreader = PyPDF2.PdfReader(file)

        numbered_books = r"Page\s\d+\s\d+\s[a-sA-Z]+\s"
        #passages = r"\s{\d:\d}\s"

        x = pdfreader.pages

        passages=[]
        for p in range(len(x)):
            passage = x[p].extract_text().replace('www.holybooks.com', '').replace("\n", " ")
            passage = re.sub(r'\s+', ' ', passage).strip()

            sub_pass = re.split(r"(\s{\d+:\d+}\s)", passage)
            passages.append(sub_pass)



        return passages

    def post(self, request, *args, **kwargs):
        try:
            # Get JSON data from the request body
            data = request.data
            username = data.get('username')
            print("received request")
            # Fetch user from the database
            # user = get_object_or_404(User, username=username)
            user = request.user


            profile = Profile.objects.filter(user__username=username).first()
            if profile.bookmark:
                # If user exists, process bookmark data
                bookmark = json.loads(profile.bookmark)
                print("Going")
                print(bookmark)
                print(type(bookmark))
                print(bookmark['book'])

                book = bookmark['book']
                book_id = bookmark['book_id']
                page = bookmark['page']

                # Create passages (assuming create_html_text is a utility function)
                passages = self.create_html_text(self.get_book_text(book))

                # Fetch notes for the specific book_id
                all_notes = Note.objects.filter(book_id=book_id)
                notes_list = []
                for note in all_notes:
                    if str(note.owner).rstrip() == str(user).rstrip():  # Assuming `note.owner` and `user` are strings
                        notes_list.append({"id": note.id, "title": note.title, "book": note.book_id, "data": note.data})
            else:
                book = 'Genesis'
                book_id = 1
                page = 1
                passages = []
                notes_list = []
            # Return the response with the required data
            return Response({
                'book': book,
                'book_id': book_id,
                'page': page,
                'passage': passages,
                'notes': notes_list
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f'Error loading bookmark: {e}')
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
class UploadBook(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]  
    
    def post(self, request, *args, **kwargs):
        
        user = request.user
        
        print(user)
        file = request.FILES.get("book-file")

        
        if user.is_authenticated:
        
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

            if book_religion_id and book_religion_id.lower() != "none":
                try:
                    book_religion = Religion.objects.get(name=book_religion_id)
                    religion_name = book_religion.name
                except Religion.DoesNotExist:
                    return Response({"error": "Religion not found"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                print("No religion provided or explicitly set to 'none'.")

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
                    json.dump({'published_book': published_book}, f, indent=4, ensure_ascii=False)
                
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

                print(f"Book {book_name} saved successfully with ID {new_book.id}")
                return Response({"message": "Book saved successfully!", "book_id": new_book.id}, status=status.HTTP_201_CREATED)

            except Exception as e:
                print(f"Error while saving the book: {str(e)}")


        return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
