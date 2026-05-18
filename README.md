# 🎓 DevOps Final Project: Course Learning Platform

> A full-stack educational web application designed to facilitate seamless course enrollment, lesson tracking, and exam taking.

This project is a comprehensive Learning Management System (LMS) designed for a DevOps final project. It empowers administrators to manage educational content while providing students with an intuitive interface to browse courses, track their learning progress, and complete assessments. Built with modern web development practices, it emphasizes robust architecture, scalability, and automated CI/CD deployment.

---

## ✨ Key Features

*   **RESTful API Architecture:** Clean and well-documented endpoints for courses, enrollments, and user authentication.
*   **Role-Based Access Control:** Secure handling of Admin and Student user roles.
*   **Course Management:** Browse available courses, view detailed curriculum, and enroll in classes.
*   **Progress Tracking:** Track completed lessons within courses.
*   **Assessment System:** Take exams, submit answers, and receive automated grading.
*   **Responsive UI:** A modern, mobile-friendly interface built with React and Tailwind CSS.
*   **Containerized Environment:** Fully Dockerized for seamless local development and production deployment.

---

## 🛠️ Tech Stack & Architecture

### Technologies

| Layer | Technology / Tool | Version |
| :--- | :--- | :--- |
| **Backend** | Python / Django + Django REST Framework | Python 3.11+ / Django 4.2 |
| **Frontend** | React + Vite + Tailwind CSS | React 19 / Vite 8 / Tailwind 4 |
| **Database** | PostgreSQL | Postgres 15 |
| **Containerization**| Docker & Docker Compose | Latest |
| **CI/CD** | GitHub Actions | - |
| **Deployment** | Render.com | - |

### High-Level Architecture

*   **Frontend (React SPA):** Communicates with the backend via Axios, handling state and UI routing.
*   **Backend (Django API):** Serves as the core logic engine, interacting with the database, handling authentication, and processing business rules (e.g., grading exams).
*   **Database (PostgreSQL):** Stores all persistent data including users, courses, enrollments, and exam attempts.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

*   [Docker](https://docs.docker.com/get-docker/) and Docker Compose
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [Python](https://www.python.org/) (v3.11+ recommended)
*   Git

### Installation & Environment Configuration

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/[Insert GitHub Username]/DevOps-Final-Project.git
    cd DevOps-Final-Project
    ```

2.  **Configure Environment Variables:**
    Copy the example environment file and update it if necessary.
    ```bash
    cp .env.example .env
    ```

### Running the Application (Docker)

The easiest way to run the full stack is using Docker Compose:

```bash
# Build and start all services in the background
docker-compose up --build -d
```

Once the containers are running, the application will be available at:
*   **Frontend:** [http://localhost:5173](http://localhost:5173)
*   **Backend API:** [http://localhost:8000/api/](http://localhost:8000/api/)
*   **Django Admin Panel:** [http://localhost:8000/admin](http://localhost:8000/admin)

> [!NOTE]
> The backend container will automatically run database migrations and populate mock data upon startup. 
> **Demo Admin login:** `admin@example.com` / `admin123`
> **Demo Student login:** `student1@example.com` / `testpass123`
> **Demo Admin Login (Django Dashboard):** `admin` / `admin123`

---

## 🧪 Running Tests

### Backend Tests (Python/Django)
The backend uses `pytest` for testing. To run the test suite, execute the following command inside the backend container:

```bash
docker-compose exec backend pytest
```

*(Alternatively, if running locally without Docker: `cd backend && pytest`)*

### Frontend Checks
The frontend uses ESLint for code quality checks:

```bash
cd frontend
npm run lint
```

---

## 📂 Repository Structure

```text
DevOps-Final-Project/
├── .github/                  # CI/CD workflows (GitHub Actions)
├── backend/                  # Django REST API application
│   ├── config/               # Main Django project settings & routing
│   ├── courses/              # Course, lesson, and enrollment models/views
│   ├── exams/                # Exam, question, and attempt models/views
│   ├── users/                # Custom user models and authentication
│   ├── manage.py             # Django CLI entry point
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React Single Page Application (SPA)
│   ├── public/               # Static public assets
│   ├── src/                  # React source code
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context providers (e.g., Auth)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Main page views (Home, Course, etc.)
│   │   └── services/         # API integration services
│   └── package.json          # Node.js dependencies and scripts
├── .env.example              # Template for environment variables
├── docker-compose.yml        # Docker composition for all services
└── README.md                 # Project documentation
```

---

## 🤝 Contributing

We welcome contributions to improve the platform! To contribute:

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

Please make sure to update tests as appropriate and follow the existing code style.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
*(Note: If a LICENSE file does not exist, consider this a placeholder until the official license is finalized.)*