from django.db import models
from django.urls import reverse
from users.models import Accounts


# Table that stores information about users stats on different modes
class Statistics(models.Model):
    username = models.ForeignKey(Accounts,on_delete=models.CASCADE)
    gameMode = models.CharField(max_length=64)
    wpm = models.PositiveIntegerField()
    accuracy = models.PositiveIntegerField()
    # letters missed is a dictionary that will contain (missed letters : frequency)
    lettersMissed = models.JSONField(default=dict,blank=True)  
    
