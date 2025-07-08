from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.apps import apps

@receiver(post_migrate)
def populate_initial_data(sender, **kwargs):
    Language = apps.get_model('api', 'Language')
    Religion = apps.get_model('api', 'Religion')

    default_languages = ['English', 'Spanish', 'French', 'Arabic']
    default_religions = ['Christianity', 'Islam', 'Hinduism', 'Buddhism']

    for lang in default_languages:
        Language.objects.get_or_create(name=lang)

    for rel in default_religions:
        Religion.objects.get_or_create(name=rel)