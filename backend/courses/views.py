om rest_framework import viewsets, status
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
``
