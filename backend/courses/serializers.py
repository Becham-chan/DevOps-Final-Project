"""Serializers for the courses app."""

from rest_framework import serializers
from .models import Course, Lesson, Enrollment, LessonProgress


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'order', 'estimated_reading_time', 'created_at']


class CourseListSerializer(serializers.ModelSerializer):
    lesson_count = serializers.SerializerMethodField()
    enrollment_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'category', 'level',
            'duration_hours', 'instructor_name', 'lesson_count',
            'enrollment_count', 'created_at'
        ]

    def get_lesson_count(self, obj):
        return obj.lesson_count

    def get_enrollment_count(self, obj):
        return obj.enrollment_count


class CourseDetailSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    lesson_count = serializers.SerializerMethodField()
    enrollment_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'category', 'level',
            'duration_hours', 'instructor_name', 'lessons',
            'lesson_count', 'enrollment_count', 'created_at', 'updated_at'
        ]

    def get_lesson_count(self, obj):
        return obj.lesson_count

    def get_enrollment_count(self, obj):
        return obj.enrollment_count


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_detail = CourseListSerializer(source='course', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'course', 'course_title', 'course_detail',
            'enrolled_at', 'progress_percentage', 'is_completed', 'completed_at'
        ]
        read_only_fields = ['enrolled_at', 'progress_percentage', 'is_completed', 'completed_at']


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = LessonProgress
        fields = ['id', 'lesson', 'lesson_title', 'is_read', 'read_at']
