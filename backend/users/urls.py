"""URL configuration for the users app."""

from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='auth-register'),
    path('login/', views.login, name='auth-login'),
    path('user/', views.get_user, name='auth-user'),
    path('logout/', views.logout, name='auth-logout'),
]
