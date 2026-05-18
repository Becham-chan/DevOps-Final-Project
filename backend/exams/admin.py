"""Admin configuration for the exams app."""

from django.contrib import admin
from .models import Exam, Question, Answer, Attempt, Response


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 2
    fields = ['answer_text', 'is_correct', 'order']


class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1
    fields = ['question_text', 'question_type', 'order']


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'pass_score', 'time_limit_minutes', 'question_count', 'created_at']
    list_filter = ['course']
    search_fields = ['title', 'course__title']
    inlines = [QuestionInline]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'exam', 'question_type', 'order']
    list_filter = ['exam', 'question_type']
    search_fields = ['question_text', 'exam__title']
    inlines = [AnswerInline]


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['answer_text', 'question', 'is_correct', 'order']
    list_filter = ['is_correct', 'question__exam']
    search_fields = ['answer_text', 'question__question_text']


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'exam', 'score', 'is_passed', 'started_at', 'submitted_at']
    list_filter = ['is_passed', 'exam']
    search_fields = ['user__username', 'exam__title']
    readonly_fields = ['started_at', 'submitted_at', 'score', 'is_passed']


@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ['attempt', 'question', 'selected_answer']
    list_filter = ['attempt__exam']
    search_fields = ['attempt__user__username', 'question__question_text']
