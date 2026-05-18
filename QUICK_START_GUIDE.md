# Quick Start Implementation Guide

## Table of Contents
1. [Project Setup](#project-setup)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Docker & Local Testing](#docker--local-testing)
5. [GitHub Setup](#github-setup)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Render Deployment](#render-deployment)
8. [Testing Checklist](#testing-checklist)

---

## Project Setup

### Step 1: Initialize Repository

```bash
# Create project directory
mkdir course-learning-platform
cd course-learning-platform

# Initialize git
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Create directory structure
mkdir -p backend frontend .github/workflows scripts

# Create .gitignore
# [Copy content from DOCKER_AND_CICD_CONFIG.md]
```

### Step 2: Backend Project Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Create Django project
pip install Django==4.2.8
django-admin startproject config .

# Create apps
python manage.py startapp users
python manage.py startapp courses
python manage.py startapp exams

# Create requirements.txt
pip install -r requirements.txt
```

### Step 3: Frontend Project Setup

```bash
cd ../frontend

# Create Vite project
npm create vite@latest . -- --template react

# Install dependencies
npm install
npm install react-router-dom axios tailwindcss

# Setup Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## Backend Implementation

### Step 1: Configure Django Settings

**config/settings.py** - Key configurations:

```python
import os
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-...')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# Installed apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party
    'rest_framework',
    'corsheaders',
    'django_filters',
    
    # Local
    'users',
    'courses',
    'exams',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='course_db'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='postgres'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# CORS configuration
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:5173').split(',')

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Internationalization
USE_TZ = True
TIME_ZONE = 'UTC'
```

### Step 2: Create Models

[Copy model implementations from BACKEND_MODELS_AND_SERIALIZERS.md]

```bash
# Create migrations
python manage.py makemigrations courses
python manage.py makemigrations exams
python manage.py migrate
```

### Step 3: Create Serializers & Views

[Copy serializer and viewset implementations from BACKEND_MODELS_AND_SERIALIZERS.md]

### Step 4: Create URL Routing

**config/urls.py:**

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from courses.views import CourseViewSet, EnrollmentViewSet, LessonProgressViewSet
from exams.views import ExamViewSet, AttemptViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'lesson-progress', LessonProgressViewSet, basename='lesson-progress')
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'attempts', AttemptViewSet, basename='attempt')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]
```

### Step 5: Create Mock Data Management Command

**courses/management/commands/populate_mock_data.py:**

```python
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from courses.models import Course, Lesson, Enrollment
from exams.models import Exam, Question, Answer

