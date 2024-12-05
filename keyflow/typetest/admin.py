from django.contrib import admin
from .models import Account, Statistics, MinigameStatistics, EquippedItems
from .forms import UserRegistrationForm

# be able to check database through http://127.0.0.1:8000/admin 
admin.site.register(Statistics)
admin.site.register(Account)
admin.site.register(MinigameStatistics)
admin.site.register(EquippedItems)