from django.shortcuts import render

def dashboard(request):
    return render(request, "dashboard.html")

def analytics(request):
    return render(request, "analytics.html")

def books(request):
    return render(request, "books.html")
