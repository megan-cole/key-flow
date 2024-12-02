from django.shortcuts import render, redirect
from .models import Account, Statistics, MinigameStatistics
from .forms import UserRegistrationForm
from django.contrib.auth.hashers import make_password
from wonderwords import RandomWord, RandomSentence
from django.http import JsonResponse
import random
import json
import math
from django.views.decorators.csrf import csrf_exempt
from django.template.loader import render_to_string
import logging

def index(request):
    data = {}
    if request.user.is_authenticated:
        user = request.user

        # get the list of all this user's statistics
        userRecords = Statistics.objects.filter(username=user,gameMode='basic')
        userRecords = userRecords.values()

        wpm = []
        accuracy = []
        lettersMissed = {}

        # go through all the records
        for record in userRecords:
            wpm.append(record['wpm'])
            accuracy.append(record['accuracy'])
            
            for letter in record['lettersMissed']:
                lettersMissed[letter] = record['lettersMissed'][letter] + lettersMissed.get(letter,0)

        # sort lettersMissed to get top 5 missed letters
        lettersMissed = dict(sorted(lettersMissed.items(),key=lambda x : x[1],reverse=True))
        lettersMissed = dict(list(lettersMissed.items())[0:5])

        # use this dictionary to store the data that I want to send back to the profile page
        data['avgWPM'] = int((sum(wpm) / len(wpm))) if wpm else 0
        data['accuracy'] = int((sum(accuracy) / len(accuracy))) if accuracy else 0
        data['lettersMissed'] = list(lettersMissed.keys())


    return render(request, 'index.html',data)

def typetest(request):
    return render(request, 'typetest.html')

def snowfall(request):
    return render(request, 'snowfall.html')

def minigames(request):
    return render(request, 'minigames.html')

def obstacles(request):
    return render(request, 'obstacle.html')

def profile(request):
    
    user = request.user

    # get the list of all this user's statistics
    userRecords = Statistics.objects.filter(username=user,gameMode='basic')
    userRecords = userRecords.values()

    wpm = []
    accuracy = []
    lettersMissed = {}

    # go through all the records
    for record in userRecords:
        wpm.append(record['wpm'])
        accuracy.append(record['accuracy'])
        
        for letter in record['lettersMissed']:
            lettersMissed[letter] = record['lettersMissed'][letter] + lettersMissed.get(letter,0)

    # sort lettersMissed to get top 5 missed letters
    lettersMissed = dict(sorted(lettersMissed.items(),key=lambda x : x[1],reverse=True))
    lettersMissed = dict(list(lettersMissed.items())[0:5])

    # use this dictionary to store the data that I want to send back to the profile page
    data = {}
    data['avgWPM'] = int((sum(wpm) / len(wpm))) if wpm else 0
    data['accuracy'] = int((sum(accuracy) / len(accuracy))) if accuracy else 0
    data['lettersMissed'] = list(lettersMissed.keys())


    return render(request, 'profile.html',data)


def leaderboard(request,minigame='Minigame'):

    # parse json into dictionary
    try:
        statistics = []

        if minigame != 'Snowfall' and minigame != 'Minigame' and minigame != 'Obstacle':
            return redirect('leaderboard')
        
        if minigame == 'Snowfall':
                
            # get top 10 statistics from snowfall
            statistics = list(MinigameStatistics.objects.filter(snowFallHighScore__gt=0).order_by('-snowFallHighScore').values('username__username','snowFallHighScore')[:10])
        elif minigame == 'Obstacle':
            statistics = list(MinigameStatistics.objects.filter(obstacleBestTime__gt=0).order_by('-obstacleBestTime').values('username__username','obstacleBestTime')[:10])

    except Exception as e:
        print('error',e)
    return render(request,'leaderboard.html',{'statistics':statistics,'minigame':minigame})




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

