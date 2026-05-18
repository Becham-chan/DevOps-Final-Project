"""Views for the courses app."""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response as DRFResponse
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from .models import Course, Lesson, Enrollment, LessonProgress
from .serializers import (
    CourseListSerializer, CourseDetailSerializer,
    EnrollmentSerializer, LessonProgressSerializer, LessonSerializer
)


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing and retrieving courses."""

    queryset = Course.objects.all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer

    def get_queryset(self):
        queryset = Course.objects.all()
        category = self.request.query_params.get('category')
        level = self.request.query_params.get('level')
        search = self.request.query_params.get('search')

        if category:
            queryset = queryset.filter(category=category)
        if level:
            queryset = queryset.filter(level=level)
        if search:
            queryset = queryset.filter(title__icontains=search)
        return queryset

    @action(detail=True, methods=['get'])
    def lessons(self, request, pk=None):
        """Get all lessons for a course."""
        course = self.get_object()
        lessons = course.lessons.all()
        serializer = LessonSerializer(lessons, many=True)
        return DRFResponse(serializer.data)


class EnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing course enrollments."""

    permission_classes = [IsAuthenticated]
    serializer_class = EnrollmentSerializer

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user).select_related('course')

    def create(self, request, *args, **kwargs):
        """Enroll user in a course."""
        course_id = request.data.get('course_id')

        if not course_id:
            return DRFResponse(
                {'detail': 'course_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return DRFResponse(
                {'detail': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if Enrollment.objects.filter(user=request.user, course=course).exists():
            return DRFResponse(
                {'detail': 'Already enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )

        enrollment = Enrollment.objects.create(user=request.user, course=course)
        serializer = self.get_serializer(enrollment)
        return DRFResponse(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Get enrollment progress details."""
        enrollment = self.get_object()
        total_lessons = enrollment.course.lessons.count()
        read_lessons = LessonProgress.objects.filter(
            user=request.user,
            lesson__course=enrollment.course,
            is_read=True
        ).count()

        progress = (read_lessons / total_lessons * 100) if total_lessons > 0 else 0
        progress_int = int(progress)

        # Update enrollment progress
        if enrollment.progress_percentage != progress_int:
            enrollment.progress_percentage = progress_int
            enrollment.save()

        return DRFResponse({
            'enrollment_id': enrollment.id,
            'total_lessons': total_lessons,
            'completed_lessons': read_lessons,
            'progress_percentage': progress_int,
            'is_completed': enrollment.is_completed
        })


class LessonProgressViewSet(viewsets.ModelViewSet):
    """ViewSet for tracking lesson progress."""

    permission_classes = [IsAuthenticated]
    serializer_class = LessonProgressSerializer

    def get_queryset(self):
        return LessonProgress.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Mark lesson as read and update enrollment progress."""
        lesson_id = request.data.get('lesson_id')

        if not lesson_id:
            return DRFResponse(
                {'detail': 'lesson_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return DRFResponse(
                {'detail': 'Lesson not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        progress, created = LessonProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson
        )
        progress.is_read = True
        progress.read_at = timezone.now()
        progress.save()

        # Update enrollment progress percentage
        try:
            enrollment = Enrollment.objects.get(user=request.user, course=lesson.course)
            total_lessons = lesson.course.lessons.count()
            read_lessons = LessonProgress.objects.filter(
                user=request.user,
                lesson__course=lesson.course,
                is_read=True
            ).count()
            enrollment.progress_percentage = int((read_lessons / total_lessons) * 100) if total_lessons > 0 else 0
            enrollment.save()
        except Enrollment.DoesNotExist:
            pass

        serializer = self.get_serializer(progress)
        return DRFResponse(serializer.data, status=status.HTTP_201_CREATED)
