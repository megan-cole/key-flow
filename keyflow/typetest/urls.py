from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('typetest/', views.typetest, name='typetest'),
    path('register/', views.register_view, name='register'),
    path('leaderboard/', views.leaderboard, name='leaderboard')
]