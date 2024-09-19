from django import forms  
from django.contrib.auth.models import User  
from django.contrib.auth.forms import UserCreationForm  
from django.core.exceptions import ValidationError  
from django.forms.fields import EmailField  
from django.forms.forms import Form  

class UserRegistrationForm(UserCreationForm):

    #form fields
    username = forms.CharField(label="Username", max_length=64)
    emailAddress = forms.EmailField(label="Email", max_length=64)
    firstName = forms.CharField(label="First Name", max_length=32)
    lastName = forms.CharField(label="Last Name", max_length=32)
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)  
    password2 = forms.CharField(label='Confirm password', widget=forms.PasswordInput)
    battlePass = forms.BooleanField(label="BattlePass", required=False)

    #function to check if username already exists
    def username_clean(self):  
        username = self.cleaned_data['username'].lower()  
        new = User.objects.filter(username = username)  
        if new.count():  
            raise ValidationError("User Already Exist")  
        return username  
  
    #function to check if email already exists
    def email_clean(self):  
        email = self.cleaned_data['email'].lower()  
        new = User.objects.filter(email=email)  
        if new.count():  
            raise ValidationError(" Email Already Exist")  
        return email  
  
    #function to test if passwords match
    def password_clean(self):  
        password1 = self.cleaned_data['password1']  
        password2 = self.cleaned_data['password2']  
  
        if password1 and password2 and password1 != password2:  
            raise ValidationError("Password don't match")  
        return password2 

    def save(self, commit = True): 
        username = username_clean()
        emailAddress = email_clean()
        password2 = clean_password()
        user = Accounts(username=username, firstName=fistName, lastName=lastName, password=password2, emailAddress=emailAddress, battlePass=battlePass)  
        return user 