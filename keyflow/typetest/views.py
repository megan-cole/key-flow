from django.shortcuts import render, redirect
from .models import Accounts, Statistics
from .forms import UserRegistrationForm
from django.contrib.auth.hashers import make_password
from wonderwords import RandomWord
from django.http import JsonResponse
import random
import json
import math
from django.views.decorators.csrf import csrf_exempt

def index(request):
    return render(request, 'index.html')

def typetest(request):
    return render(request, 'typetest.html')

def profile(request):
    return render(request, 'profile.html')

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

# function to use Wonderwords to generate sentences of random words
def generateSentences(request):

    ''' 
    right now, for the basic version, just going to generate a list of random words
    with no conditions for the words to put in sentences for the user to type
    '''

    r = RandomWord()

    # generate a list of 200 random words
    words = r.random_words(200)

    # make a string of numWords space separated randomly generated words
    numWords = 10
    sentence = ' '.join(random.choices(words,k=numWords))
    
        
    # return a JSON response that can be fetched by Phaser to get the words
    return JsonResponse({'sentence': sentence})
    
# function to retrieve the statistics from game.js that should be passed
# whenever a game has ended
@csrf_exempt
def getStatistics(request):


    if request.method == 'POST':

        # parse json into dictionary
        data = json.loads(request.body)

        # this line might not be right, have to see if its getting user
        user = request.user

        # get data from game
        wpm = data.get('wpm')
        lettersMissed = data.get('lettersMissed')

        # get sentence so we know the letter frequency
        sentence = data.get('sentence')
   
        accuracy = 0

        # accuracy is the # of letters missed // of num letters in sentence
        numLettersMissed = sum(lettersMissed.values())
        numLetters = len(sentence) - sentence.count(' ')
        accuracy = ((numLetters-numLettersMissed) / float(numLetters)) * 100

        # if user is an anonymous user (not logged in) don't save their stats
        if request.user.is_authenticated:

            # calculate wpm, accuracy, and letters missed and store in database
            
            
            '''
            Statistics.objects.create(
                user=user,
                wpm = wpm,
                accuracy = accuracy,
                lettersMissed = lettersMissed
            )
            '''
        
        return JsonResponse({'success':True})

    return JsonResponse({'success':False})