from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.index, name='index'),
    path('typetest/', views.typetest, name='typetest'),
    path('register/', views.register_view, name='register'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('generateSentences/',views.generateSentences,name='generateSentences'),
    path('getStatistics/',views.getStatistics,name='getStatistics')
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)