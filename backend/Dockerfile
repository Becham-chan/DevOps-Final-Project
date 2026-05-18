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
