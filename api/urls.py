from django.urls import path, include
from .views import ProfileAPIView, LoadBookmarkAPIView, UploadBook, PublishBook, LoadBook, search_books, UpdateLayout, UpdateAnnotation, ExportDataset
from django.conf import settings
from django.conf.urls.static import static


api_name = "api"

urlpatterns = [
   path('profile/', ProfileAPIView.as_view(), name='api_profile'),
   path('load-bookmark/', LoadBookmarkAPIView.as_view(), name='load-bookmark'),
   path('upload-book/', UploadBook.as_view(), name='upload-book'),
   path('publish-book/', PublishBook.as_view(), name='publish-book'),
   path('load-book/', LoadBook.as_view(), name='publish-book'),
   path('update-layout/', UpdateLayout.as_view(), name='update-layout'),
   path('update-annotation/', UpdateAnnotation.as_view(), name='update-annotation'),
   path('search-books/', search_books, name='search_books'),
   path('export-dataset/', ExportDataset.as_view(), name='export-dataset'),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)