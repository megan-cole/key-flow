from django.shortcuts import render

# Create your views here.

def typetest(request):
    return render(request, 'index.html')