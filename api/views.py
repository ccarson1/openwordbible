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
        print(pdf_file)

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