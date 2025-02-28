from django.shortcuts import render

def dashboard(request):
    return render(request, "dashboard.html")  # Redirect to login page after logout
