
from django.urls import path, include
from .views import home, read, profile, library
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('', home, name='home'), 
    path('read/<int:id>/', read, name='read'),
    path('profile', profile, name='profile'),
    path('library', library, name='library')
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)