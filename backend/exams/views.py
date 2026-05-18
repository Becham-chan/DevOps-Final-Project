om rest_framework import viewsets, status
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
``
