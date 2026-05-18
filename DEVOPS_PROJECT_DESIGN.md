# DevOps Project Design: Course Learning Platform

## Project Overview
**Course Learning Platform** - An educational platform where users can enroll in courses, read course content, and take exams to evaluate their learning outcomes.

**Estimated Completion**: 6-8 hours (Medium complexity)

---

## 1. Project Architecture

### Directory Structure
```
course-learning-platform/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── courses/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── migrations/
│   ├── exams/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── migrations/
│   ├── users/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   └── api/
│       └── urls.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── CourseCard.jsx
│   │   │   ├── ExamComponent.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CourseDetail.jsx
│   │   │   ├── ExamPage.jsx
│   │   │   └── Results.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── Dockerfile
│   ├── .dockerignore
│   └── vite.config.js
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── .gitignore
└── README.md
```

---

## 2. Database Schema (PostgreSQL)

### Table: auth_user (Django Built-in, Enhanced)
- id (PK)
- username (unique)
- email (unique)
- first_name
- last_name
- password_hash
- is_active
- is_staff
- created_at

### Table: courses_course
- id (PK)
- title (varchar)
- description (text)
- category (varchar) - e.g., "Python", "Web Dev", "DevOps"
- level (varchar) - "Beginner", "Intermediate", "Advanced"
- duration_hours (integer)
- instructor_name (varchar)
- created_at (timestamp)
- updated_at (timestamp)

### Table: courses_lesson
- id (PK)
- course_id (FK to courses_course)
- title (varchar)
- content (text) - Course content/blog post
- order (integer) - Lesson sequence
- estimated_reading_time (integer) - minutes
- created_at (timestamp)

### Table: courses_enrollment
- id (PK)
- user_id (FK to auth_user)
- course_id (FK to courses_course)
- enrolled_at (timestamp)
- progress_percentage (integer, default 0)
- is_completed (boolean, default false)
- completed_at (timestamp, nullable)

### Table: exams_exam
- id (PK)
- course_id (FK to courses_course)
- title (varchar)
- description (text)
- pass_score (integer) - Percentage (default 70)
- time_limit_minutes (integer) - Exam duration
- created_at (timestamp)
- updated_at (timestamp)

### Table: exams_question
- id (PK)
- exam_id (FK to exams_exam)
- question_text (text)
- question_type (varchar) - "multiple_choice", "true_false", "short_answer"
- order (integer)
- created_at (timestamp)

### Table: exams_answer (Options for questions)
- id (PK)
- question_id (FK to exams_question)
- answer_text (text)
- is_correct (boolean)
- order (integer)

### Table: exams_attempt
- id (PK)
- user_id (FK to auth_user)
- exam_id (FK to exams_exam)
- started_at (timestamp)
- submitted_at (timestamp, nullable)
- score (integer, nullable) - Percentage
- is_passed (boolean, nullable)

### Table: exams_response
- id (PK)
- attempt_id (FK to exams_attempt)
- question_id (FK to exams_question)
- selected_answer_id (FK to exams_answer, nullable)
- user_answer_text (text, nullable) - For short answers

**Total Tables: 10 (Including User table: 11)**
**Excluded from count: auth_user (Django built-in)**

---

## 3. Core Features

### Backend (Django + DRF)

#### Authentication & Authorization
- Token-based authentication (using Django REST Framework)
- User registration endpoint
- User login endpoint
- JWT token refresh (optional enhancement)

#### Courses App
- **Endpoints:**
  - `GET /api/courses/` - List all courses (public)
  - `GET /api/courses/<id>/` - Course detail with lessons (public)
  - `GET /api/courses/<id>/lessons/` - Get lessons for a course (enrolled users only)
  - `POST /api/enrollments/` - Enroll in a course (authenticated)
  - `GET /api/enrollments/` - Get user's enrollments (authenticated)
  - `GET /api/enrollments/<id>/progress/` - Track enrollment progress

#### Exams App
- **Endpoints:**
  - `GET /api/exams/` - List exams available in enrolled courses (authenticated)
  - `GET /api/exams/<id>/` - Get exam details and questions
  - `POST /api/attempts/` - Start an exam attempt
  - `POST /api/attempts/<id>/submit/` - Submit exam responses
  - `GET /api/attempts/<id>/` - Get attempt results
  - `GET /api/attempts/?user_id=<id>` - Get user's exam history

#### Admin Dashboard (Django Admin)
- Manage courses, lessons, exams, and questions
- Monitor user enrollments and exam results
- Create mock data easily

### Frontend (React + Vite)

#### Pages
1. **Home Page** (Public)
   - Landing page with course cards
   - Search/filter courses by category and level
   - Call-to-action buttons (Login/Register)

