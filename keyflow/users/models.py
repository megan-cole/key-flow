from django.db import models


# Table that stores information about user accounts.
class Accounts(models.Model):
    username = models.CharField(max_length=64)
    firstName = models.CharField(max_length=32)
    lastName = models.CharField(max_length=32)
    password = models.CharField(max_length=64)
    emailAddress = models.EmailField(max_length=64)
    battlePass = models.BooleanField(default=False)

'''
 demonstration how to add an account to the Accounts table
 user = Accounts.objects.create(
        username='megan',firstName='Megan',
        lastName='Cole',password='password',
        emailAddress='hi@gmail.com')
'''