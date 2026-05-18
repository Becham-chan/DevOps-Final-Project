"""Serializers for the exams app."""

from rest_framework import serializers
from .models import Exam, Question, Answer, Attempt, Response


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'answer_text', 'order']


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
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = [
            'id', 'course', 'title', 'description', 'pass_score',
            'time_limit_minutes', 'question_count', 'created_at'
        ]

    def get_question_count(self, obj):
        return obj.question_count


class ExamDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = [
            'id', 'course', 'title', 'description', 'pass_score',
            'time_limit_minutes', 'questions', 'question_count', 'created_at'
        ]

    def get_question_count(self, obj):
        return obj.question_count


class ResponseSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)

    class Meta:
        model = Response
        fields = ['id', 'question', 'question_text', 'selected_answer', 'user_answer_text']


class AttemptDetailSerializer(serializers.ModelSerializer):
    responses = ResponseSerializer(many=True, read_only=True)
    exam_title = serializers.CharField(source='exam.title', read_only=True)

    class Meta:
        model = Attempt
        fields = [
            'id', 'exam', 'exam_title', 'started_at', 'submitted_at',
            'score', 'is_passed', 'responses'
        ]


class AttemptListSerializer(serializers.ModelSerializer):
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    course_title = serializers.CharField(source='exam.course.title', read_only=True)

    class Meta:
        model = Attempt
        fields = [
            'id', 'exam', 'exam_title', 'course_title',
            'started_at', 'submitted_at', 'score', 'is_passed'
        ]
