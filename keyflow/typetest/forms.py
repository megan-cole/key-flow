from django import forms  
from django.contrib.auth.models import User  
from django.contrib.auth.forms import UserCreationForm  
from django.core.exceptions import ValidationError  
from django.forms.fields import EmailField 
from django.forms import ModelForm 
from django.forms.forms import Form 
from .models import Account

class UserRegistrationForm(UserCreationForm):
    #form fields
    class Meta(UserCreationForm.Meta):
            model = Account
            emailAddress = forms.EmailField(label="Email", max_length=64)
            firstName = forms.CharField(label="First Name", max_length=32)
            lastName = forms.CharField(label="Last Name", max_length=32) 
            fields = UserCreationForm.Meta.fields + ("emailAddress", "firstName", "lastName")

class MonetaryTransctionForm(Form):
    coupon_code = forms.CharField(label="Coupon Code", max_length=10)
    
    
    
         