from django.urls import path, include
from .views import ProfileAPIView, LoadBookmarkAPIView
from django.conf import settings
from django.conf.urls.static import static


api_name = "api"

urlpatterns = [
   path('profile/', ProfileAPIView.as_view(), name='api_profile'),
   path('load-bookmark/', LoadBookmarkAPIView.as_view(), name='load-bookmark'),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)