from django.conf import settings


def service_urls(request):
    return {
        'OWB_SERVICE_URL': settings.OWB_SERVICE_URL,
        'RAG_SERVER_URL': settings.RAG_SERVER_URL,
    }
