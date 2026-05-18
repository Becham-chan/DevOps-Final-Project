om django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from courses.views import CourseViewSet, EnrollmentViewSet, LessonProgressViewSet
from exams.views import ExamViewSet, AttemptViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'lesson-progress', LessonProgressViewSet, basename='lesson-progress')
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'attempts', AttemptViewSet, basename='attempt')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]
``
