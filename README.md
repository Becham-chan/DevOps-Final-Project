# Course Learning Platform

A full-stack educational web application built with Django, React, PostgreSQL, and Docker.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 4.2 + Django REST Framework |
| Frontend | React 18 + Vite + Tailwind CSS |
| Database | PostgreSQL 15 |
| Container | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Render.com |

## Quick Start

```bash
# Copy env example
cp .env.example .env

# Build and start all services
docker-compose up --build

# Access the app
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/api/
# Admin Panel: http://localhost:8000/admin  (admin / admin123)
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Student | student1@example.com | testpass123 |
| Student | student2@example.com | testpass123 |

## Project Structure

```
DevOps-Final-Project/
├── backend/          # Django REST API
├── frontend/         # React SPA
├── .github/workflows # CI/CD pipelines
├── docker-compose.yml
└── .env.example
```

## API Endpoints

- `POST /api/auth/register/` — Register
- `POST /api/auth/login/` — Login
- `GET  /api/courses/` — List courses (public)
- `GET  /api/courses/{id}/` — Course detail
- `POST /api/enrollments/` — Enroll in course
- `GET  /api/enrollments/` — My enrollments
- `POST /api/lesson-progress/` — Mark lesson read
- `GET  /api/exams/` — List available exams
- `POST /api/attempts/` — Start exam
- `POST /api/attempts/{id}/submit/` — Submit exam
- `GET  /api/health/` — Health check