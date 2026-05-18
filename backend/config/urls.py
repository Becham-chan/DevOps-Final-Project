"""URL configuration for Course Learning Platform."""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({'status': 'healthy', 'service': 'course-learning-platform'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check),
    path('api/auth/', include('users.urls')),
    path('api/', include('courses.urls')),
    path('api/', include('exams.urls')),
]
