from django.contrib import admin
from .models import Statistics
from .models import Accounts, CustomUser
from .forms import UserRegistrationForm

# be able to check database through http://127.0.0.1:8000/admin 
admin.site.register(Statistics)
admin.site.register(Accounts)
admin.site.register(CustomUser)
