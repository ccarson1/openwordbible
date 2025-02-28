
from django.urls import path, include
from .views import home, read, profile

urlpatterns = [
    path('', home, name='home'), 
    path('read', read, name='read'),
    path('profile', profile, name='profile')
    
]