2. **Authentication**
   - Login page (email/password)
   - Register page (create new account)
   - JWT token stored in localStorage

3. **Dashboard** (Protected)
   - User's enrolled courses
   - Progress tracker for each course
   - "Continue Learning" buttons
   - Exam availability indicator

4. **Course Detail** (Protected)
   - Course overview and description
   - Lesson list with reading time
   - Lesson content display
   - Mark lessons as read
   - Navigation between lessons

5. **Exam Page** (Protected)
   - Pre-exam instructions
   - Timer (if time-limited)
   - Question rendering (MCQ, T/F, Short Answer)
   - Progress indicator
   - Submit exam

6. **Results Page** (Protected)
   - Score display
   - Pass/Fail status
   - Question review (if applicable)
   - Comparison with pass threshold
   - Option to retake exam

#### Components
- Navbar with auth state
- Course cards (filterable)
- Protected routes
- Loading spinners
- Toast notifications
- Modal dialogs

---

## 4. Docker Compose Setup

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: course_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    command: >
      sh -c "python manage.py migrate &&
             python manage.py create_superuser &&
             python manage.py populate_mock_data &&
             gunicorn config.wsgi:application --bind 0.0.0.0:8000"
    environment:
      DEBUG: "False"
      SECRET_KEY: "your-secret-key-here"
      DATABASE_URL: "postgresql://postgres:postgres@db:5432/course_db"
      ALLOWED_HOSTS: "localhost,127.0.0.1,backend"
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: "http://localhost:8000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

---

## 5. GitHub Actions CI/CD Pipeline

### CI Pipeline (.github/workflows/ci.yml)

**Triggers:** Push to main/dev, PR to main

**Steps:**
1. Checkout code
2. Set up Python 3.11
3. Install backend dependencies
4. Run linting (flake8)
5. Run tests with pytest
6. Set up Node.js 18
7. Install frontend dependencies
8. Run frontend linting (ESLint)
9. Build frontend (vite build)
10. Run security checks (bandit for Python)
11. Build Docker images

### CD Pipeline (.github/workflows/cd.yml)

**Triggers:** Push to main branch only

**Steps:**
1. Run CI pipeline
2. Build and push Docker images to Docker Hub
3. Deploy to Render.com:
   - Trigger Render webhook for backend service
   - Trigger Render webhook for frontend service
4. Run smoke tests on deployed services
5. Send deployment notification

---

## 6. Render Deployment Setup

### Backend Service
- **Framework:** Python
- **Build Command:** `pip install -r requirements.txt && python manage.py migrate && python manage.py collect_static --noinput`
- **Start Command:** `gunicorn config.wsgi:application --bind 0.0.0.0:10000`
- **Environment Variables:**
  - `DEBUG=False`
  - `ALLOWED_HOSTS=your-backend.onrender.com`
  - `DATABASE_URL=postgresql://...` (Render PostgreSQL addon)
  - `SECRET_KEY=...` (from GitHub secrets)

### Frontend Service
- **Framework:** Static Site (Next.js/React)
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL=https://your-backend.onrender.com`

### Database
- Use Render's PostgreSQL addon (free tier available)

---

## 7. Development Timeline (8 hours)

### Phase 1: Project Setup (1 hour)
- [ ] Initialize GitHub repo
- [ ] Create Django project and apps
- [ ] Initialize React project (Vite)
- [ ] Create docker-compose.yml
- [ ] Set up Python virtual environment

### Phase 2: Backend Development (3 hours)
- [ ] Create Django models (courses, lessons, enrollments, exams)
- [ ] Create database migrations
- [ ] Set up Django REST Framework
- [ ] Create API endpoints (courses, enrollments, exams)
- [ ] Create custom admin commands for mock data
- [ ] Implement authentication (TokenAuthentication)
- [ ] Add permission classes for protected endpoints
- [ ] Create superuser setup script

### Phase 3: Frontend Development (2.5 hours)
- [ ] Set up React project structure
- [ ] Create AuthContext for state management
- [ ] Build authentication pages (Login, Register)
- [ ] Create protected route wrapper
- [ ] Build course listing and detail pages
- [ ] Build enrollment and progress tracking
- [ ] Build exam interface with timer
- [ ] Create results display page
- [ ] Style with Tailwind CSS

### Phase 4: Docker & CI/CD (1.5 hours)
- [ ] Create Dockerfiles for backend and frontend
- [ ] Test docker-compose setup locally
- [ ] Set up GitHub Actions CI workflow
- [ ] Set up GitHub Actions CD workflow
- [ ] Configure Render services
- [ ] Set up webhooks and environment variables
- [ ] Test deployment pipeline

---

## 8. Mock Data Schema