# function to use Wonderwords to generate a bank of random words
def generateWordBank(request):
    if request.method == 'POST':
        r = RandomWord()
        wordbank = []
        #generate 100 random words

        loop = True
        while loop:
            for _ in range(100):
                wordbank.append(r.word().lower())
            #print(wordbank)
            for word in wordbank:
                if len(word) > 10 or "-" in word or " " in word:
                    #print(word)
                    wordbank.remove(word)
            if len(wordbank) >= 45:
                loop = False

        #print(wordbank)
        # return a JSON response that can be fetched by Phaser to get the words
        return JsonResponse({'words': wordbank})

# function to use Wonderwords to generate sentences of random words
def generateSentences(request):

    # other option, instead of just generating random words, generate a bunch of sentences

    # for easiest difficulty level, use bare_bone_with_adjectives
    # for medium difficulty level, use sentence
    if request.method == 'POST':

        difficulty = json.loads(request.body).get('difficulty','normal')
        timer = json.loads(request.body).get('timer','30s')

    s = RandomSentence()
    time = int(timer)

    numWords = (time / 60.0) * 150
    numSentences = math.ceil(numWords / 4.0)
    if difficulty.lower() == 'normal':
        sentences = [s.bare_bone_with_adjective() for _ in range(numSentences)]

        # remove capitalization and punctuation
        for i in range(len(sentences)):
            sentences[i] = sentences[i][:-1].lower()
            
        text = ' '.join(random.sample(sentences,k=numSentences))
    elif difficulty.lower() == 'hard':
        sentences = [s.sentence() for _ in range(numSentences)]
        text = ' '.join(random.sample(sentences,k=numSentences))
    elif difficulty.lower() == 'crazy':
        
        
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

logger = logging.getLogger(__name__)

def personalizedSentences(request):
    logger.info("Received request at /personalizedSentences/")
    if request.method == 'POST':
        logger.info("Request method is POST.")
        user = request.user

        # Check if user is authenticated
        if not user.is_authenticated:
            logger.warning("Unauthorized access attempt.")
            return JsonResponse({'text': 'You must be logged in to generate personalized sentences.'})

        # Retrieve most missed letters
        userRecords = Statistics.objects.filter(username=user, gameMode='basic')
        logger.info(f"Retrieved {userRecords.count()} records for user: {user}.")

        lettersMissed = {}
        for record in userRecords:
            logger.debug(f"Processing record: {record}")
            for letter in record.lettersMissed:  # Assuming `lettersMissed` is a dictionary field
                lettersMissed[letter] = record.lettersMissed[letter] + lettersMissed.get(letter, 0)

        # Sort and get top 5 most missed letters
        lettersMissed = dict(sorted(lettersMissed.items(), key=lambda x: x[1], reverse=True))
        mostMissedLetters = list(lettersMissed.keys())[:5]
        logger.info(f"Top missed letters: {mostMissedLetters}")

        # Generate words that mostly contain the most missed letters
        r = RandomWord()
        wordbank = []
        for _ in range(100):  # Generate a pool of 100 random words
            word = r.word().lower()
            if any(letter in word for letter in mostMissedLetters):
                wordbank.append(word)

        logger.info(f"Initial word bank size: {len(wordbank)}")

        # Ensure at least 45 valid words in the word bank
        wordbank = [word for word in wordbank if len(word) <= 10 and "-" not in word and " " not in word]
        logger.info(f"Filtered word bank size: {len(wordbank)}")
        while len(wordbank) < 45:
            word = r.word().lower()
            if any(letter in word for letter in mostMissedLetters) and len(word) <= 10 and "-" not in word:
                wordbank.append(word)

        logger.info(f"Final word bank size: {len(wordbank)}")

        # Generate sentences using these words
        sentences = []
        for _ in range(10):  # Create 10 sentences
            sentence = ' '.join(random.choices(wordbank, k=random.randint(5, 10)))
            sentences.append(sentence)

        logger.info(f"Generated sentences: {sentences}")

        # Return sentences in JSON format
        return JsonResponse({'text': ' '.join(sentences)})

    logger.error("Request method is not POST.")
    return JsonResponse({'error': 'Invalid request method'}, status=400)
           