class Command(BaseCommand):
    help = 'Populate database with mock data for courses and exams'

    def handle(self, *args, **options):
        # Create sample courses
        courses_data = [
            {
                'title': 'Python Fundamentals',
                'description': 'Learn Python programming from the ground up, covering variables, functions, and best practices.',
                'category': 'python',
                'level': 'beginner',
                'duration_hours': 40,
                'instructor_name': 'John Smith',
                'lessons': [
                    {'title': 'Getting Started with Python', 'content': '<h2>What is Python?</h2><p>Python is a high-level programming language...</p>', 'time': 45},
                    {'title': 'Variables and Data Types', 'content': '<h2>Understanding Variables</h2><p>Variables store data values...</p>', 'time': 50},
                    {'title': 'Control Flow', 'content': '<h2>If Statements and Loops</h2><p>Control flow determines program execution...</p>', 'time': 60},
                    {'title': 'Functions', 'content': '<h2>Creating Reusable Code</h2><p>Functions help organize code...</p>', 'time': 55},
                ]
            },
            {
                'title': 'Web Development with Django',
                'description': 'Master Django framework for building scalable web applications with Python.',
                'category': 'web_dev',
                'level': 'intermediate',
                'duration_hours': 50,
                'instructor_name': 'Jane Doe',
                'lessons': [
                    {'title': 'Django Basics', 'content': '<h2>Introduction to Django</h2><p>Django is a powerful web framework...</p>', 'time': 60},
                    {'title': 'Models and Databases', 'content': '<h2>Database Design</h2><p>Learn to design database schemas...</p>', 'time': 70},
                    {'title': 'Views and URLs', 'content': '<h2>Routing and Views</h2><p>Connect URLs to view functions...</p>', 'time': 65},
                    {'title': 'Building REST APIs', 'content': '<h2>DRF Tutorial</h2><p>Create robust APIs with Django REST Framework...</p>', 'time': 75},
                ]
            },
            {
                'title': 'React Essentials',
                'description': 'Build interactive web applications using React and modern JavaScript.',
                'category': 'web_dev',
                'level': 'intermediate',
                'duration_hours': 45,
                'instructor_name': 'Mike Johnson',
                'lessons': [
                    {'title': 'React Fundamentals', 'content': '<h2>Components and JSX</h2><p>React is a library for building UIs...</p>', 'time': 50},
                    {'title': 'State and Props', 'content': '<h2>Managing Data</h2><p>State and props drive React applications...</p>', 'time': 60},
                    {'title': 'Hooks Deep Dive', 'content': '<h2>useState and useEffect</h2><p>Hooks enable functional components...</p>', 'time': 65},
                    {'title': 'Advanced Patterns', 'content': '<h2>Context and Custom Hooks</h2><p>Advanced patterns for scalable apps...</p>', 'time': 55},
                ]
            },
            {
                'title': 'DevOps Fundamentals',
                'description': 'Learn containerization, CI/CD, and deployment strategies for modern applications.',
                'category': 'devops',
                'level': 'beginner',
                'duration_hours': 35,
                'instructor_name': 'Sarah Williams',
                'lessons': [
                    {'title': 'Docker Basics', 'content': '<h2>Containerization</h2><p>Docker simplifies application deployment...</p>', 'time': 55},
                    {'title': 'Docker Compose', 'content': '<h2>Multi-Container Apps</h2><p>Manage multiple containers easily...</p>', 'time': 50},
                    {'title': 'CI/CD Pipelines', 'content': '<h2>Continuous Integration</h2><p>Automate testing and deployment...</p>', 'time': 60},
                    {'title': 'Kubernetes Intro', 'content': '<h2>Orchestration at Scale</h2><p>Deploy and manage containerized apps...</p>', 'time': 65},
                ]
            },
            {
                'title': 'Kubernetes Deep Dive',
                'description': 'Advanced Kubernetes concepts for production-grade container orchestration.',
                'category': 'devops',
                'level': 'advanced',
                'duration_hours': 60,
                'instructor_name': 'Alex Chen',
                'lessons': [
                    {'title': 'Kubernetes Architecture', 'content': '<h2>Master and Worker Nodes</h2><p>Understanding K8s components...</p>', 'time': 70},
                    {'title': 'Deployments and Services', 'content': '<h2>Managing Workloads</h2><p>Deploy and expose applications...</p>', 'time': 75},
                    {'title': 'Networking', 'content': '<h2>Service Discovery</h2><p>Network policies and communication...</p>', 'time': 80},
                    {'title': 'Production Practices', 'content': '<h2>Best Practices</h2><p>Security, monitoring, and scaling...</p>', 'time': 85},
                ]
            },
        ]

        # Create courses and lessons
        for course_data in courses_data:
            lessons = course_data.pop('lessons')
            course, created = Course.objects.get_or_create(title=course_data['title'], defaults=course_data)
            
            if created:
                for i, lesson_data in enumerate(lessons):
                    Lesson.objects.create(
                        course=course,
                        order=i+1,
                        estimated_reading_time=lesson_data['time'],
                        title=lesson_data['title'],
                        content=lesson_data['content']
                    )
                self.stdout.write(f"✅ Created course: {course.title}")
        
        # Create sample users
        sample_users = [
            {'username': 'student1', 'email': 'student1@example.com', 'first_name': 'Alice', 'last_name': 'Brown'},
            {'username': 'student2', 'email': 'student2@example.com', 'first_name': 'Bob', 'last_name': 'Wilson'},
            {'username': 'student3', 'email': 'student3@example.com', 'first_name': 'Carol', 'last_name': 'Garcia'},
        ]
        
        for user_data in sample_users:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                }
            )
            if created:
                user.set_password('testpass123')
                user.save()
                self.stdout.write(f"✅ Created user: {user.username}")
        
        # Create sample enrollments
        students = User.objects.filter(username__startswith='student')
        courses = Course.objects.all()
        
        for i, student in enumerate(students):
            for course in courses[:3]:  # Enroll in first 3 courses
                Enrollment.objects.get_or_create(user=student, course=course)
        
        self.stdout.write(self.style.SUCCESS('✅ Mock data population completed successfully!'))
