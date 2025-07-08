from django.urls import path, include
from .views import ProfileAPIView, BookmarkAPIView, UploadBook, PublishBook, LoadBook, search_books, UpdateLayout, UpdateAnnotation, ExportDataset, SaveNote, TagListView, LoadNotes, DeleteNote
from django.conf import settings
from django.conf.urls.static import static


api_name = "api"

urlpatterns = [
   path('profile/', ProfileAPIView.as_view(), name='api_profile'),
   path("bookmark/<int:book_id>/", BookmarkAPIView.as_view(), name="load_bookmark"),
   path("bookmark/", BookmarkAPIView.as_view(), name="update_bookmark"), 
   path('upload-book/', UploadBook.as_view(), name='upload-book'),
   path('publish-book/', PublishBook.as_view(), name='publish-book'),
   path('load-book/', LoadBook.as_view(), name='load-book'),
   path('update-layout/', UpdateLayout.as_view(), name='update-layout'),
   path('update-annotation/', UpdateAnnotation.as_view(), name='update-annotation'),
   path('search-books/', search_books, name='search_books'),
   path('export-dataset/', ExportDataset.as_view(), name='export-dataset'),
   path('save-note/', SaveNote.as_view(), name='save-note'),
   path('tags/', TagListView.as_view(), name='tag-list'),
   path('notes/', LoadNotes.as_view(), name='notes'),
   path('delete-note/', DeleteNote.as_view(), name='delete-note'),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)