# function to retrieve the statistics from game.js that should be passed
# whenever a game has ended
def getStatistics(request):


    if request.method == 'POST':
        # parse json into dictionary
        data = json.loads(request.body)

        user = request.user

        # get data from game
        wpm = data.get('wpm')
        lettersMissed = data.get('lettersMissed')

        # get sentence so we know the letter frequency
        sentence = data.get('sentence')
        time = int(data.get('time'))
        diff = data.get('difficulty').lower()
        accuracy = 0
        # accuracy is the # of letters missed // of num letters in sentence
        numLettersMissed = sum(lettersMissed.values())
        numLetters = len(sentence) - sentence.count(' ')
        accuracy = ((numLetters-numLettersMissed) / float(numLetters)) * 100

        # if user is an anonymous user (not logged in) don't save their stats
        if request.user.is_authenticated:

            if time == 30:
                timemult = .5
            elif time == 60:
                timemult = 1
            else:
                timemult = 1.5

            if diff == "easy":
                diffmult = .5
            elif diff == "medium":
                diffmult = .7
            else:
                diffmult = .9
            
            xpToAdd = wpm * (accuracy/100) * diffmult * timemult

            user.xp += int(xpToAdd)
            user.save()
            check_level(user)
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

def getStatisticsSnowFall(request):


    if request.method == 'POST':

        # parse json into dictionary
        data = json.loads(request.body)

        user = request.user

        # get data from game
        score = data.get('score')
        diff = data.get('difficulty')

        # if user is an anonymous user (not logged in) don't save their stats
        if request.user.is_authenticated:

            if diff == 0:
                xpToAdd = (int(score / 100)) * 10
            elif diff == 1:
                xpToAdd = (int(score / 100)) * 15
            user.xp += xpToAdd
            user.save()
            check_level(user)
            userRecord = MinigameStatistics.objects.filter(username=user)
            if not userRecord:
                # store data in database for user
                try:
                    MinigameStatistics.objects.create(
                        username = user,
                        snowFallHighScore = score,
                        obstacleBestTime = 0
                    )
                except Exception as e:
                    print('error', e)
            elif score > userRecord.first().snowFallHighScore:
                userRecord = userRecord.first()
                try:
                    userRecord.snowFallHighScore = score
                    userRecord.save()
                except Exception as e:
                    print('error', e)

    
        return JsonResponse({'success':True})


    return JsonResponse({'success':False})

def getStatisticsObstacle(request):

    if request.method == 'POST':

        # parse json into dictionary
        data = json.loads(request.body)

        user = request.user

        # get data from game
        time = data.get('time')

        # if user is an anonymous user (not logged in) don't save their stats
        if request.user.is_authenticated:
            if time < 60:
                xpToAdd = time * (4/6)
            else:
                xpToAdd = 40 + (time-60)
            
            user.xp += int(xpToAdd)
            user.save()
            userRecord = MinigameStatistics.objects.filter(username=user)
            if not userRecord:
                # store data in database for user
                try:
                    MinigameStatistics.objects.create(
                        username=user,
                        snowFallHighScore = 0,
                        obstacleBestTime = time

                    )
                except Exception as e:
                    print('error', e)
            elif time> userRecord.first().obstacleBestTime:
                userRecord = userRecord.first()
                try:
                    userRecord.obstacleBestTime = time
                    userRecord.save()
                except Exception as e:
                    print('error', e)

    
        return JsonResponse({'success':True})


    return JsonResponse({'success':False})

def check_level(user):
    if user.xp >= 7500:
        user.level = 10
    elif user.xp >= 5100:
        user.level = 9
    elif user.xp >= 3400:
        user.level = 8
    elif user.xp >=2300:
        user.level = 7
    elif user.xp >= 1500:
        user.level = 6
    elif user.xp >= 1000:
        user.level = 5
    elif user.xp >= 675:
        user.level = 4
    elif user.xp >= 450:
        user.level = 3
    elif user.xp >= 300:
        user.level = 2
    elif user.xp >= 200:
        user.level = 1
    else:
        user.level = 0

    user.save()
