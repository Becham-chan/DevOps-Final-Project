# Backend Models Implementation Guide

## Django Models (config/models.py or separate app files)

### courses/models.py
```python
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Course(models.Model):
    """Course model representing a learning course"""
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    CATEGORY_CHOICES = [
        ('python', 'Python'),
        ('web_dev', 'Web Development'),
        ('devops', 'DevOps'),
        ('data_science', 'Data Science'),
        ('cloud', 'Cloud Computing'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    duration_hours = models.IntegerField()
    instructor_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'level']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def lesson_count(self):
        return self.lessons.count()
    
    @property
    def enrollment_count(self):
        return self.enrollments.count()


class Lesson(models.Model):
    """Lesson model representing individual lessons within a course"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    content = models.TextField()  # Rich text content (HTML/Markdown)
    order = models.IntegerField()  # Lesson sequence
    estimated_reading_time = models.IntegerField()  # in minutes
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order']
        unique_together = ['course', 'order']
        indexes = [
            models.Index(fields=['course', 'order']),
        ]
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Enrollment(models.Model):
    """Enrollment model tracking user enrollment in courses"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    progress_percentage = models.IntegerField(default=0)  # 0-100
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'course']
        indexes = [
            models.Index(fields=['user', 'course']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.course.title}"
    
    def save(self, *args, **kwargs):
        if self.progress_percentage >= 100 and not self.is_completed:
            self.is_completed = True
            self.completed_at = timezone.now()
        super().save(*args, **kwargs)


class LessonProgress(models.Model):
    """Track individual lesson reading progress"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'lesson']
    
    def __str__(self):
        return f"{self.user.username} - {self.lesson.title}"
```

### exams/models.py
```python
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from courses.models import Course


class Exam(models.Model):
    """Exam model representing assessments for courses"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='exams')
    title = models.CharField(max_length=255)
    description = models.TextField()
    pass_score = models.IntegerField(
        default=70,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )  # Pass percentage
    time_limit_minutes = models.IntegerField(default=60)  # Exam duration
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"
    
    @property
    def question_count(self):
        return self.questions.count()


class Question(models.Model):
    """Question model representing exam questions"""
    QUESTION_TYPES = [
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
    ]
    
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    order = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order']
        unique_together = ['exam', 'order']
    
    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}"


class Answer(models.Model):
    """Answer options for multiple choice and true/false questions"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    answer_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField()
    
    class Meta:
        ordering = ['order']
        unique_together = ['question', 'order']
    
    def __str__(self):
        return self.answer_text[:50]


class Attempt(models.Model):
    """Exam attempt model tracking user exam submissions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_attempts')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='attempts')
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    score = models.IntegerField(null=True, blank=True)  # Percentage (0-100)
    is_passed = models.BooleanField(null=True, blank=True)
    
    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['user', 'exam']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.exam.title}"
    
    def calculate_score(self):
        """Calculate score based on responses"""
        if not self.submitted_at:
            return None
        
        total_questions = self.exam.questions.count()
        if total_questions == 0:
            return 0
        
        correct_count = 0
        
        for response in self.responses.all():
            if response.question.question_type == 'short_answer':
                # For short answers, this would be manually graded
                continue
            
            if response.selected_answer:
                if response.selected_answer.is_correct:
                    correct_count += 1
        
        # Calculate percentage
        score = (correct_count / total_questions) * 100
        return int(score)
    
    def finalize(self):
        """Finalize the attempt after submission"""
        self.submitted_at = timezone.now()
        self.score = self.calculate_score()
        self.is_passed = self.score >= self.exam.pass_score if self.score else False
        self.save()


class Response(models.Model):
    """Individual question response within an attempt"""
    attempt = models.ForeignKey(Attempt, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answer = models.ForeignKey(
        Answer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='responses'
    )
    user_answer_text = models.TextField(null=True, blank=True)  # For short answers
    
    class Meta:
        unique_together = ['attempt', 'question']
    
    def __str__(self):
        return f"Response: {self.attempt} - Q{self.question.order}"
```

### users/models.py (Custom User Extension - Optional)
```python
from django.db import models
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
```

---

## Serializers (DRF)

### courses/serializers.py
```python
from rest_framework import serializers
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
```

### exams/serializers.py
```python
from rest_framework import serializers
from .models import Exam, Question, Answer, Attempt, Response


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'answer_text', 'order']  # Don't expose is_correct yet


class AnswerDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'answer_text', 'is_correct', 'order']


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'order', 'answers']


class QuestionDetailSerializer(serializers.ModelSerializer):
    answers = AnswerDetailSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'order', 'answers']


class ExamListSerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Exam
        fields = ['id', 'course', 'title', 'description', 'pass_score', 
                  'time_limit_minutes', 'question_count', 'created_at']


class ExamDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Exam
        fields = ['id', 'course', 'title', 'description', 'pass_score',
                  'time_limit_minutes', 'questions', 'question_count', 'created_at']


class ResponseSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    
    class Meta:
        model = Response
        fields = ['id', 'question', 'question_text', 'selected_answer', 'user_answer_text']


class AttemptSubmitSerializer(serializers.Serializer):
    """Serializer for submitting exam responses"""
    responses = ResponseSerializer(many=True)
    
    def create(self, validated_data):
        pass


class AttemptDetailSerializer(serializers.ModelSerializer):
    responses = ResponseSerializer(many=True, read_only=True)
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    
    class Meta:
        model = Attempt
        fields = ['id', 'exam', 'exam_title', 'started_at', 'submitted_at', 
                  'score', 'is_passed', 'responses']


class AttemptListSerializer(serializers.ModelSerializer):
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    course_title = serializers.CharField(source='exam.course.title', read_only=True)
    
    class Meta:
        model = Attempt
        fields = ['id', 'exam', 'exam_title', 'course_title', 'started_at', 
                  'submitted_at', 'score', 'is_passed']
```

