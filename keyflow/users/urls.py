from django.urls import path
from django.urls import include
from . import views

urlpatterns = [
    path('users/register', views.register_view, name='register'),
    path('', include('home.urls'))
]