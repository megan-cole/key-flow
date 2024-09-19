from django.shortcuts import render, redirect
from .models import Accounts, Statistics
from .forms import UserRegistrationForm
# Create your views here.

def index(request):
    return render(request, 'index.html')

def typetest(request):
    return render(request, 'typetest.html')

def register_view(request):
    if request.method == "POST":
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            try:
                data = form.cleaned_data
                newuser = Accounts.objects.create(username=data['username'], emailAddress=data['emailAddress'], firstName=data['firstName'], lastName=data['lastName'], password=['password2'], battlePass=data['battlePass'])
                newuser.save()
                return redirect("/")
            except Exception as e:
                print(e)
            #finally:
                
    form = UserRegistrationForm()
    return render(request, "register.html", {"form": form})