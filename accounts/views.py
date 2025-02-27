from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages

def user_login(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect("home")  # Redirect to homepage or dashboard
        else:
            messages.error(request, "Invalid username or password")
    return render(request, "accounts/login.html")

def user_logout(request):
    logout(request)
    return redirect("accounts:login")  # Redirect to login page after logout

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        password2 = request.POST["password2"]
        
        if password == password2:
            if User.objects.filter(username=username).exists():
                messages.error(request, "Username already taken")
            else:
                user = User.objects.create_user(username=username, password=password)
                user.save()
                messages.success(request, "Account created successfully! You can log in now.")
                return redirect("accounts:login")
        else:
            messages.error(request, "Passwords do not match")

    return render(request, "accounts/register.html")