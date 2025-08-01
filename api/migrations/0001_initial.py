# Generated by Django 5.2.3 on 2025-06-17 18:08

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Book',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('date', models.CharField(default=None, max_length=255)),
                ('authors', models.CharField(blank=True, default=None, max_length=255, null=True)),
                ('denomination', models.CharField(blank=True, default=None, max_length=255, null=True)),
                ('translator', models.CharField(blank=True, default=None, max_length=255, null=True)),
                ('book_id', models.CharField(blank=True, default=None, max_length=255, null=True)),
                ('description', models.CharField(blank=True, default=None, max_length=255, null=True)),
                ('rights', models.CharField(blank=True, default=None, max_length=255, null=True)),
                ('publisher', models.CharField(blank=True, default=None, max_length=255, null=True)),
                ('image', models.ImageField(default='book_images/default.jpg', upload_to='book_images/')),
                ('book_file', models.FileField(blank=True, null=True, upload_to='books/')),
                ('is_published', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Label',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Language',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Religion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Word',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='BookFormat',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('words', models.IntegerField(default=500)),
                ('columns', models.PositiveSmallIntegerField(choices=[(1, '1'), (2, '2'), (3, '3'), (4, '4')], default=1)),
                ('font', models.CharField(blank=True, max_length=25, null=True)),
                ('font_size', models.PositiveSmallIntegerField(default=15, max_length=24)),
                ('color', models.CharField(default='black', max_length=50)),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookformats', to='api.book')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookformats', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Bookmark',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('current_page', models.IntegerField(default=1)),
                ('scroll_position', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookmarks', to='api.book')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookmarks', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='book',
            name='language',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.language'),
        ),
        migrations.CreateModel(
            name='Note',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('note', models.TextField()),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.book')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('profile_image', models.ImageField(blank=True, null=True, upload_to='profile_images/')),
                ('bookmark', models.CharField(blank=True, default='', max_length=255, null=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='book',
            name='religion',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.religion'),
        ),
        migrations.CreateModel(
            name='Sentence',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=500)),
                ('chapter', models.IntegerField(default=0)),
                ('page', models.IntegerField(default=0)),
                ('sentence_index', models.IntegerField(default=0)),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sentences', to='api.book')),
            ],
        ),
        migrations.CreateModel(
            name='Annotation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('word_index', models.IntegerField(default=0)),
                ('label', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.label')),
                ('sentence', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.sentence')),
                ('text', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.word')),
            ],
            options={
                'constraints': [models.UniqueConstraint(fields=('text', 'label'), name='unique_annotation_text_label')],
            },
        ),
    ]
