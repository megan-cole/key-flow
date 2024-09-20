from django.shortcuts import render, redirect
from .models import Accounts, Statistics
from .forms import UserRegistrationForm
# Create your views here.

def index(request):
    return render(request, 'index.html')

def typetest(request):
    return render(request, 'typetest.html')

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
                    newuser = Accounts.objects.create(username=data['username'], emailAddress=data['emailAddress'], firstName=data['firstName'], lastName=data['lastName'], password=data['password2'], battlePass=data['battlePass'])
                    newuser.save()
                    return redirect("/")
            except Exception as e:
                print(e)
                
    form = UserRegistrationForm()
    return render(request, "register.html", {"form": form, "error": error})