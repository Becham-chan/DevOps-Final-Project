"""Basic tests for courses app."""
import pytest
import json
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from courses.models import Course, Lesson, Enrollment


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def auth_client(api_client, user):
    token, _ = Token.objects.get_or_create(user=user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    return api_client


@pytest.fixture
def course(db):
    return Course.objects.create(
        title='Test Course',
        description='A test course description',
        category='python',
        level='beginner',
        duration_hours=10,
        instructor_name='Test Instructor',
    )


@pytest.mark.django_db
def test_list_courses_public(api_client, course):
    response = api_client.get('/api/courses/')
    assert response.status_code == 200
    assert len(response.data) >= 1


@pytest.mark.django_db
def test_course_detail_public(api_client, course):
    response = api_client.get(f'/api/courses/{course.id}/')
    assert response.status_code == 200
    assert response.data['title'] == 'Test Course'


@pytest.mark.django_db
def test_enroll_requires_auth(api_client, course):
    response = api_client.post('/api/enrollments/', {'course_id': course.id})
    assert response.status_code == 401


@pytest.mark.django_db
def test_enroll_authenticated(auth_client, user, course):
    response = auth_client.post('/api/enrollments/', {'course_id': course.id})
    assert response.status_code == 201
    assert Enrollment.objects.filter(user=user, course=course).exists()


@pytest.mark.django_db
def test_double_enroll_rejected(auth_client, user, course):
    Enrollment.objects.create(user=user, course=course)
    response = auth_client.post('/api/enrollments/', {'course_id': course.id})
    assert response.status_code == 400


@pytest.mark.django_db
def test_health_check(api_client):
    response = api_client.get('/api/health/')
    assert response.status_code == 200
    data = json.loads(response.content)
    assert data['status'] == 'healthy'
