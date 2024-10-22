from django.shortcuts import render, redirect
from .models import Account, Statistics
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
            except Exception as e:
                print(e)
            
                
    form = UserRegistrationForm()
    return render(request, "register.html", {"form": form, "error": error})

# function to use Wonderwords to generate sentences of random words
@csrf_exempt
def generateSentences(request):

    # other option, instead of just generating random words, generate a bunch of sentences

    # for easiest difficulty level, use bare_bone_with_adjectives
    # for medium difficulty level, use sentence
    if request.method == 'POST':

        difficulty = json.loads(request.body).get('difficulty','easy')

    s = RandomSentence()
    time = 5       # get this val passed in based on timer selected in game

    numWords = (time / 60.0) * 150
    numSentences = math.ceil(numWords / 4.0)
    if difficulty.lower() == 'easy':
        sentences = [s.bare_bone_with_adjective() for _ in range(numSentences)]

        # for easy, no capitalization or punctuation?

        # remove capitalization and punctuation
        for i in range(len(sentences)):
            sentences[i] = sentences[i][:-1].lower()
            
        text = ' '.join(random.sample(sentences,k=numSentences))
    elif difficulty.lower() == 'medium':
        sentences = [s.sentence() for _ in range(numSentences)]
        text = ' '.join(random.sample(sentences,k=numSentences))
    elif difficulty.lower() == 'hard':
        
        
        sentences = [s.sentence() for _ in range(numSentences)]
        text = ' '.join(random.sample(sentences,k=numSentences))

        # randomly capitalize letters in the sentence
        textLen = len(text)
        randomIndices = random.sample(range(0,textLen),textLen//3)

       
        newText = ''
        for i in range(len(text)):
            if i in randomIndices:
                newText += text[i].upper()
            else:
                newText += text[i]
        # vary the punctuation characters
        text = ''
        hyphen = False
        puncChars = ['.','?','!',',',':',';',':','-']
        for i in range(len(newText)):
            if newText[i] == '.':
                punc = random.choice(puncChars)
                text += punc
                if punc == '-':
                    hyphen = True
            else:
                # remove space after hyphen to combine the words
                if hyphen:
                    hyphen = False 
                else:
                    text += newText[i]

            
    # return a JSON response that can be fetched by Phaser to get the words
    return JsonResponse({'text':text})
    
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