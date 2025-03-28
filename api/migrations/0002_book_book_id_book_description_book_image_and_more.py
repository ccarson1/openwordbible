# Generated by Django 5.1.6 on 2025-03-08 14:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='book_id',
            field=models.CharField(default=None, max_length=255),
        ),
        migrations.AddField(
            model_name='book',
            name='description',
            field=models.CharField(default=None, max_length=255),
        ),
        migrations.AddField(
            model_name='book',
            name='image',
            field=models.ImageField(default='book_images/default.jpg', upload_to='book_images/'),
        ),
        migrations.AddField(
            model_name='book',
            name='publisher',
            field=models.CharField(default=None, max_length=255),
        ),
        migrations.AddField(
            model_name='book',
            name='rights',
            field=models.CharField(default=None, max_length=255),
        ),
        migrations.AddField(
            model_name='book',
            name='translator',
            field=models.CharField(default=None, max_length=255),
        ),
        migrations.AlterField(
            model_name='book',
            name='date',
            field=models.CharField(default=None, max_length=255),
        ),
    ]
