from django.db import models
from django.contrib.auth.models import User

class Language(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Religion(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Book(models.Model):
    name = models.CharField(max_length=255)
    language = models.ForeignKey(Language, on_delete=models.CASCADE)
    date = models.CharField(max_length=255, default=None)
    religion = models.ForeignKey(Religion, on_delete=models.CASCADE)
    authors = models.CharField(max_length=255, blank=True, null=True, default=None)
    denomination = models.CharField(max_length=255, blank=True, null=True,default=None)
    translator = models.CharField(max_length=255, blank=True, null=True,default=None)
    book_id = models.CharField(max_length=255, blank=True, null=True,  default=None)
    description = models.CharField(max_length=255, blank=True, null=True, default=None)
    rights = models.CharField(max_length=255, blank=True, null=True, default=None)
    publisher = models.CharField(max_length=255, blank=True, null=True, default=None)
    image = models.ImageField(upload_to="book_images/", default="book_images/default.jpg")
    book_file = models.FileField(upload_to="books/", blank=True, null=True)
    is_published = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
class Bookmark(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="bookmarks")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookmarks")
    current_page = models.IntegerField(default=1)
    scroll_position = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bookmark for {self.book.name} by {self.user.username}"
    
class BookFormat(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="bookformats")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookformats")
    words = models.IntegerField()
    columns = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 5)])
    font = models.CharField(max_length=25, blank=True, null=True)
    font_size = models.PositiveSmallIntegerField(default=1)
    color = models.CharField(max_length=50, default="black")

class Note(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    note = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note by {self.user.username} on {self.book.name}"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_image = models.ImageField(upload_to="profile_images/", null=True, blank=True)
    bookmark = models.CharField(max_length=255, null=True, blank=True, default="")

    def __str__(self):
        return self.user.username