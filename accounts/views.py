from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils.http import url_has_allowed_host_and_scheme

from api.models import Profile

def user_login(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:    
            login(request, user)
            request.session["username"] = user.username
            request.session["email"] = user.email
            profile = Profile.objects.filter(user=user).first()
            profile_image_url = profile.profile_image.url if profile and profile.profile_image else None
            request.session["profile-image"] = profile_image_url
            next_url = request.POST.get("next") or request.GET.get("next")
            if next_url and url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}):
                return redirect(next_url)
            return redirect("home")
        else:
            messages.error(request, "Invalid username or password")
    return render(request, "accounts/login.html")

def user_logout(request):
    logout(request)
    return redirect("accounts:login")  # Redirect to login page after logout

def register(request):
    if request.method == "POST":
        username = request.POST["username"].strip()
        password = request.POST["password"]
        password2 = request.POST["password2"]
        
        if password == password2:
            if not username:
                messages.error(request, "Username is required")
            elif User.objects.filter(username=username).exists():
                messages.error(request, "Username already taken")
            else:
                try:
                    validate_password(password, User(username=username))
                except ValidationError as e:
                    for error in e.messages:
                        messages.error(request, error)
                    return render(request, "accounts/register.html")
                User.objects.create_user(username=username, password=password)
                messages.success(request, "Account created successfully! You can log in now.")
                return redirect("accounts:login")
        else:
            messages.error(request, "Passwords do not match")

    return render(request, "accounts/register.html")