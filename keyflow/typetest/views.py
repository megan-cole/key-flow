from django.shortcuts import render, redirect
from .models import Accounts, Statistics
from .forms import UserRegistrationForm
# Create your views here.

def index(request):
    return render(request, 'index.html')

def typetest(request):
    return render(request, 'typetest.html')

def leaderboard(request):
    return render(request, 'leaderboard.html')

def register_view(request):
    if request.method == "POST":
        print("bello")
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            print("hello")
            form.save()
            return redirect("/")

    form = UserRegistrationForm()
    return render(request, "register.html", {"form": form})