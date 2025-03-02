from django.shortcuts import render

from api.models import Profile

def home(request):
    user = request.user
    if user.is_authenticated:
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            profile = None


        return render(request, 'home.html', {'profile': profile})
    else:
        return render(request, 'home.html')

def read(request):
    user = request.user
    if user.is_authenticated:
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            profile = None

        return render(request, 'read.html', {'profile': profile})
    else:
        return render(request, 'read.html')


def profile(request):

    user = request.user
    if user.is_authenticated:
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            profile = None

        return render(request, 'profile.html', {'profile': profile})
    else:
        return render(request, 'profile.html')

def library(request):
    user = request.user
    if user.is_authenticated:
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            profile = None

        return render(request, 'library.html', {'profile': profile})
    else:
        return render(request, 'library.html')