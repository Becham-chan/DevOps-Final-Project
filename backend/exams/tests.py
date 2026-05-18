"""Basic tests for exams app."""
import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from courses.models import Course, Enrollment
from exams.models import Exam, Question, Answer, Attempt


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(username='examuser', email='exam@example.com', password='testpass123')


@pytest.fixture
def auth_client(api_client, user):
    token, _ = Token.objects.get_or_create(user=user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    return api_client


@pytest.fixture
def course(db):
    return Course.objects.create(title='Exam Course', description='desc', category='python', level='beginner', duration_hours=10, instructor_name='Instructor')


@pytest.fixture
def exam(db, course):
    exam = Exam.objects.create(course=course, title='Test Exam', description='desc', pass_score=70, time_limit_minutes=30)
    q = Question.objects.create(exam=exam, question_text='What is 2+2?', question_type='multiple_choice', order=1)
    Answer.objects.create(question=q, answer_text='4', is_correct=True, order=1)
    Answer.objects.create(question=q, answer_text='3', is_correct=False, order=2)
    return exam


@pytest.mark.django_db
def test_exams_require_auth(api_client):
    response = api_client.get('/api/exams/')
    assert response.status_code == 401


@pytest.mark.django_db
def test_start_attempt_requires_enrollment(auth_client, exam):
    response = auth_client.post('/api/attempts/', {'exam_id': exam.id})
    assert response.status_code == 403


@pytest.mark.django_db
def test_start_and_submit_exam(auth_client, user, course, exam):
    Enrollment.objects.create(user=user, course=course)
    response = auth_client.post('/api/attempts/', {'exam_id': exam.id})
    assert response.status_code == 201
    attempt_id = response.data['id']
    response_id = response.data['responses'][0]['id']
    correct_answer = Answer.objects.get(question__exam=exam, is_correct=True)
    submit = auth_client.post(f'/api/attempts/{attempt_id}/submit/', {
        'responses': [{'id': response_id, 'selected_answer_id': correct_answer.id}]
    }, format='json')
    assert submit.status_code == 200
    assert submit.data['score'] == 100
    assert submit.data['is_passed'] is True
