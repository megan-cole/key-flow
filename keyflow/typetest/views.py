from django.shortcuts import render
from .models import Accounts, Statistics

# Create your views here.

def typetest(request):
    return render(request, 'typetest.html')