from django.db import models
from django.urls import reverse
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.conf import settings

class UserManager(BaseUserManager):
    def create_user(self, username, firstName, lastName, emailAddress, battlePass, profilePicture=None, password=None):
        """
        Creates and saves a User with the given email, date of
        birth and password.
        """
        if not username:
            raise ValueError("Users must have a username")

        user = self.model(
            username=username,
            firstName=firstName,
            lastName=lastName,
            emailAddress=emailAddress,
            battlePass=battlePass,
            profilePicture=profilePicture
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

    def create_superuser(self, username, firstName="Megan", lastName="Cole", emailAddress="fakeemail2@gmail.com", battlePass=False, profilePicture=None, password=None):
        """
        Creates and saves a superuser with the given email, date of
        birth and password.
        """
        user = self.create_user(
            username,
            firstName = firstName,
            lastName = lastName,
            emailAddress = emailAddress,
            battlePass = battlePass,
            profilePicture = profilePicture,
            password = password
        )
        user.is_admin = True
        user.is_staff = True
        user.save(using=self._db)
        return user

class Accounts(models.Model):
    username = models.CharField(max_length=64)
    firstName = models.CharField(max_length=32)
    lastName = models.CharField(max_length=32)
    password = models.CharField(max_length=256)
    emailAddress = models.EmailField(max_length=64)
    battlePass = models.BooleanField(default=False)
    profilePicture = models.ImageField(upload_to='images/', null=True, blank=True)

    

class CustomUser(AbstractBaseUser):
    username = models.CharField(max_length=64, unique=True)
    firstName = models.CharField(max_length=32)
    lastName = models.CharField(max_length=32)
    password = models.CharField(max_length=256)
    emailAddress = models.EmailField(max_length=64, unique=True)
    battlePass = models.BooleanField(default=False)
    profilePicture = models.ImageField(upload_to='images/', null=True, blank=True)

    USERNAME_FIELD = "username"
    objects = UserManager()
    is_staff = models.BooleanField( default=False)

    def has_module_perms(self, app_label):
        return self.is_staff

    def has_perm(self, app_label):
        return self.is_staff

# Table that stores information about users stats on different modes
class Statistics(models.Model):
    username = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    gameMode = models.CharField(max_length=64)
    wpm = models.PositiveIntegerField()
    accuracy = models.PositiveIntegerField()
    # letters missed is a dictionary that will contain (missed letters : frequency)
    lettersMissed = models.JSONField(default=dict,blank=True)  
    