### Sample Courses (5-10 courses)
- Python Fundamentals (Beginner)
- Web Development with Django (Intermediate)
- React Essentials (Intermediate)
- DevOps Fundamentals (Beginner)
- Kubernetes Deep Dive (Advanced)
- etc.

### Sample Lessons per Course (5-8 lessons)
- Introduction to X
- Core Concepts
- Practical Examples
- Best Practices
- Advanced Topics
- etc.

### Sample Exams per Course
- 1 exam per course
- 10-15 questions per exam
- Mix of MCQ (60%), True/False (20%), Short Answer (20%)

### Sample Users (3-5 demo accounts)
- admin@example.com (superuser)
- student1@example.com
- student2@example.com
- etc.

---

## 9. Key Technical Decisions

### Backend
- **Django + DRF** for REST API
- **TokenAuthentication** for simplicity (can upgrade to JWT)
- **PostgreSQL** for relational data
- **Gunicorn** as production WSGI server
- **Custom admin commands** for mock data generation

### Frontend
- **Vite** for faster development and builds
- **React Router** for navigation
- **Context API** for auth state (lighter than Redux)
- **Axios** for HTTP requests
- **Tailwind CSS** for styling
- **React Query** (optional) for data fetching

### DevOps
- **Docker Compose** for local development
- **GitHub Actions** for CI/CD
- **Render** for simple deployment
- **GitHub Secrets** for sensitive data

---

## 10. Security Considerations

- [ ] CORS enabled properly (only allow frontend domain)
- [ ] CSRF protection for forms
- [ ] SQL injection prevention (Django ORM handles this)
- [ ] XSS prevention (React handles this)
- [ ] Password hashing (Django's built-in)
- [ ] HTTPS enforced in production
- [ ] Environment variables for secrets
- [ ] Rate limiting on API endpoints (optional)
- [ ] Input validation on both frontend and backend

---

## 11. Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] No security vulnerabilities detected
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Mock data scripts ready

### Deployment
- [ ] Docker images built and tested
- [ ] Push to repository
- [ ] GitHub Actions triggered
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Render
- [ ] Smoke tests passing
- [ ] Database migrations applied on production

### Post-deployment
- [ ] Manual testing in production
- [ ] Monitor logs for errors
- [ ] Verify all endpoints accessible
- [ ] Test user registration and login
- [ ] Test course enrollment
- [ ] Test exam submission

---

## 12. Additional Features (Optional Extensions)

- Email notifications for course enrollment
- Certificate generation on exam pass
- Discussion forums per course
- Leaderboards based on exam scores
- Automated email reminders
- Progress analytics dashboard
- Course ratings and reviews
- Payment integration for premium courses
- Video content integration
- Mobile app using React Native

---

## 13. Resources & Technologies

### Backend Stack
- Django 4.2+
- Django REST Framework 3.14+
- PostgreSQL 15
- Gunicorn
- python-decouple (environment variables)
- pytest-django (testing)

### Frontend Stack
- React 18+
- Vite 4+
- React Router v6
- Axios
- Tailwind CSS
- JavaScript ES6+

### DevOps Stack
- Docker & Docker Compose
- GitHub Actions
- Render.com
- PostgreSQL

### Development Tools
- Git & GitHub
- VS Code
- Postman (API testing)
- pgAdmin (Database management)

---

## 14. Learning Outcomes for DevOps

By completing this project, you'll gain experience with:

1. **Containerization**: Docker and docker-compose for development
2. **CI/CD Pipelines**: GitHub Actions for automated testing and deployment
3. **Infrastructure as Code**: yaml configurations for services
4. **Database Management**: PostgreSQL setup and migrations
5. **API Development**: RESTful API design and implementation
6. **Authentication**: Token-based auth in APIs
7. **Frontend-Backend Integration**: CORS, environment variables
8. **Cloud Deployment**: Deploying to Render with environment management
9. **Version Control**: Git workflows and GitHub features
10. **Monitoring & Logging**: Viewing logs in Render dashboard

---

## 15. Success Criteria

✅ Project runs successfully with `docker-compose up`
✅ All API endpoints accessible and functional
✅ User can register, login, and access protected pages
✅ User can enroll in courses and track progress
✅ User can take exams and view results
✅ Admin panel populated with mock data
✅ GitHub Actions CI runs successfully
✅ CD pipeline deploys to Render on push
✅ Frontend and backend deployed and accessible
✅ Database persists data correctly

---

## Estimated Effort

- **Setup & Configuration**: 1 hour
- **Backend Development**: 3 hours
- **Frontend Development**: 2.5 hours
- **Docker & Testing**: 1 hour
- **CI/CD Setup**: 1 hour
- **Deployment & Testing**: 0.5 hour

**Total: 8 hours** (Medium complexity, achievable in one day)

---

Generated for DevOps Learning Project