---

## Views (DRF ViewSets)

### courses/views.py
```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Course, Lesson, Enrollment, LessonProgress
from .serializers import (CourseListSerializer, CourseDetailSerializer,
                          EnrollmentSerializer, LessonProgressSerializer, LessonSerializer)


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer
    
    @action(detail=True, methods=['get'])
    def lessons(self, request, pk=None):
        """Get all lessons for a course"""
        course = self.get_object()
        lessons = course.lessons.all()
        serializer = LessonSerializer(lessons, many=True)
        return Response(serializer.data)


class EnrollmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EnrollmentSerializer
    
    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Enroll user in a course"""
        course_id = request.data.get('course_id')
        
        # Check if already enrolled
        if Enrollment.objects.filter(user=request.user, course_id=course_id).exists():
            return Response({'error': 'Already enrolled'}, status=status.HTTP_400_BAD_REQUEST)
        
        enrollment = Enrollment.objects.create(user=request.user, course_id=course_id)
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Get enrollment progress details"""
        enrollment = self.get_object()
        lessons = enrollment.course.lessons.count()
        read_lessons = LessonProgress.objects.filter(
            user=request.user,
            lesson__course=enrollment.course,
            is_read=True
        ).count()
        
        progress = (read_lessons / lessons * 100) if lessons > 0 else 0
        
        return Response({
            'enrollment_id': enrollment.id,
            'total_lessons': lessons,
            'completed_lessons': read_lessons,
            'progress_percentage': int(progress),
            'is_completed': enrollment.is_completed
        })


class LessonProgressViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = LessonProgressSerializer
    
    def get_queryset(self):
        return LessonProgress.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Mark lesson as read"""
        lesson_id = request.data.get('lesson_id')
        progress, created = LessonProgress.objects.get_or_create(
            user=request.user,
            lesson_id=lesson_id
        )
        progress.is_read = True
        progress.read_at = timezone.now()
        progress.save()
        
        serializer = self.get_serializer(progress)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

### exams/views.py
```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Exam, Attempt, Response as ExamResponse
from .serializers import (ExamListSerializer, ExamDetailSerializer,
                          AttemptDetailSerializer, AttemptListSerializer)


class ExamViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ExamDetailSerializer
        return ExamListSerializer
    
    def get_queryset(self):
        """Return only exams for courses user is enrolled in"""
        user_enrollments = self.request.user.enrollments.values_list('course_id', flat=True)
        return Exam.objects.filter(course_id__in=user_enrollments)


class AttemptViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'list']:
            return AttemptListSerializer if self.action == 'list' else AttemptDetailSerializer
        return AttemptListSerializer
    
    def get_queryset(self):
        return Attempt.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Start a new exam attempt"""
        exam_id = request.data.get('exam_id')
        
        # Create new attempt
        attempt = Attempt.objects.create(user=request.user, exam_id=exam_id)
        
        # Create empty responses for each question
        exam = attempt.exam
        for question in exam.questions.all():
            ExamResponse.objects.create(attempt=attempt, question=question)
        
        serializer = AttemptDetailSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit exam responses"""
        attempt = self.get_object()
        
        if attempt.submitted_at:
            return Response({'error': 'Already submitted'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update responses
        responses_data = request.data.get('responses', [])
        for response_data in responses_data:
            response = ExamResponse.objects.get(
                id=response_data.get('id'),
                attempt=attempt
            )
            if response_data.get('selected_answer_id'):
                response.selected_answer_id = response_data.get('selected_answer_id')
            if response_data.get('user_answer_text'):
                response.user_answer_text = response_data.get('user_answer_text')
            response.save()
        
        # Finalize attempt
        attempt.finalize()
        
        serializer = AttemptDetailSerializer(attempt)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get exam results (only after submission)"""
        attempt = self.get_object()
        
        if not attempt.submitted_at:
            return Response({'error': 'Exam not submitted'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = AttemptDetailSerializer(attempt)
        return Response(serializer.data)
```

---

## Management Commands

### create_mock_data.py (management/commands/)
```python
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from courses.models import Course, Lesson
from exams.models import Exam, Question, Answer


class Command(BaseCommand):
    help = 'Populate database with mock data'
    
    def handle(self, *args, **options):
        # Clear existing data
        Course.objects.all().delete()
        User.objects.filter(username__startswith='student').delete()
        
        # Create sample courses
        courses_data = [
            {
                'title': 'Python Fundamentals',
                'description': 'Learn Python from scratch including variables, loops, functions...',
                'category': 'python',
                'level': 'beginner',
                'duration_hours': 40,
                'instructor_name': 'John Doe',
                'lessons': [
                    {'title': 'Getting Started with Python', 'content': 'Introduction...', 'time': 30},
                    {'title': 'Variables and Data Types', 'content': 'Variables in Python...', 'time': 45},
                    {'title': 'Control Flow', 'content': 'If statements and loops...', 'time': 50},
                ]
            },
            # ... more courses
        ]
        
        for course_data in courses_data:
            lessons = course_data.pop('lessons')
            course = Course.objects.create(**course_data)
            
            for i, lesson_data in enumerate(lessons):
                Lesson.objects.create(
                    course=course,
                    order=i+1,
                    estimated_reading_time=lesson_data['time'],
                    title=lesson_data['title'],
                    content=lesson_data['content']
                )
        
        # Create sample users
        for i in range(1, 4):
            User.objects.create_user(
                username=f'student{i}',
                email=f'student{i}@example.com',
                password='testpass123'
            )
        
        self.stdout.write(self.style.SUCCESS('Mock data created successfully'))
```

