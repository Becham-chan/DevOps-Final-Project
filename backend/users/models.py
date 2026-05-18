om django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """Extended user profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    avatar = models.URLField(blank=True)
    total_courses = models.IntegerField(default=0)
    total_exams_taken = models.IntegerField(default=0)
    average_score = models.FloatField(default=0.0)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
``
