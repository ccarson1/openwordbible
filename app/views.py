from django.shortcuts import render

def home(request):
    return render(request,  'home.html')

def read(request):
    return render(request, 'read.html')