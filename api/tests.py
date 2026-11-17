import json
import shutil
import tempfile

from django.contrib.auth.models import User
from django.test import TestCase, override_settings

from .book_content import save_sentences, normalize_content
from .models import Annotation, Book, BookFormat, Chapter, Language, Note, Sentence


CONTENT = [{
    "chapter": "Chapter 1",
    "pages": [[
        {"text": "Paul went to Jerusalem .", "labels": ["B-PER", "O", "O", "B-GPE", "O"], "POS": ["PROPN", "VERB", "ADP", "PROPN", "PUNCT"]},
        {"text": "Peter stayed in Jerusalem .", "labels": ["B-PER", "O", "O", "B-GPE", "O"], "POS": ["PROPN", "VERB", "ADP", "PROPN", "PUNCT"]},
    ]],
}]


class BookTestCase(TestCase):

    def setUp(self):
        self.media = tempfile.mkdtemp()
        self.override = override_settings(MEDIA_ROOT=self.media)
        self.override.enable()

        self.user = User.objects.create_user("reader", password="pass12345!")
        self.other = User.objects.create_user("other", password="pass12345!")
        self.staff = User.objects.create_user("admin", password="pass12345!", is_staff=True)

        language = Language.objects.get_or_create(name="English")[0]
        self.book = Book.objects.create(name="Test Book", language=language, date="", is_published=True)
        Chapter.objects.create(book=self.book, index=0, name="Chapter 1", start=0, end=1, length=1)
        save_sentences(self.book, normalize_content(CONTENT))

    def tearDown(self):
        self.override.disable()
        shutil.rmtree(self.media, ignore_errors=True)


class AnnotationTests(BookTestCase):

    def test_same_word_is_annotated_in_every_sentence(self):
        jerusalem = Annotation.objects.filter(text__text="Jerusalem", label__text="B-GPE")
        self.assertEqual(jerusalem.count(), 2)

    def test_saving_again_does_not_duplicate_sentences(self):
        save_sentences(self.book, normalize_content(CONTENT))
        self.assertEqual(Sentence.objects.filter(book=self.book).count(), 2)

    def test_chapter_keeps_full_sentence_text(self):
        self.client.force_login(self.user)
        response = self.client.get(f"/api/book/{self.book.id}/chapter/0/")
        sentence = response.json()["pages"][0][0]
        self.assertEqual(sentence["text"], "Paul went to Jerusalem .")
        self.assertEqual(sentence["labels"], ["B-PER", "O", "O", "B-GPE", "O"])

    def test_update_annotation_needs_staff(self):
        self.client.force_login(self.user)
        response = self.client.post("/api/update-annotation/", {"id": self.book.id, "content": CONTENT, "path": "/etc/passwd"}, content_type="application/json")
        self.assertEqual(response.status_code, 403)


class PermissionTests(BookTestCase):

    def test_read_page_needs_login(self):
        response = self.client.get(f"/read/{self.book.id}/")
        self.assertEqual(response.status_code, 302)

    def test_unpublished_book_is_hidden(self):
        self.book.is_published = False
        self.book.save()
        self.client.force_login(self.user)
        self.assertEqual(self.client.get(f"/read/{self.book.id}/").status_code, 404)

    def test_dashboard_needs_staff(self):
        self.client.force_login(self.user)
        self.assertNotEqual(self.client.get("/dashboard/books/").status_code, 200)
        self.client.force_login(self.staff)
        self.assertEqual(self.client.get("/dashboard/books/").status_code, 200)

    def test_cannot_delete_someone_elses_note(self):
        note = Note.objects.create(book=self.book, user=self.other, title="Mine")
        self.client.force_login(self.user)
        response = self.client.post("/api/delete-note/", {"note_id": note.id}, content_type="application/json")
        self.assertEqual(response.status_code, 404)
        self.assertTrue(Note.objects.filter(id=note.id).exists())

    def test_layout_only_changes_own_format(self):
        BookFormat.objects.create(book=self.book, user=self.other, columns=1)
        self.client.force_login(self.user)
        data = {"id": self.book.id, "columns": 3, "wordsPerPage": 200, "font": "Georgia", "color": "black", "fontSize": 16}
        self.client.post("/api/update-layout/", data, content_type="application/json")
        self.assertEqual(BookFormat.objects.get(user=self.other).columns, 1)
        self.assertEqual(BookFormat.objects.get(user=self.user).columns, 3)


class NoteTests(BookTestCase):

    def test_notes_with_several_tags_are_listed_once(self):
        self.client.force_login(self.user)
        self.client.post("/api/save-note/", {"book": self.book.id, "title": "t", "data": "d", "tags": ["a", "b", "c"]}, content_type="application/json")
        notes = self.client.post("/api/notes/", {"book_id": self.book.id}, content_type="application/json").json()
        self.assertEqual(len(notes), 1)
        self.assertEqual(sorted(notes[0]["tags"]), ["a", "b", "c"])


class PublishTests(BookTestCase):

    def test_publish_saves_sentences_and_forward_slash_path(self):
        self.client.force_login(self.staff)
        book = {"content": [{"chapter": "One", "pages": [["First sentence.", "Second one."], ["Third."]]}]}
        response = self.client.post("/api/publish-book/", {
            "book_name": "New: Book/One",
            "book_language": "English",
            "published_book": json.dumps(book),
            "book_index": "[]",
        })
        self.assertEqual(response.status_code, 201, response.content)
        new_book = Book.objects.get(id=response.json()["book_id"])
        self.assertNotIn("\\", new_book.book_file.name)
        self.assertEqual(new_book.sentences.count(), 3)
        self.assertEqual(new_book.chapters.get().length, 2)

    def test_export_uses_book_id(self):
        self.client.force_login(self.staff)
        book = {"content": CONTENT}
        response = self.client.post("/api/publish-book/", {
            "book_name": "Export Book", "book_language": "English",
            "published_book": json.dumps(book), "book_index": "[]",
        })
        book_id = response.json()["book_id"]
        response = self.client.post("/api/export-dataset/", {"book_id": book_id})
        self.assertEqual(response.status_code, 200)
        self.assertIn('filename="Export_Book.csv"', response["Content-Disposition"])
        self.assertIn("Jerusalem", response.content.decode())
