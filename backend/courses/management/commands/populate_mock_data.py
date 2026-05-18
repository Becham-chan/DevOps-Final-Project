om django.core.management.base import BaseCommand
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
``