```

### Step 6: Create Admin Interface

**courses/admin.py:**

```python
from django.contrib import admin
from .models import Course, Lesson, Enrollment, LessonProgress

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'level', 'duration_hours', 'lesson_count')
    list_filter = ('category', 'level', 'created_at')
    search_fields = ('title', 'description', 'instructor_name')
    ordering = ('-created_at',)

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'estimated_reading_time')
    list_filter = ('course', 'created_at')
    search_fields = ('title', 'content')
    ordering = ('course', 'order')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'progress_percentage', 'is_completed', 'enrolled_at')
    list_filter = ('is_completed', 'enrolled_at')
    search_fields = ('user__username', 'course__title')

@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'is_read', 'read_at')
    list_filter = ('is_read', 'read_at')
```

---

## Frontend Implementation

### Step 1: Project Structure

```bash
cd frontend

# Create folder structure
mkdir -p src/{pages,components,context,hooks,services}

# Copy all React files from FRONTEND_REACT_CODE.md into respective folders
```

### Step 2: Configure Vite

**vite.config.js:**
[Copy from FRONTEND_REACT_CODE.md]

**tailwind.config.js:**
[Copy from FRONTEND_REACT_CODE.md]

### Step 3: Create Main Entry Point

**src/main.jsx:**

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**public/index.html:**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Course Learning Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## Docker & Local Testing

### Step 1: Create Docker Files

[Copy Dockerfile and docker-compose.yml from DOCKER_AND_CICD_CONFIG.md]

### Step 2: Create Environment File

**.env** (in project root):

```bash
# Django
DEBUG=True
SECRET_KEY=django-insecure-YOUR-SECRET-KEY-HERE
ALLOWED_HOSTS=localhost,127.0.0.1,backend

# Database
DB_NAME=course_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:8000
```

### Step 3: Build and Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Run migrations if needed
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py shell < create_superuser.py

# Populate mock data
docker-compose exec backend python manage.py populate_mock_data
```

### Step 4: Test Locally

```bash
# Backend API
curl http://localhost:8000/api/courses/

# Admin panel
# Open http://localhost:8000/admin (admin/admin123)

# Frontend
# Open http://localhost:5173
```

---

## GitHub Setup

### Step 1: Create GitHub Repository

```bash
git add .
git commit -m "Initial commit: Course Learning Platform setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/course-learning-platform.git
git push -u origin main
```

### Step 2: Add GitHub Secrets

In GitHub repository settings → Secrets and variables → Actions:

```
DOCKER_HUB_USERNAME: your-docker-username
DOCKER_HUB_PASSWORD: your-docker-password

RENDER_BACKEND_DEPLOY_HOOK: https://api.render.com/deploy/srv-...
RENDER_FRONTEND_DEPLOY_HOOK: https://api.render.com/deploy/srv-...

BACKEND_URL: https://your-backend.onrender.com
FRONTEND_URL: https://your-frontend.onrender.com

SLACK_WEBHOOK: https://hooks.slack.com/services/... (optional)
```

### Step 3: Add GitHub Actions Workflows

[Copy CI and CD workflows from DOCKER_AND_CICD_CONFIG.md into .github/workflows/]

---

## CI/CD Pipeline

### Verify CI Pipeline

1. Push to develop/main branch
2. GitHub Actions automatically runs:
   - Backend tests
   - Frontend linting and build
   - Docker image builds
   - Security scans

3. Check results in Actions tab

### Trigger CD Pipeline

CD only runs on pushes to `main` branch:

```bash
git checkout main
git merge develop
git push origin main
```

This will:
- Run CI pipeline
- Build and push Docker images
- Deploy to Render
- Run smoke tests
- Send Slack notification

