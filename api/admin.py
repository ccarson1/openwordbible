from django.contrib import admin
from .models import Language, Religion, Book, Note, Profile

admin.site.register(Language)
admin.site.register(Religion)
admin.site.register(Book)
admin.site.register(Note)
admin.site.register(Profile)