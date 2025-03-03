from django.urls import path
from .views import dashboard, analytics, books

app_name = "dashboard"

urlpatterns = [
    path("", dashboard, name="dashboard"),
    path("analytics/", analytics, name="analytics"),
    path("books/", books, name="books")

]