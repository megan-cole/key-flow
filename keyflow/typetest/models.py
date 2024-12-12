from django.db import models
from django.urls import reverse
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.conf import settings

class UserManager(BaseUserManager):
    def create_user(self, username, firstName, lastName, emailAddress, battlePass, password=None):
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
            battlePass=battlePass
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

    def create_superuser(self, username, firstName="Megan", lastName="Cole", emailAddress="fakeemail2@gmail.com", battlePass=False, password=None):
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
            password = password
        )
        user.is_admin = True
        user.is_staff = True
        user.save(using=self._db)
        return user
   

class Account(AbstractBaseUser):
    username = models.CharField(max_length=64, unique=True)
    firstName = models.CharField(max_length=32)
    lastName = models.CharField(max_length=32)
    password = models.CharField(max_length=256)
    emailAddress = models.EmailField(max_length=64, unique=True)
    battlePass = models.BooleanField(default=False)
    level = models.IntegerField(default=0)
    xp = models.IntegerField(default=0)

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
    
class MinigameStatistics(models.Model):
    username = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    snowFallHighScore = models.PositiveIntegerField()
    obstacleBestTime = models.PositiveIntegerField()

class EquippedItems(models.Model):
    username = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    profilePicture = models.CharField(default="default")
    character = models.CharField(default="paul")
    snowSlopeAvatar = models.CharField(default="default")
    snowSlopeObstacle1 = models.BooleanField(default=False)
    snowSlopeObstacle2 = models.BooleanField(default=False)
    snowSlopeObstacle3 = models.BooleanField(default=False)
    snowFallBackground = models.CharField(default="default")