from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from .views import dashboard, analytics, settings_view, books, update_publish_status

app_name = "dashboard"

urlpatterns = [
    path("", dashboard, name="dashboard"),
    path("analytics/", analytics, name="analytics"),
    path("settings_view/", settings_view, name="settings_view"),
    path("books/", books, name="books"),
    path('books/<int:book_id>/publish/', update_publish_status, name='update_publish_status'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
