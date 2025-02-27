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
    date = models.DateField()
    religion = models.ForeignKey(Religion, on_delete=models.CASCADE)
    authors = models.CharField(max_length=255, default=None)
    denomination = models.CharField(max_length=255, default=None)

    def __str__(self):
        return self.name

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

    def __str__(self):
        return self.user.username