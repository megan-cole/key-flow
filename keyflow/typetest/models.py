from django.db import models
from django.urls import reverse

class Accounts(models.Model):
    username = models.CharField(max_length=64)
    firstName = models.CharField(max_length=32)
    lastName = models.CharField(max_length=32)
    password = models.CharField(max_length=256)
    emailAddress = models.EmailField(max_length=64)
    battlePass = models.BooleanField(default=False)
    profilePicture = models.ImageField(upload_to='images/', null=True, blank=True)

# Table that stores information about users stats on different modes
class Statistics(models.Model):
    username = models.ForeignKey(Accounts,on_delete=models.CASCADE)
    gameMode = models.CharField(max_length=64)
    wpm = models.PositiveIntegerField()
    accuracy = models.PositiveIntegerField()
    # letters missed is a dictionary that will contain (missed letters : frequency)
    lettersMissed = models.JSONField(default=dict,blank=True)  
    
