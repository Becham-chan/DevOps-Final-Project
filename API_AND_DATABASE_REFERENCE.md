# Course Learning Platform - Complete API & Database Reference

## API Endpoints Reference

### Base URL
- **Development:** `http://localhost:8000/api`
- **Production:** `https://your-backend.onrender.com/api`

### Authentication
All endpoints except public ones require `Authorization: Token <token>` header.

---

## 📚 Courses Endpoints

### GET /api/courses/
**Description:** List all available courses (public)
**Authentication:** Not required
**Status Code:** 200 OK

**Response:**
```json
[
  {
    "id": 1,
    "title": "Python Fundamentals",
    "description": "Learn Python programming...",
    "category": "python",
    "level": "beginner",
    "duration_hours": 40,
    "instructor_name": "John Doe",
    "lesson_count": 4,
    "enrollment_count": 15,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Query Parameters:**
```
?category=python          # Filter by category
?level=beginner          # Filter by level (beginner, intermediate, advanced)
?search=python           # Search in title/description
```

---

### GET /api/courses/{id}/
**Description:** Get detailed course information
**Authentication:** Not required
**Status Code:** 200 OK

**Response:**
```json
{
  "id": 1,
  "title": "Python Fundamentals",
  "description": "Learn Python programming...",
  "category": "python",
  "level": "beginner",
  "duration_hours": 40,
  "instructor_name": "John Doe",
  "lesson_count": 4,
  "enrollment_count": 15,
  "lessons": [
    {
      "id": 1,
      "title": "Getting Started",
      "content": "<h2>What is Python?</h2>...",
      "order": 1,
      "estimated_reading_time": 45,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### GET /api/courses/{id}/lessons/
**Description:** Get all lessons for a course
**Authentication:** Not required
**Status Code:** 200 OK

**Response:**
```json
[
  {
    "id": 1,
    "title": "Getting Started with Python",
    "content": "<h2>What is Python?</h2>...",
    "order": 1,
    "estimated_reading_time": 45,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

## 📝 Enrollment Endpoints

### GET /api/enrollments/
**Description:** Get user's course enrollments
**Authentication:** Required
**Status Code:** 200 OK

**Response:**
```json
[
  {
    "id": 1,
    "course": 1,
    "course_title": "Python Fundamentals",
    "course_detail": {
      "id": 1,
      "title": "Python Fundamentals",
      "description": "...",
      "category": "python",
      "level": "beginner",
      "duration_hours": 40,
      "instructor_name": "John Doe",
      "lesson_count": 4,
      "enrollment_count": 15,
      "created_at": "2024-01-15T10:30:00Z"
    },
    "enrolled_at": "2024-01-20T14:22:00Z",
    "progress_percentage": 50,
    "is_completed": false,
    "completed_at": null
  }
]
```

---

### POST /api/enrollments/
**Description:** Enroll user in a course
**Authentication:** Required
**Status Code:** 201 Created

**Request Body:**
```json
{
  "course_id": 1
}
```

**Response:**
```json
{
  "id": 1,
  "course": 1,
  "course_title": "Python Fundamentals",
  "course_detail": {...},
  "enrolled_at": "2024-01-20T14:22:00Z",
  "progress_percentage": 0,
  "is_completed": false,
  "completed_at": null
}
```

**Error Cases:**
- `400 Bad Request` - Already enrolled in course
- `404 Not Found` - Course doesn't exist
- `401 Unauthorized` - Not authenticated

---

### GET /api/enrollments/{id}/progress/
**Description:** Get enrollment progress details
**Authentication:** Required
**Status Code:** 200 OK

**Response:**
```json
{
  "enrollment_id": 1,
  "total_lessons": 4,
  "completed_lessons": 2,
  "progress_percentage": 50,
  "is_completed": false
}
```

---

## 📖 Lesson Progress Endpoints

### POST /api/lesson-progress/
**Description:** Mark lesson as read
**Authentication:** Required
**Status Code:** 201 Created

**Request Body:**
```json
{
  "lesson_id": 1
}
```

**Response:**
```json
{
  "id": 1,
  "lesson": 1,
  "lesson_title": "Getting Started with Python",
  "is_read": true,
  "read_at": "2024-01-20T14:25:00Z"
}
```

---

### GET /api/lesson-progress/
**Description:** Get user's lesson progress
**Authentication:** Required
**Status Code:** 200 OK

**Response:**
```json
[
  {
    "id": 1,
    "lesson": 1,
    "lesson_title": "Getting Started with Python",
    "is_read": true,
    "read_at": "2024-01-20T14:25:00Z"
  }
]
```

---

## 📊 Exam Endpoints

### GET /api/exams/
**Description:** List exams for enrolled courses
**Authentication:** Required
**Status Code:** 200 OK

**Response:**
```json
[
  {
    "id": 1,
    "course": 1,
    "title": "Python Fundamentals Quiz",
    "description": "Test your Python knowledge",
    "pass_score": 70,
    "time_limit_minutes": 60,
    "question_count": 10,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### GET /api/exams/{id}/
**Description:** Get exam details with questions
**Authentication:** Required
**Status Code:** 200 OK

**Response:**
```json
{
  "id": 1,
  "course": 1,
  "title": "Python Fundamentals Quiz",
  "description": "Test your Python knowledge",
  "pass_score": 70,
  "time_limit_minutes": 60,
  "questions": [
    {
      "id": 1,
      "question_text": "What is Python?",
      "question_type": "multiple_choice",
      "order": 1,
      "answers": [
        {
          "id": 1,
          "answer_text": "A programming language",
          "order": 1
        },
        {
          "id": 2,
          "answer_text": "A snake",
          "order": 2
        }
      ]
    }
  ],
  "question_count": 10,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## ✅ Exam Attempt Endpoints

### POST /api/attempts/
**Description:** Start a new exam attempt
**Authentication:** Required
**Status Code:** 201 Created

**Request Body:**
```json
{
  "exam_id": 1
}
```

**Response:**
```json
{
  "id": 1,
  "exam": 1,
  "exam_title": "Python Fundamentals Quiz",
  "started_at": "2024-01-20T14:30:00Z",
  "submitted_at": null,
  "score": null,
  "is_passed": null,
  "responses": [
    {
      "id": 1,
      "question": 1,
      "question_text": "What is Python?",
      "selected_answer": null,
      "user_answer_text": null
    }
  ]
}
```

---

### POST /api/attempts/{id}/submit/
**Description:** Submit exam responses
**Authentication:** Required
**Status Code:** 200 OK

**Request Body:**
```json
{
  "responses": [
    {
      "id": 1,
      "selected_answer_id": 1,
      "user_answer_text": null
    },
    {
      "id": 2,
      "selected_answer_id": 3,
      "user_answer_text": null
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "exam": 1,
  "exam_title": "Python Fundamentals Quiz",
  "started_at": "2024-01-20T14:30:00Z",
  "submitted_at": "2024-01-20T15:30:00Z",
  "score": 85,
  "is_passed": true,
  "responses": [
    {
      "id": 1,
      "question": 1,
      "question_text": "What is Python?",
      "selected_answer": 1,
      "user_answer_text": null
    }
  ]
}
```

---

### GET /api/attempts/
**Description:** Get user's exam attempts history
**Authentication:** Required
**Status Code:** 200 OK

**Response:**
```json
[
  {
    "id": 1,
    "exam": 1,
    "exam_title": "Python Fundamentals Quiz",
    "course_title": "Python Fundamentals",
    "started_at": "2024-01-20T14:30:00Z",
    "submitted_at": "2024-01-20T15:30:00Z",
    "score": 85,
    "is_passed": true
  }
]
```

---

### GET /api/attempts/{id}/
**Description:** Get specific attempt details
**Authentication:** Required
**Status Code:** 200 OK

**Response:**
```json
{
  "id": 1,
  "exam": 1,
  "exam_title": "Python Fundamentals Quiz",
  "started_at": "2024-01-20T14:30:00Z",
  "submitted_at": "2024-01-20T15:30:00Z",
  "score": 85,
  "is_passed": true,
  "responses": [
    {
      "id": 1,
      "question": 1,
      "question_text": "What is Python?",
      "selected_answer": 1,
      "user_answer_text": null
    }
  ]
}
```

---

## 🔐 Authentication Endpoints

### POST /api/auth/login/
**Description:** User login
**Authentication:** Not required
**Status Code:** 200 OK

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "abc123token456",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Error Cases:**
- `400 Bad Request` - Invalid credentials
- `404 Not Found` - User doesn't exist

---

### POST /api/auth/register/
**Description:** User registration
**Authentication:** Not required
**Status Code:** 201 Created

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "token": "abc123token456",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Error Cases:**
- `400 Bad Request` - Username/email already exists or invalid data

---

### GET /api/auth/user/
**Description:** Get current authenticated user
**Authentication:** Required
**Status Code:** 200 OK

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

---

## 🗄️ Database Schema Details

### User Table (Django auth_user)
```sql
CREATE TABLE auth_user (
  id SERIAL PRIMARY KEY,
  username VARCHAR(150) UNIQUE NOT NULL,
  email VARCHAR(254) UNIQUE NOT NULL,
  first_name VARCHAR(150),
  last_name VARCHAR(150),
  password VARCHAR(128) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_staff BOOLEAN DEFAULT false,
  created_at TIMESTAMP AUTO_NOW_ADD,
  updated_at TIMESTAMP AUTO_NOW
);
```

### Courses Table
```sql
CREATE TABLE courses_course (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  level VARCHAR(20) NOT NULL,
  duration_hours INTEGER NOT NULL,
  instructor_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP AUTO_NOW_ADD,
  updated_at TIMESTAMP AUTO_NOW,
  CONSTRAINT course_category_check CHECK (category IN ('python', 'web_dev', 'devops', 'data_science', 'cloud')),
  CONSTRAINT course_level_check CHECK (level IN ('beginner', 'intermediate', 'advanced'))
);

CREATE INDEX idx_courses_category_level ON courses_course(category, level);
```

### Lessons Table
```sql
CREATE TABLE courses_lesson (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses_course(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  order INTEGER NOT NULL,
  estimated_reading_time INTEGER NOT NULL,
  created_at TIMESTAMP AUTO_NOW_ADD,
  UNIQUE (course_id, order),
  CONSTRAINT order_positive CHECK (order > 0)
);

CREATE INDEX idx_lessons_course_order ON courses_lesson(course_id, order);
```

### Enrollment Table
```sql
CREATE TABLE courses_enrollment (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses_course(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP AUTO_NOW_ADD,
  progress_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP NULL,
  UNIQUE (user_id, course_id),
  CONSTRAINT progress_range CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

CREATE INDEX idx_enrollment_user_course ON courses_enrollment(user_id, course_id);
```

### Lesson Progress Table
```sql
CREATE TABLE courses_lessonprogress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES courses_lesson(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP NULL,
  UNIQUE (user_id, lesson_id)
);
```

### Exams Table
```sql
CREATE TABLE exams_exam (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses_course(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  pass_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMP AUTO_NOW_ADD,
  updated_at TIMESTAMP AUTO_NOW,
  CONSTRAINT pass_score_range CHECK (pass_score >= 0 AND pass_score <= 100),
  CONSTRAINT time_limit_positive CHECK (time_limit_minutes > 0)
);
```

### Questions Table
```sql
CREATE TABLE exams_question (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams_exam(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL,
  order INTEGER NOT NULL,
  created_at TIMESTAMP AUTO_NOW_ADD,
  UNIQUE (exam_id, order),
  CONSTRAINT question_type_check CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer'))
);

CREATE INDEX idx_questions_exam_order ON exams_question(exam_id, order);
```

### Answers Table
```sql
CREATE TABLE exams_answer (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES exams_question(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order INTEGER NOT NULL,
  UNIQUE (question_id, order)
);
```

### Attempts Table
```sql
CREATE TABLE exams_attempt (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  exam_id INTEGER NOT NULL REFERENCES exams_exam(id) ON DELETE CASCADE,
  started_at TIMESTAMP AUTO_NOW_ADD,
  submitted_at TIMESTAMP NULL,
  score INTEGER NULL,
  is_passed BOOLEAN NULL,
  CONSTRAINT score_range CHECK (score IS NULL OR (score >= 0 AND score <= 100))
);

CREATE INDEX idx_attempt_user_exam ON exams_attempt(user_id, exam_id);
```

### Responses Table
```sql
CREATE TABLE exams_response (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER NOT NULL REFERENCES exams_attempt(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES exams_question(id) ON DELETE CASCADE,
  selected_answer_id INTEGER NULL REFERENCES exams_answer(id) ON DELETE SET NULL,
  user_answer_text TEXT NULL,
  UNIQUE (attempt_id, question_id)
);
```

---

## 📊 Common API Patterns

### Pagination
```json
{
  "count": 100,
  "next": "http://api.example.com/courses/?page=2",
  "previous": null,
  "results": [...]
}
```

### Error Response
```json
{
  "detail": "Error message",
  "error_code": "VALIDATION_ERROR"
}
```

### Status Codes Used
```
200 OK               - Successful GET/PUT/PATCH
201 Created          - Successful POST (resource created)
204 No Content       - Successful DELETE
400 Bad Request      - Invalid request data
401 Unauthorized     - Authentication required
403 Forbidden        - Insufficient permissions
404 Not Found        - Resource doesn't exist
409 Conflict         - Resource already exists
500 Server Error     - Internal server error
```

---

## 🔄 Request/Response Flow Example

### User Registration & Course Enrollment Flow

```
1. POST /api/auth/register/
   Request: { username, email, password, first_name, last_name }
   Response: { token, user }
   ↓
2. GET /api/courses/
   Request: Authorization: Token abc123
   Response: [ { id, title, ... }, ... ]
   ↓
3. GET /api/courses/1/
   Request: Authorization: Token abc123
   Response: { id, title, lessons, ... }
   ↓
4. POST /api/enrollments/
   Request: { course_id: 1 }
   Authorization: Token abc123
   Response: { id, course, progress_percentage, ... }
   ↓
5. GET /api/enrollments/
   Request: Authorization: Token abc123
   Response: [ { id, course, progress_percentage, ... } ]
   ↓
6. POST /api/lesson-progress/
   Request: { lesson_id: 1 }
   Authorization: Token abc123
   Response: { id, lesson, is_read, read_at }
```

---

## 🧪 Testing Endpoints with cURL

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Get Courses
```bash
curl http://localhost:8000/api/courses/ \
  -H "Content-Type: application/json"
```

### Enroll in Course
```bash
curl -X POST http://localhost:8000/api/enrollments/ \
  -H "Authorization: Token abc123token456" \
  -H "Content-Type: application/json" \
  -d '{ "course_id": 1 }'
```

### Submit Exam
```bash
curl -X POST http://localhost:8000/api/attempts/1/submit/ \
  -H "Authorization: Token abc123token456" \
  -H "Content-Type: application/json" \
  -d '{
    "responses": [
      { "id": 1, "selected_answer_id": 1 },
      { "id": 2, "selected_answer_id": 2 }
    ]
  }'
```

---

## 📈 Query Performance Optimization

### Efficient Queries

```python
# Get enrollments with course details (avoid N+1)
enrollments = Enrollment.objects.select_related('user', 'course').all()

# Get courses with all lessons (prefetch)
courses = Course.objects.prefetch_related('lessons', 'exams').all()

# Get exam with all questions and answers (nested prefetch)
exam = Exam.objects.prefetch_related(
    Prefetch('questions', queryset=Question.objects.prefetch_related('answers'))
).get(id=exam_id)

# Aggregate enrollments
course_enrollments = Enrollment.objects.filter(
    course=course
).count()
```

---

## 🔗 Relationships Diagram

```
User (auth_user)
├── 1 → ∞ Enrollment
├── 1 → ∞ LessonProgress
├── 1 → ∞ Attempt
└── 1 → ∞ Response (indirectly via Attempt)

Course
├── 1 → ∞ Lesson
├── 1 → ∞ Enrollment
├── 1 → ∞ Exam
└── 1 → ∞ LessonProgress (indirectly)

Lesson
└── 1 → ∞ LessonProgress

Exam
├── 1 → ∞ Question
├── 1 → ∞ Attempt
└── 1 → ∞ Response (indirectly)

Question
├── 1 → ∞ Answer
└── 1 → ∞ Response

Answer
└── 1 → ∞ Response

Attempt
└── 1 → ∞ Response
```

---

This reference provides complete API documentation and database schema for the Course Learning Platform project.

