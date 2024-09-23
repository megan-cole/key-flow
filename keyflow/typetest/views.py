from django.shortcuts import render, redirect
from .models import Accounts, Statistics
from .forms import UserRegistrationForm
from django.contrib.auth.hashers import make_password
# Create your views here.

def index(request):
    return render(request, 'index.html')

def typetest(request):
    return render(request, 'typetest.html')

def leaderboard(request):
    return render(request, 'leaderboard.html')

def register_view(request):
    error =""
    if request.method == "POST":
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            try:
                data = form.cleaned_data

                #check for duplicate username
                usern = Accounts.objects.filter(username = data['username'].lower())
                if usern.count():
                    error = "Username already exists"
                    form = UserRegistrationForm()
                    return render(request, "register.html", {"form": form, "error": error})

                #check for duplicate emails
                email = Accounts.objects.filter(emailAddress = data['emailAddress'].lower())
                if email.count():
                    error = "Email already registered"
                    form = UserRegistrationForm()
                    return render(request, "register.html", {"form": form, "error": error})

                #check if passwords match
                if data['password1'] != data['password2']:
                    error = "Passwords don't match"
                    form = UserRegistrationForm()
                    return render(request, "register.html", {"form": form, "error": error})
                
                #add user to database
                if error == "":
                    try:
                        newuser = Accounts.objects.create(username=data['username'].lower(), emailAddress=data['emailAddress'].lower(), firstName=data['firstName'], lastName=data['lastName'], battlePass=data['battlePass'])
                        newuser.password = make_password(data['password2'])
                        newuser.save()
                        return redirect("/")
                    except Exception as e:
                        print(e)
            except Exception as e:
                print(e)
                
    form = UserRegistrationForm()
    return render(request, "register.html", {"form": form, "error": error})