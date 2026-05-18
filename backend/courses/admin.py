"""Admin configuration for the courses app."""

from django.contrib import admin
from .models import Course, Lesson, Enrollment, LessonProgress


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ['title', 'order', 'estimated_reading_time']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'level', 'instructor_name', 'lesson_count', 'enrollment_count', 'created_at']
    list_filter = ['category', 'level']
    search_fields = ['title', 'instructor_name', 'description']
    inlines = [LessonInline]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'estimated_reading_time', 'created_at']
    list_filter = ['course']
    search_fields = ['title', 'course__title']
    ordering = ['course', 'order']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'progress_percentage', 'is_completed', 'enrolled_at']
    list_filter = ['is_completed', 'course']
    search_fields = ['user__username', 'course__title']
    readonly_fields = ['enrolled_at']


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'lesson', 'is_read', 'read_at']
    list_filter = ['is_read']
    search_fields = ['user__username', 'lesson__title']
