from django.db import migrations, models


def fix_book_paths(apps, schema_editor):
    Book = apps.get_model('api', 'Book')
    for book in Book.objects.all():
        changed = False
        if book.book_file and '\\' in book.book_file.name:
            book.book_file.name = book.book_file.name.replace('\\', '/')
            changed = True
        if book.image and '\\' in book.image.name:
            book.image.name = book.image.name.replace('\\', '/')
            changed = True
        if changed:
            book.save(update_fields=['book_file', 'image'])


def remove_duplicate_labels(apps, schema_editor):
    for model_name in ('Annotation', 'POSLabel'):
        Model = apps.get_model('api', model_name)
        seen = set()
        for row in Model.objects.order_by('id').values('id', 'sentence_id', 'word_index'):
            key = (row['sentence_id'], row['word_index'])
            if key in seen:
                Model.objects.filter(id=row['id']).delete()
            else:
                seen.add(key)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_bookmark_updated_at'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='annotation',
            name='unique_annotation_text_label',
        ),
        migrations.RemoveConstraint(
            model_name='poslabel',
            name='unique_pos_text_label',
        ),
        migrations.AlterField(
            model_name='sentence',
            name='text',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='book',
            name='image',
            field=models.ImageField(default='book_images/book_default.png', upload_to='book_images/'),
        ),
        migrations.RunPython(fix_book_paths, migrations.RunPython.noop),
        migrations.RunPython(remove_duplicate_labels, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name='annotation',
            constraint=models.UniqueConstraint(fields=('sentence', 'word_index'), name='unique_annotation_sentence_word'),
        ),
        migrations.AddConstraint(
            model_name='poslabel',
            constraint=models.UniqueConstraint(fields=('sentence', 'word_index'), name='unique_pos_sentence_word'),
        ),
    ]
