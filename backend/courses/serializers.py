om rest_framework import serializers
from django.contrib.auth.models import User
from .models import Course, Lesson, Enrollment, LessonProgress


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'order', 'estimated_reading_time', 'created_at']


class CourseListSerializer(serializers.ModelSerializer):
    lesson_count = serializers.IntegerField(read_only=True)
    enrollment_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'level', 'duration_hours', 
                  'instructor_name', 'lesson_count', 'enrollment_count', 'created_at']


class CourseDetailSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    lesson_count = serializers.IntegerField(read_only=True)
    enrollment_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'level', 'duration_hours',
                  'instructor_name', 'lessons', 'lesson_count', 'enrollment_count', 
                  'created_at', 'updated_at']


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_detail = CourseListSerializer(source='course', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_title', 'course_detail', 'enrolled_at', 
                  'progress_percentage', 'is_completed', 'completed_at']


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    
    class Meta:
        model = LessonProgress
        fields = ['id', 'lesson', 'lesson_title', 'is_read', 'read_at']
``
