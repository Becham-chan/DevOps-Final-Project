om django.contrib import admin
from .models import Course, Lesson, Enrollment, LessonProgress

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'level', 'duration_hours', 'lesson_count')
    list_filter = ('category', 'level', 'created_at')
    search_fields = ('title', 'description', 'instructor_name')
    ordering = ('-created_at',)

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'estimated_reading_time')
    list_filter = ('course', 'created_at')
    search_fields = ('title', 'content')
    ordering = ('course', 'order')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'progress_percentage', 'is_completed', 'enrolled_at')
    list_filter = ('is_completed', 'enrolled_at')
    search_fields = ('user__username', 'course__title')

@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'is_read', 'read_at')
    list_filter = ('is_read', 'read_at')
``
