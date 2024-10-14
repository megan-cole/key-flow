from django.shortcuts import render, redirect
from .models import Accounts, Statistics
from .forms import UserRegistrationForm
from django.contrib.auth.hashers import make_password
from wonderwords import RandomWord, RandomSentence
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
                newuser = form.save()
                return redirect("/")
                '''
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
                if data['password'] != data['password2']:
                    error = "Passwords don't match"
                    form = UserRegistrationForm()
                    return render(request, "register.html", {"form": form, "error": error})
                
                #add user to database
                if error == "":
                    try:
                        newuser = Accounts.objects.create_user(username=data['username'].lower(), emailAddress=data['emailAddress'].lower(), password=data['password'], firstName=data['firstName'], lastName=data['lastName'], battlePass=data['battlePass'])
                        newuser.save()
                        return redirect("/")
                    except Exception as e:
                        print("the exception is:", e)
            '''
            except Exception as e:
                print(e)
            
                
    form = UserRegistrationForm()
    return render(request, "register.html", {"form": form, "error": error})

# function to use Wonderwords to generate sentences of random words
def generateSentences(request):

    ''' 
    right now, for the basic version, just going to generate a list of random words
    with no conditions for the words to put in sentences for the user to type
    

    r = RandomWord()

    # parameterize words generated with these variables, change based on 
    # difficulty levels
    minLength = 2
    maxLength = 10

    # generate a list of 200 random words
    words = r.random_words(200,word_min_length=minLength,word_max_length=maxLength)


    # make a string of numWords space separated randomly generated words
    numWords = 10
    sentence = ' '.join(random.sample(words,k=numWords))
    '''

    # other option, instead of just generating random words, generate a bunch of sentences

    # for easiest difficulty level, use bare_bone_with_adjectives
    # for medium difficulty level, use sentence

    s = RandomSentence()
    easy, medium, hard = True, False, False # get these vals passed in
    time = 30       # get this val passed in based on timer selected in game

    numWords = (time / 60.0) * 150
    numSentences = math.ceil(numWords / 4.0)
    if easy:
        sentences = [s.bare_bone_with_adjective() for _ in range(numSentences)]

        # for easy, no capitalization or punctuation?

        # remove capitalization and punctuation
        for i in range(len(sentences)):
            sentences[i] = sentences[i][:-1].lower()
            
        text = ' '.join(random.sample(sentences,k=numSentences))
    elif medium:
        sentences = [s.sentence() for _ in range(numSentences)]
        text = ' '.join(random.sample(sentences,k=numSentences))
        
    # return a JSON response that can be fetched by Phaser to get the words
    return JsonResponse({'text': text})
    
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

            # store data from only previous 10 attempts, so if there are more 
            # than 10 records for this user, remove the earliest one
            userRecords = Statistics.objects.filter(username=user,gameMode='basic')
            numRecords = userRecords.count()

            # if more than 10 records, delete earliest record
            if numRecords >= 10:
                earliestRecord = userRecords.order_by('id').first()
                earliestRecord.delete()

            # store data in database for user
            try:
                Statistics.objects.create(
                    username = user,
                    gameMode = 'basic',
                    wpm = wpm,
                    accuracy = accuracy,
                    lettersMissed = lettersMissed
                )
            except Exception as e:
                print('error', e)

        
        return JsonResponse({'success':True})

    return JsonResponse({'success':False})