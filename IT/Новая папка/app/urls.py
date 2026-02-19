from django.urls import path
from . import views

urlpatterns = [
    path('', views.angry_birds, name='angry_birds'),
]
