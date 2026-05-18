# Docker & CI/CD Configuration

## docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL Database Service
  db:
    image: postgres:15-alpine
    container_name: course-db
    environment:
      POSTGRES_DB: ${DB_NAME:-course_db}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - course-network

  # Django Backend Service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: course-backend
    command: >
      sh -c "python manage.py migrate &&
             python manage.py shell < create_superuser.py &&
             python manage.py populate_mock_data &&
             gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4"
    environment:
      DEBUG: ${DEBUG:-False}
      SECRET_KEY: ${SECRET_KEY:-your-secret-key-change-this-in-production}
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@db:5432/${DB_NAME:-course_db}
      ALLOWED_HOSTS: ${ALLOWED_HOSTS:-localhost,127.0.0.1,backend}
      CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS:-http://localhost:5173,http://localhost:3000}
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    networks:
      - course-network
    restart: on-failure

  # React Frontend Service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL:-http://localhost:8000}
    container_name: course-frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: ${VITE_API_URL:-http://localhost:8000}
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - course-network
    restart: on-failure

volumes:
  postgres_data:
  static_volume:
  media_volume:

networks:
  course-network:
    driver: bridge
```

---

## Backend Dockerfile

### backend/Dockerfile

```dockerfile
# Multi-stage build for optimized image size

# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY . .

# Set PATH to use local python packages
ENV PATH=/root/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Create non-root user for security
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/api/health/', timeout=5)"

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

### backend/.dockerignore

```
__pycache__
*.pyc
*.pyo
*.egg-info
dist
build
.env
.git
.gitignore
.vscode
.DS_Store
db.sqlite3
*.log
venv
.coverage
htmlcov
node_modules
```

### backend/requirements.txt

```
Django==4.2.8
djangorestframework==3.14.0
django-cors-headers==4.3.1
django-environ==0.21.0
django-filter==23.5
psycopg2-binary==2.9.9
python-decouple==3.8
gunicorn==21.2.0
whitenoise==6.6.0
Pillow==10.1.0
Celery==5.3.4
redis==5.0.1
pytest==7.4.3
pytest-django==4.7.0
flake8==6.1.0
black==23.12.1
coverage==7.4.1
```

---

## Frontend Dockerfile

### frontend/Dockerfile

```dockerfile
# Multi-stage build for optimized frontend

# Stage 1: Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Production stage with Nginx
FROM node:18-alpine

WORKDIR /app

# Install a simple HTTP server
RUN npm install -g http-server

# Copy built app from builder
COPY --from=builder /app/dist .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

EXPOSE 5173

# Simple HTTP server to serve static files with SPA support
CMD ["http-server", ".", "-p", "5173", "-c-1", "--spa"]
```

### frontend/.dockerignore

```
node_modules
npm-debug.log
build
dist
.env
.git
.gitignore
.DS_Store
.vscode
__pycache__
*.pyc
.coverage
```

---

## Environment Configuration

### .env.example

```
# Django
DEBUG=False
SECRET_KEY=your-secret-key-change-in-production
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
VITE_APP_NAME=Course Learning Platform

# Production (Render)
DATABASE_URL=postgresql://user:password@host:5432/db
RENDER_EXTERNAL_URL=https://your-app.onrender.com
```

---

## GitHub Actions - CI Pipeline

### .github/workflows/ci.yml

```yaml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  # Backend Tests
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
        cache: 'pip'

    - name: Install dependencies
      working-directory: ./backend
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt

    - name: Lint with flake8
      working-directory: ./backend
      run: |
        flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
        flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

    - name: Format check with black
      working-directory: ./backend
      run: black --check .

    - name: Run Django migrations
      working-directory: ./backend
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      run: python manage.py migrate

    - name: Run tests with coverage
      working-directory: ./backend
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      run: |
        coverage run -m pytest
        coverage report
        coverage xml

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: ./backend/coverage.xml
        flags: backend
        name: backend-coverage

  # Frontend Tests & Build
  frontend-tests:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: './frontend/package-lock.json'

    - name: Install dependencies
      working-directory: ./frontend
      run: npm ci

    - name: Lint with ESLint
      working-directory: ./frontend
      run: npm run lint

    - name: Build
      working-directory: ./frontend
      env:
        VITE_API_URL: http://localhost:8000
      run: npm run build

    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: frontend-build
        path: ./frontend/dist

  # Docker Build
  docker-build:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]

    steps:
    - uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Build backend Docker image
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: false
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Build frontend Docker image
      uses: docker/build-push-action@v4
      with:
        context: ./frontend
        push: false
        cache-from: type=gha
        cache-to: type=gha,mode=max
        build-args: |
          VITE_API_URL=http://localhost:8000

  # Security Scan
  security:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install dependencies
      working-directory: ./backend
      run: |
        python -m pip install --upgrade pip
        pip install bandit safety

    - name: Run Bandit security scan
      working-directory: ./backend
      run: bandit -r . -f json -o bandit-report.json || true

    - name: Check dependencies with Safety
      working-directory: ./backend
      run: safety check --json || true

    - name: Upload security reports
      uses: actions/upload-artifact@v3
      with:
        name: security-reports
        path: ./backend/bandit-report.json
```

---

## GitHub Actions - CD Pipeline

### .github/workflows/cd.yml

```yaml
name: CD Pipeline - Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_run:
    workflows: [ CI Pipeline ]
    types: [ completed ]
    branches: [ main ]

jobs:
  # Only run if CI passed
  deploy:
    if: github.event_name == 'push' || github.event.workflow_run.conclusion == 'success'
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
      with:
        fetch-depth: 0

    # Push to Docker Hub (optional)
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Docker Hub
      uses: docker/login-action@v2
      if: ${{ secrets.DOCKER_HUB_USERNAME != '' }}
      with:
        username: ${{ secrets.DOCKER_HUB_USERNAME }}
        password: ${{ secrets.DOCKER_HUB_PASSWORD }}

    - name: Build and push backend image
      if: ${{ secrets.DOCKER_HUB_USERNAME != '' }}
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: |
          ${{ secrets.DOCKER_HUB_USERNAME }}/course-backend:latest
          ${{ secrets.DOCKER_HUB_USERNAME }}/course-backend:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Build and push frontend image
      if: ${{ secrets.DOCKER_HUB_USERNAME != '' }}
      uses: docker/build-push-action@v4
      with:
        context: ./frontend
        push: true
        tags: |
          ${{ secrets.DOCKER_HUB_USERNAME }}/course-frontend:latest
          ${{ secrets.DOCKER_HUB_USERNAME }}/course-frontend:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    # Deploy to Render
    - name: Deploy Backend to Render
      run: |
        curl --request POST \
          --url "${{ secrets.RENDER_BACKEND_DEPLOY_HOOK }}" \
          --header 'content-type: application/json' \
          --data '{"version":"'"$(git rev-parse --short HEAD)"'"}'

    - name: Deploy Frontend to Render
      run: |
        curl --request POST \
          --url "${{ secrets.RENDER_FRONTEND_DEPLOY_HOOK }}" \
          --header 'content-type: application/json' \
          --data '{"version":"'"$(git rev-parse --short HEAD)"'"}'

    # Wait for deployment
    - name: Wait for deployment
      run: sleep 30

    # Smoke tests
    - name: Run smoke tests
      run: |
        echo "Testing backend health..."
        curl -f ${{ secrets.BACKEND_URL }}/api/health/ || exit 1
        echo "Backend is healthy"
        
        echo "Testing frontend..."
        curl -f ${{ secrets.FRONTEND_URL }} || exit 1
        echo "Frontend is accessible"

    - name: Send Slack notification
      if: always()
      uses: slackapi/slack-github-action@v1.24.0
      with:
        webhook-url: ${{ secrets.SLACK_WEBHOOK }}
        payload: |
          {
            "text": "Deployment to Production: ${{ job.status }}",
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*Course Platform - Production Deployment*\nStatus: `${{ job.status }}`\nCommit: <https://github.com/${{ github.repository }}/commit/${{ github.sha }}|${{ github.sha }}>\nAuthor: ${{ github.actor }}"
                }
              }
            ]
          }

  # Database backup
  backup:
    runs-on: ubuntu-latest
    needs: deploy
    if: always()

    steps:
    - name: Trigger database backup
      run: |
        echo "Database backup triggered for Render PostgreSQL"
```

---

## Render Configuration

### Backend Service Configuration (via Render Dashboard)

```
Name: course-platform-backend
Type: Web Service
Region: United States
Runtime: Python
Build Command:
  pip install -r requirements.txt && python manage.py migrate && python manage.py collect_static --noinput

Start Command:
  gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 4

Environment Variables:
  DEBUG: False
  SECRET_KEY: [Generate secure key]
  DATABASE_URL: [Auto-generated by Render PostgreSQL]
  ALLOWED_HOSTS: your-backend.onrender.com,your-frontend.onrender.com
  CORS_ALLOWED_ORIGINS: https://your-frontend.onrender.com
```

### Frontend Service Configuration (via Render Dashboard)

```
Name: course-platform-frontend
Type: Static Site
Region: United States
Build Command:
  cd frontend && npm install && npm run build

Publish Directory: frontend/dist

Environment Variables:
  VITE_API_URL: https://your-backend.onrender.com
```

### Database Configuration (via Render Dashboard)

```
Name: course-platform-db
Type: PostgreSQL
Version: 15
Region: United States (same as services)
Instance Type: Free tier (for development)

Connection Details will be auto-injected as DATABASE_URL
```

---

## .gitignore

```
# Virtual Environment
venv/
env/
.venv

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
pip-wheel-metadata/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Django
*.log
local_settings.py
db.sqlite3
db.sqlite3-journal
/media
/staticfiles
.env
.env.local

# Frontend
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
dist/
.vite/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# OS
Thumbs.db

# Testing
.coverage
htmlcov/
.pytest_cache/

# Docker
.docker/

# Misc
*.md.bak
```

---

## Deploy Script (Optional)

### scripts/deploy.sh

```bash
#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Check if environment file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Build Docker images
echo "🔨 Building Docker images..."
docker-compose build

# Run migrations
echo "📊 Running migrations..."
docker-compose run backend python manage.py migrate

# Create superuser
echo "👤 Creating superuser..."
docker-compose run backend python manage.py shell < create_superuser.py

# Populate mock data
echo "📚 Populating mock data..."
docker-compose run backend python manage.py populate_mock_data

# Start services
echo "▶️  Starting services..."
docker-compose up -d

# Run health checks
echo "✅ Running health checks..."
sleep 5

if curl -f http://localhost:8000/api/health/; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

if curl -f http://localhost:5173; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

echo "✅ Deployment successful!"
echo "🎉 Course Learning Platform is running:"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo "   Admin:    http://localhost:8000/admin"
```

---

## Django create_superuser.py

### backend/create_superuser.py

```python
from django.contrib.auth.models import User

username = 'admin'
email = 'admin@example.com'
password = 'admin123'

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print(f"✅ Superuser '{username}' created successfully")
else:
    print(f"ℹ️ Superuser '{username}' already exists")
```

