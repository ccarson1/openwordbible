# Generated by Django 5.1.6 on 2025-05-12 19:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_alter_bookformat_columns'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bookformat',
            name='font_size',
            field=models.PositiveSmallIntegerField(default=1, max_length=24),
        ),
    ]
