om django.db import models
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
``
