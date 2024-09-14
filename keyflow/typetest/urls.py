from django.urls import path
from . import views

urlpatterns = [
    path('typetest/', views.typetest, name='typetest'),
]