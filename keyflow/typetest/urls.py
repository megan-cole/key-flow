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
    path('battlepass/', views.battlepass_view, name='battlepass'),
    path('equipitem/<str:itemName>/', views.equipitem, name='equipitem'),
    path('buyBP/', views.buy_battlepass_view, name='buyBP'),
    path('generateSentences/',views.generateSentences,name='generateSentences'),
    path('generateWordBank/', views.generateWordBank, name='generateWordBank'),
    path('getStatistics/',views.getStatistics,name='getStatistics'),
    path('getStatisticsSnowFall/',views.getStatisticsSnowFall,name='getStatisticsSnowFall'),
    path('getItemInfo/', views.getItemInfo, name='getItemInfo'),
    path('logout/', LogoutView.as_view(next_page='index'), name='logout'),
    path('snowfall/', views.snowfall, name='snowfall'),
    path('leaderboard/<str:minigame>/',views.leaderboard,name='minigameLeaderboard'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('minigames/',views.minigames,name='minigames'),
    path('obstacles/',views.obstacles,name='obstacles'),
    path('getStatisticsObstacle/',views.getStatisticsObstacle,name='getStatisticsObstacle'),
    path('personalizedSentences/',views.personalizedSentences,name='personalizedSentences')
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)