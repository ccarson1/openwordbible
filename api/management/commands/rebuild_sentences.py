from django.core.management.base import BaseCommand

from api.book_content import normalize_content, read_book_json, save_sentences
from api.models import Book, Chapter


class Command(BaseCommand):
    help = "Rebuild the sentences, annotations and POS labels of books from their saved JSON files"

    def add_arguments(self, parser):
        parser.add_argument('book_ids', nargs='*', type=int)

    def handle(self, *args, **options):
        books = Book.objects.all()
        if options['book_ids']:
            books = books.filter(id__in=options['book_ids'])

        for book in books:
            try:
                data = read_book_json(book)
            except (OSError, ValueError) as e:
                self.stderr.write(f"Skipping {book.id} {book.name}: {e}")
                continue
            if not data:
                self.stderr.write(f"Skipping {book.id} {book.name}: no book file")
                continue

            content = normalize_content(data['published_book'].get('content'))

            start = 0
            for index, chapter in enumerate(content):
                length = len(chapter['pages'])
                Chapter.objects.update_or_create(
                    book=book, index=index,
                    defaults={
                        'name': (chapter.get('chapter') or f"Chapter {index + 1}")[:150],
                        'start': start,
                        'end': start + length,
                        'length': length,
                    }
                )
                start += length
            Chapter.objects.filter(book=book, index__gte=len(content)).delete()

            count = save_sentences(book, content)
            self.stdout.write(f"{book.id} {book.name}: {count} sentences")