---

## Render Deployment

### Step 1: Create Render Account

- Go to https://render.com
- Sign up and connect GitHub

### Step 2: Create PostgreSQL Database

1. Dashboard → New → PostgreSQL
2. Name: `course-platform-db`
3. Instance Type: Free
4. Copy connection string

### Step 3: Create Backend Service

1. Dashboard → New → Web Service
2. Connect GitHub repository
3. Configuration:
   - Name: `course-platform-backend`
   - Runtime: Python 3.11
   - Build Command: `pip install -r requirements.txt && python manage.py migrate && python manage.py collect_static --noinput`
   - Start Command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 4`

4. Environment Variables:
   ```
   DEBUG=False
   SECRET_KEY=[Generate secure key]
   DATABASE_URL=[From PostgreSQL service]
   ALLOWED_HOSTS=your-backend.onrender.com
   CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com
   ```

5. Deploy

### Step 4: Create Frontend Service

1. Dashboard → New → Static Site
2. Connect GitHub repository
3. Configuration:
   - Name: `course-platform-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

4. Environment Variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

5. Deploy

### Step 5: Get Deployment Hooks

For CD pipeline, get webhook URLs:

1. Backend Service → Settings → Deploy Hook
2. Frontend Service → Settings → Deploy Hook
3. Add to GitHub Secrets

---

## Testing Checklist

### Local Testing

- [ ] Backend starts without errors
- [ ] Database migrations run successfully
- [ ] Superuser created (admin/admin123)
- [ ] Mock data populated
- [ ] Frontend builds successfully
- [ ] API endpoints accessible (curl tests)
- [ ] Authentication works (register/login)
- [ ] Course listing displays correctly
- [ ] Course enrollment works
- [ ] Exam functionality works
- [ ] Admin panel accessible

### GitHub Actions Testing

- [ ] CI pipeline passes on PR
- [ ] All tests pass
- [ ] Linting passes
- [ ] Docker images build successfully
- [ ] Security scans complete

### Production Testing (Render)

- [ ] Backend service healthy
- [ ] Frontend service accessible
- [ ] Database connections work
- [ ] API endpoints respond
- [ ] User can register
- [ ] User can login
- [ ] User can view courses
- [ ] User can enroll in courses
- [ ] User can take exams
- [ ] Admin panel accessible on production

### End-to-End User Flow

1. [ ] Land on home page
2. [ ] Click "Get Started"
3. [ ] Register new account
4. [ ] Login
5. [ ] View dashboard
6. [ ] Browse available courses
7. [ ] Enroll in a course
8. [ ] View course lessons
9. [ ] Read lesson content
10. [ ] Take an exam
11. [ ] View exam results
12. [ ] View updated progress
13. [ ] Logout

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs db

# Rebuild database
docker-compose down -v
docker-compose up -d
```

### Frontend Can't Reach Backend

```bash
# Check CORS settings in Django
# Update CORS_ALLOWED_ORIGINS in .env

# Verify API URL in frontend
# Check VITE_API_URL in .env
```

### GitHub Actions Failing

```bash
# Check logs in GitHub Actions tab
# Verify Python/Node.js versions match
# Ensure all secrets are set
```

### Render Deployment Issues

```bash
# Check Render logs
# Verify DATABASE_URL is set
# Ensure build command succeeds locally
# Check environment variables
```

---

## Performance Tips

1. **Backend Optimization:**
   - Use select_related() for foreign keys
   - Use prefetch_related() for many-to-many
   - Add database indexes

2. **Frontend Optimization:**
   - Implement code splitting
   - Lazy load routes
   - Cache API responses

3. **Docker Optimization:**
   - Use multi-stage builds
   - Minimize layer size
   - Use alpine base images

4. **CI/CD Optimization:**
   - Cache dependencies
   - Run tests in parallel
   - Use artifact caching

---

## Next Steps

1. Complete all implementation steps
2. Test locally with docker-compose
3. Push to GitHub
4. Set up CI/CD workflows
5. Configure Render services
6. Deploy to production
7. Monitor and iterate

---

Generated for DevOps Learning Project
