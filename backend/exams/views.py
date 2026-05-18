"""Views for the exams app."""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response as DRFResponse
from rest_framework.permissions import IsAuthenticated
from .models import Exam, Attempt, Response as ExamResponse
from .serializers import (
    ExamListSerializer, ExamDetailSerializer,
    AttemptDetailSerializer, AttemptListSerializer
)


class ExamViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing and retrieving exams."""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ExamDetailSerializer
        return ExamListSerializer

    def get_queryset(self):
        """Return only exams for courses user is enrolled in."""
        user_enrollments = self.request.user.enrollments.values_list('course_id', flat=True)
        return Exam.objects.filter(course_id__in=user_enrollments)


class AttemptViewSet(viewsets.ModelViewSet):
    """ViewSet for managing exam attempts."""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return AttemptListSerializer
        return AttemptDetailSerializer

    def get_queryset(self):
        return Attempt.objects.filter(user=self.request.user).select_related('exam', 'exam__course')

    def create(self, request, *args, **kwargs):
        """Start a new exam attempt."""
        exam_id = request.data.get('exam_id')

        if not exam_id:
            return DRFResponse(
                {'detail': 'exam_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            exam = Exam.objects.get(id=exam_id)
        except Exam.DoesNotExist:
            return DRFResponse(
                {'detail': 'Exam not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user is enrolled in the course
        if not request.user.enrollments.filter(course=exam.course).exists():
            return DRFResponse(
                {'detail': 'You must be enrolled in the course to take this exam'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Create new attempt
        attempt = Attempt.objects.create(user=request.user, exam=exam)

        # Create empty responses for each question
        for question in exam.questions.all():
            ExamResponse.objects.create(attempt=attempt, question=question)

        serializer = AttemptDetailSerializer(attempt)
        return DRFResponse(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit exam responses."""
        attempt = self.get_object()

        if attempt.submitted_at:
            return DRFResponse(
                {'detail': 'Exam already submitted'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update responses
        responses_data = request.data.get('responses', [])
        for response_data in responses_data:
            try:
                response = ExamResponse.objects.get(
                    id=response_data.get('id'),
                    attempt=attempt
                )
                selected_answer_id = response_data.get('selected_answer_id')
                if selected_answer_id:
                    response.selected_answer_id = selected_answer_id
                user_answer_text = response_data.get('user_answer_text')
                if user_answer_text:
                    response.user_answer_text = user_answer_text
                response.save()
            except ExamResponse.DoesNotExist:
                pass

        # Finalize attempt
        attempt.finalize()

        serializer = AttemptDetailSerializer(attempt)
        return DRFResponse(serializer.data)

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get exam results after submission."""
        attempt = self.get_object()

        if not attempt.submitted_at:
            return DRFResponse(
                {'detail': 'Exam not yet submitted'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AttemptDetailSerializer(attempt)
        return DRFResponse(serializer.data)
