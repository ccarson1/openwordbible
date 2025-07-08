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
    religion = models.ForeignKey(Religion, on_delete=models.CASCADE,default=None, null=True, blank=True)
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
    current_chapter = models.IntegerField(default=0)
    current_page = models.IntegerField(default=0)
    current_word = models.IntegerField(default=0)
    scroll_position = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "book"], name="unique_user_book_bookmark")
        ]

    def __str__(self):
        return f"Bookmark for {self.book.name} by {self.user.username}"
    
class BookFormat(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="bookformats")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookformats")
    words = models.IntegerField(default=500)
    columns = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 5)], default=1)
    font = models.CharField(max_length=25, blank=True, null=True)
    font_size = models.PositiveSmallIntegerField(default=15)
    color = models.CharField(max_length=50, default="black")

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Note(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.TextField(blank=True)
    note = models.TextField(blank=True)
    color = models.TextField(default='yellow')
    tags = models.ManyToManyField(Tag, blank=True)
    chapter = models.PositiveIntegerField(blank=True, default=0)
    page = models.PositiveIntegerField(blank=True, default=0)
    sentence_index_start = models.PositiveIntegerField(blank=True, default=0)
    sentence_index_end = models.PositiveIntegerField(blank=True, default=0)
    word_index_start = models.PositiveIntegerField(blank=True, default=0)
    word_index_end = models.PositiveIntegerField(blank=True, default=0)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note by {self.user.username} on {self.book.name}"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_image = models.ImageField(upload_to="profile_images/", null=True, blank=True)
    bookmark = models.CharField(max_length=255, null=True, blank=True, default="")

    def __str__(self):
        return self.user.username
    
class Word(models.Model):
    text = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.text
    
class Label(models.Model):
    text = models.CharField(max_length=100, unique=True)
    type = models.CharField(max_length=50)
    def __str__(self):
        return self.text
    
class Chapter(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="chapters")
    index = models.IntegerField(default=0)
    name = models.CharField(max_length=150)
    start = models.IntegerField(default=0)
    end = models.IntegerField(default=0)
    length = models.IntegerField(default=0)
    

class Sentence(models.Model):
    text = models.CharField(max_length=500)
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="sentences")
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, default=None, null=True, related_name="sentences")
    page = models.IntegerField(default=0)
    sentence_index = models.IntegerField(default=0)

    def __str__(self):
        return f'ID:{self.id} | {self.text}'

class Annotation(models.Model):
    word_index = models.IntegerField(default=0)
    sentence = models.ForeignKey(Sentence, on_delete=models.CASCADE)
    text = models.ForeignKey(Word, on_delete=models.CASCADE)
    label = models.ForeignKey(Label, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['text', 'label'], name='unique_annotation_text_label')
        ]

    def __str__(self):
        return f'Text: {self.text} | Label: {self.label}'
    
class POSLabel(models.Model):
    word_index = models.IntegerField(default=0)
    sentence = models.ForeignKey(Sentence, on_delete=models.CASCADE)
    text = models.ForeignKey(Word, on_delete=models.CASCADE)
    label = models.ForeignKey(Label, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['text', 'label'], name='unique_pos_text_label')
        ]

    def __str__(self):
        return f'Text: {self.text} | Label: {self.label}'
    

