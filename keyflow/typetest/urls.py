from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth.views import LogoutView



urlpatterns = [
    path('', views.index, name='index'),
    path('typetest/', views.typetest, name='typetest'),
    path('register/', views.register_view, name='register'),
    path('profile/', views.profile, name='profile'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('generateSentences/',views.generateSentences,name='generateSentences'),
    path('getStatistics/',views.getStatistics,name='getStatistics'),
    path('logout/', LogoutView.as_view(next_page='index'), name='logout'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)