"""Management command to populate mock data."""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from courses.models import Course, Lesson, Enrollment, LessonProgress
from exams.models import Exam, Question, Answer


COURSES_DATA = [
    {
        'title': 'Python Fundamentals',
        'description': 'Master Python programming from scratch. Learn variables, data types, control flow, functions, and object-oriented programming concepts.',
        'category': 'python',
        'level': 'beginner',
        'duration_hours': 40,
        'instructor_name': 'Dr. Sarah Johnson',
        'lessons': [
            {'title': 'Getting Started with Python', 'time': 30, 'content': '<h2>What is Python?</h2><p>Python is a high-level, interpreted programming language known for its clear syntax and readability. Created by Guido van Rossum in 1991, Python has become one of the most popular programming languages in the world.</p><h3>Why Learn Python?</h3><ul><li>Simple and readable syntax</li><li>Versatile - used in web development, data science, AI, automation</li><li>Large community and extensive libraries</li><li>High demand in the job market</li></ul><h3>Installing Python</h3><p>Visit python.org and download the latest version. Make sure to add Python to your PATH during installation.</p><pre><code># Verify installation\npython --version\n# Python 3.11.x</code></pre>'},
            {'title': 'Variables and Data Types', 'time': 45, 'content': '<h2>Variables in Python</h2><p>Variables are containers for storing data values. In Python, you do not need to declare variables with a specific type.</p><pre><code># Integer\nage = 25\n# Float\nheight = 5.9\n# String\nname = "Alice"\n# Boolean\nis_student = True</code></pre><h3>Data Types</h3><p>Python has several built-in data types: int, float, str, bool, list, tuple, dict, set.</p>'},
            {'title': 'Control Flow', 'time': 50, 'content': '<h2>Control Flow in Python</h2><p>Control flow allows you to control the order in which your code executes.</p><h3>If Statements</h3><pre><code>x = 10\nif x > 5:\n    print("x is greater than 5")\nelif x == 5:\n    print("x equals 5")\nelse:\n    print("x is less than 5")</code></pre><h3>Loops</h3><pre><code># For loop\nfor i in range(5):\n    print(i)\n\n# While loop\ncount = 0\nwhile count < 5:\n    print(count)\n    count += 1</code></pre>'},
            {'title': 'Functions and Modules', 'time': 55, 'content': '<h2>Functions</h2><p>Functions are reusable blocks of code that perform a specific task.</p><pre><code>def greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\nresult = greet("Alice")\nprint(result)  # Hello, Alice!</code></pre><h3>Modules</h3><p>Python has a rich standard library. You can import modules to use their functionality.</p><pre><code>import math\nprint(math.sqrt(16))  # 4.0\n\nfrom datetime import datetime\nnow = datetime.now()</code></pre>'},
            {'title': 'Object-Oriented Programming', 'time': 60, 'content': '<h2>OOP in Python</h2><p>Object-Oriented Programming is a paradigm that organizes software around objects and data.</p><pre><code>class Animal:\n    def __init__(self, name, species):\n        self.name = name\n        self.species = species\n    \n    def speak(self):\n        return f"{self.name} makes a sound"\n\nclass Dog(Animal):\n    def speak(self):\n        return f"{self.name} barks!"\n\ndog = Dog("Rex", "Canine")\nprint(dog.speak())</code></pre>'},
        ],
        'exam': {
            'title': 'Python Fundamentals Assessment',
            'description': 'Test your understanding of Python basics.',
            'pass_score': 70,
            'time_limit_minutes': 30,
            'questions': [
                {'text': 'Which of the following is the correct way to declare a variable in Python?', 'type': 'multiple_choice', 'answers': [('x = 10', True), ('int x = 10', False), ('var x = 10', False), ('x := 10', False)]},
                {'text': 'What is the output of print(type(3.14))?', 'type': 'multiple_choice', 'answers': [('<class "float">', True), ('<class "int">', False), ('<class "double">', False), ('<class "number">', False)]},
                {'text': 'Python is a compiled language.', 'type': 'true_false', 'answers': [('True', False), ('False', True)]},
                {'text': 'Which keyword is used to define a function in Python?', 'type': 'multiple_choice', 'answers': [('def', True), ('function', False), ('fun', False), ('define', False)]},
                {'text': 'What does the len() function do?', 'type': 'multiple_choice', 'answers': [('Returns the length of an object', True), ('Returns the last element', False), ('Deletes an element', False), ('Sorts a list', False)]},
                {'text': 'Lists in Python are mutable (can be changed after creation).', 'type': 'true_false', 'answers': [('True', True), ('False', False)]},
                {'text': 'Which of the following is used for single-line comments in Python?', 'type': 'multiple_choice', 'answers': [('#', True), ('//', False), ('/*', False), ('--', False)]},
                {'text': 'What is the correct way to create a class in Python?', 'type': 'multiple_choice', 'answers': [('class MyClass:', True), ('Class MyClass:', False), ('def MyClass:', False), ('create class MyClass:', False)]},
            ]
        }
    },
    {
        'title': 'Web Development with Django',
        'description': 'Build powerful web applications using Django, the Python web framework. Covers models, views, templates, REST APIs, and deployment.',
        'category': 'web_dev',
        'level': 'intermediate',
        'duration_hours': 60,
        'instructor_name': 'Prof. Michael Chen',
        'lessons': [
            {'title': 'Django Architecture and Setup', 'time': 40, 'content': '<h2>Django MTV Architecture</h2><p>Django follows the Model-Template-View (MTV) architectural pattern, similar to MVC.</p><ul><li><strong>Model:</strong> Defines data structure</li><li><strong>Template:</strong> Handles presentation</li><li><strong>View:</strong> Handles business logic</li></ul><h3>Setting Up Django</h3><pre><code>pip install django\ndjango-admin startproject myproject\ncd myproject\npython manage.py runserver</code></pre>'},
            {'title': 'Models and Database', 'time': 50, 'content': '<h2>Django Models</h2><p>Models define your database schema using Python classes.</p><pre><code>from django.db import models\n\nclass Post(models.Model):\n    title = models.CharField(max_length=200)\n    content = models.TextField()\n    created_at = models.DateTimeField(auto_now_add=True)\n    \n    def __str__(self):\n        return self.title</code></pre><h3>Migrations</h3><pre><code>python manage.py makemigrations\npython manage.py migrate</code></pre>'},
            {'title': 'Views and URL Routing', 'time': 45, 'content': '<h2>Django Views</h2><p>Views handle HTTP requests and return responses.</p><pre><code>from django.http import HttpResponse\nfrom django.shortcuts import render\n\ndef home(request):\n    posts = Post.objects.all()\n    return render(request, "home.html", {"posts": posts})</code></pre><h3>URL Configuration</h3><pre><code>from django.urls import path\nfrom . import views\n\nurlpatterns = [\n    path("", views.home, name="home"),\n]</code></pre>'},
            {'title': 'Django REST Framework', 'time': 55, 'content': '<h2>Building REST APIs</h2><p>Django REST Framework (DRF) makes it easy to build REST APIs.</p><pre><code>from rest_framework import serializers, viewsets\nfrom .models import Post\n\nclass PostSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Post\n        fields = ["id", "title", "content", "created_at"]\n\nclass PostViewSet(viewsets.ModelViewSet):\n    queryset = Post.objects.all()\n    serializer_class = PostSerializer</code></pre>'},
            {'title': 'Authentication and Security', 'time': 50, 'content': '<h2>Django Authentication</h2><p>Django provides built-in authentication system.</p><pre><code>from django.contrib.auth.decorators import login_required\n\n@login_required\ndef profile(request):\n    return render(request, "profile.html")\n\n# Token Authentication with DRF\nfrom rest_framework.authtoken.models import Token\ntoken, created = Token.objects.get_or_create(user=user)</code></pre>'},
        ],
        'exam': {
            'title': 'Django Web Development Quiz',
            'description': 'Evaluate your Django knowledge.',
            'pass_score': 70,
            'time_limit_minutes': 35,
            'questions': [
                {'text': 'What does MTV stand for in Django?', 'type': 'multiple_choice', 'answers': [('Model-Template-View', True), ('Model-Table-View', False), ('Module-Template-View', False), ('Model-Template-Variable', False)]},
                {'text': 'Which command creates database tables from Django models?', 'type': 'multiple_choice', 'answers': [('python manage.py migrate', True), ('python manage.py createtables', False), ('python manage.py syncdb', False), ('python manage.py update', False)]},
                {'text': 'Django ORM prevents SQL injection by default.', 'type': 'true_false', 'answers': [('True', True), ('False', False)]},
                {'text': 'What is the purpose of urls.py in Django?', 'type': 'multiple_choice', 'answers': [('URL routing configuration', True), ('Database configuration', False), ('Settings configuration', False), ('Template configuration', False)]},
                {'text': 'Which DRF class provides CRUD operations automatically?', 'type': 'multiple_choice', 'answers': [('ModelViewSet', True), ('APIView', False), ('GenericView', False), ('CRUDView', False)]},
                {'text': 'Django supports multiple databases simultaneously.', 'type': 'true_false', 'answers': [('True', True), ('False', False)]},
            ]
        }
    },
    {
        'title': 'DevOps Fundamentals',
        'description': 'Learn essential DevOps practices including Docker, CI/CD, infrastructure as code, monitoring, and cloud deployments.',
        'category': 'devops',
        'level': 'beginner',
        'duration_hours': 50,
        'instructor_name': 'Alex Rodriguez',
        'lessons': [
            {'title': 'Introduction to DevOps', 'time': 35, 'content': '<h2>What is DevOps?</h2><p>DevOps is a set of practices that combines software development (Dev) and IT operations (Ops) to shorten the development lifecycle.</p><h3>Core Principles</h3><ul><li>Continuous Integration</li><li>Continuous Delivery</li><li>Infrastructure as Code</li><li>Monitoring and Logging</li><li>Communication and Collaboration</li></ul>'},
            {'title': 'Docker and Containerization', 'time': 55, 'content': '<h2>Docker Fundamentals</h2><p>Docker allows you to package applications and their dependencies into containers.</p><pre><code># Dockerfile example\nFROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD ["python", "app.py"]</code></pre><h3>Common Docker Commands</h3><pre><code>docker build -t myapp .\ndocker run -p 8000:8000 myapp\ndocker ps\ndocker-compose up -d</code></pre>'},
            {'title': 'CI/CD with GitHub Actions', 'time': 50, 'content': '<h2>GitHub Actions</h2><p>GitHub Actions automates your software workflows directly in your GitHub repository.</p><pre><code>name: CI Pipeline\non:\n  push:\n    branches: [main]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - name: Run tests\n        run: pytest</code></pre>'},
            {'title': 'Cloud Deployment with Render', 'time': 40, 'content': '<h2>Deploying to Render</h2><p>Render is a cloud platform for deploying web applications.</p><h3>Deployment Steps</h3><ol><li>Connect your GitHub repository</li><li>Configure build and start commands</li><li>Set environment variables</li><li>Deploy with automatic scaling</li></ol><h3>Render Services</h3><ul><li>Web Services (Django, Node.js)</li><li>Static Sites (React, Vue)</li><li>PostgreSQL Databases</li></ul>'},
        ],
        'exam': {
            'title': 'DevOps Fundamentals Exam',
            'description': 'Test your DevOps knowledge.',
            'pass_score': 65,
            'time_limit_minutes': 25,
            'questions': [
                {'text': 'What does CI stand for in CI/CD?', 'type': 'multiple_choice', 'answers': [('Continuous Integration', True), ('Continuous Infrastructure', False), ('Code Integration', False), ('Container Integration', False)]},
                {'text': 'Docker containers share the host OS kernel.', 'type': 'true_false', 'answers': [('True', True), ('False', False)]},
                {'text': 'Which file defines a Docker container image?', 'type': 'multiple_choice', 'answers': [('Dockerfile', True), ('docker.yml', False), ('container.json', False), ('image.conf', False)]},
                {'text': 'What is Infrastructure as Code (IaC)?', 'type': 'multiple_choice', 'answers': [('Managing infrastructure using configuration files', True), ('Writing code on servers', False), ('A programming language', False), ('A cloud provider', False)]},
                {'text': 'GitHub Actions workflows are defined in YAML files.', 'type': 'true_false', 'answers': [('True', True), ('False', False)]},
                {'text': 'Which command starts all services in docker-compose?', 'type': 'multiple_choice', 'answers': [('docker-compose up', True), ('docker-compose start-all', False), ('docker run-all', False), ('docker-compose run', False)]},
            ]
        }
    },
    {
        'title': 'React Essentials',
        'description': 'Build modern user interfaces with React. Learn components, hooks, state management, routing, and API integration.',
        'category': 'web_dev',
        'level': 'intermediate',
        'duration_hours': 45,
        'instructor_name': 'Emma Williams',
        'lessons': [
            {'title': 'React Fundamentals', 'time': 40, 'content': '<h2>Introduction to React</h2><p>React is a JavaScript library for building user interfaces, maintained by Meta.</p><h3>JSX Syntax</h3><pre><code>function Welcome({ name }) {\n  return (\n    &lt;div className="welcome"&gt;\n      &lt;h1&gt;Hello, {name}!&lt;/h1&gt;\n      &lt;p&gt;Welcome to React&lt;/p&gt;\n    &lt;/div&gt;\n  );\n}\n\nexport default Welcome;</code></pre>'},
            {'title': 'State and Hooks', 'time': 50, 'content': '<h2>React Hooks</h2><p>Hooks let you use state and other React features in function components.</p><pre><code>import { useState, useEffect } from "react";\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  useEffect(() =&gt; {\n    document.title = `Count: ${count}`;\n  }, [count]);\n  \n  return (\n    &lt;button onClick={() =&gt; setCount(count + 1)}&gt;\n      Count: {count}\n    &lt;/button&gt;\n  );\n}</code></pre>'},
            {'title': 'React Router', 'time': 35, 'content': '<h2>Client-Side Routing</h2><p>React Router enables navigation in single-page applications.</p><pre><code>import { BrowserRouter, Routes, Route } from "react-router-dom";\n\nfunction App() {\n  return (\n    &lt;BrowserRouter&gt;\n      &lt;Routes&gt;\n        &lt;Route path="/" element={&lt;Home /&gt;} /&gt;\n        &lt;Route path="/about" element={&lt;About /&gt;} /&gt;\n      &lt;/Routes&gt;\n    &lt;/BrowserRouter&gt;\n  );\n}</code></pre>'},
            {'title': 'API Integration with Axios', 'time': 45, 'content': '<h2>Fetching Data</h2><p>Axios is a popular HTTP client for making API requests in React.</p><pre><code>import axios from "axios";\nimport { useState, useEffect } from "react";\n\nfunction Users() {\n  const [users, setUsers] = useState([]);\n  \n  useEffect(() =&gt; {\n    axios.get("/api/users/")\n      .then(res =&gt; setUsers(res.data))\n      .catch(err =&gt; console.error(err));\n  }, []);\n  \n  return &lt;ul&gt;{users.map(u =&gt; &lt;li key={u.id}&gt;{u.name}&lt;/li&gt;)}&lt;/ul&gt;;\n}</code></pre>'},
        ],
        'exam': {
            'title': 'React Essentials Quiz',
            'description': 'Assess your React skills.',
            'pass_score': 70,
            'time_limit_minutes': 30,
            'questions': [
                {'text': 'What hook is used to manage local component state?', 'type': 'multiple_choice', 'answers': [('useState', True), ('useEffect', False), ('useContext', False), ('useReducer', False)]},
                {'text': 'React components must return a single root element.', 'type': 'true_false', 'answers': [('True', True), ('False', False)]},
                {'text': 'What does JSX stand for?', 'type': 'multiple_choice', 'answers': [('JavaScript XML', True), ('JavaScript Extension', False), ('Java Syntax Extension', False), ('JSON XML', False)]},
                {'text': 'Which hook is used for side effects in React?', 'type': 'multiple_choice', 'answers': [('useEffect', True), ('useState', False), ('useMemo', False), ('useCallback', False)]},
                {'text': 'React Router provides client-side navigation.', 'type': 'true_false', 'answers': [('True', True), ('False', False)]},
                {'text': 'What is the correct way to pass data to a child component?', 'type': 'multiple_choice', 'answers': [('props', True), ('state', False), ('context', False), ('refs', False)]},
            ]
        }
    },
    {
        'title': 'Cloud Computing with AWS',
        'description': 'Explore cloud computing fundamentals using Amazon Web Services. Covers EC2, S3, RDS, Lambda, and cloud architecture patterns.',
        'category': 'cloud',
        'level': 'advanced',
        'duration_hours': 80,
        'instructor_name': 'David Park',
        'lessons': [
            {'title': 'Cloud Computing Fundamentals', 'time': 45, 'content': '<h2>What is Cloud Computing?</h2><p>Cloud computing delivers computing services over the internet, including servers, storage, databases, networking, and analytics.</p><h3>Service Models</h3><ul><li><strong>IaaS:</strong> Infrastructure as a Service (EC2, VMs)</li><li><strong>PaaS:</strong> Platform as a Service (Heroku, App Engine)</li><li><strong>SaaS:</strong> Software as a Service (Gmail, Salesforce)</li></ul><h3>Deployment Models</h3><ul><li>Public Cloud</li><li>Private Cloud</li><li>Hybrid Cloud</li></ul>'},
            {'title': 'AWS EC2 and Compute', 'time': 60, 'content': '<h2>Amazon EC2</h2><p>EC2 provides resizable compute capacity in the cloud.</p><h3>Instance Types</h3><ul><li><strong>t3.micro:</strong> Free tier, general purpose</li><li><strong>m5.large:</strong> Memory optimized</li><li><strong>c5.xlarge:</strong> Compute optimized</li></ul><h3>Key Concepts</h3><ul><li>AMI (Amazon Machine Image)</li><li>Security Groups</li><li>Key Pairs</li><li>Elastic IPs</li></ul>'},
            {'title': 'S3 and Storage', 'time': 50, 'content': '<h2>Amazon S3</h2><p>S3 provides object storage with high durability and availability.</p><pre><code>import boto3\n\ns3 = boto3.client("s3")\n\n# Upload file\ns3.upload_file("local.txt", "my-bucket", "remote.txt")\n\n# Download file\ns3.download_file("my-bucket", "remote.txt", "local.txt")\n\n# List objects\nresponse = s3.list_objects_v2(Bucket="my-bucket")</code></pre>'},
            {'title': 'RDS and Databases', 'time': 55, 'content': '<h2>Amazon RDS</h2><p>RDS makes it easy to set up, operate, and scale relational databases in the cloud.</p><h3>Supported Engines</h3><ul><li>PostgreSQL</li><li>MySQL</li><li>MariaDB</li><li>Oracle</li><li>SQL Server</li></ul><h3>Key Features</h3><ul><li>Automated backups</li><li>Multi-AZ deployments</li><li>Read replicas</li><li>Automatic scaling</li></ul>'},
        ],
        'exam': {
            'title': 'AWS Cloud Fundamentals Exam',
            'description': 'Test your AWS and cloud knowledge.',
            'pass_score': 75,
            'time_limit_minutes': 40,
            'questions': [
                {'text': 'What does IaaS stand for?', 'type': 'multiple_choice', 'answers': [('Infrastructure as a Service', True), ('Internet as a Service', False), ('Integration as a Service', False), ('Interface as a Service', False)]},
                {'text': 'Amazon S3 is a compute service.', 'type': 'true_false', 'answers': [('True', False), ('False', True)]},
                {'text': 'Which AWS service provides virtual machines?', 'type': 'multiple_choice', 'answers': [('EC2', True), ('S3', False), ('RDS', False), ('Lambda', False)]},
                {'text': 'RDS supports automated database backups.', 'type': 'true_false', 'answers': [('True', True), ('False', False)]},
                {'text': 'What is the AWS free tier EC2 instance type?', 'type': 'multiple_choice', 'answers': [('t2.micro / t3.micro', True), ('m5.large', False), ('c5.xlarge', False), ('r5.2xlarge', False)]},
                {'text': 'Which AWS service provides serverless functions?', 'type': 'multiple_choice', 'answers': [('Lambda', True), ('EC2', False), ('ECS', False), ('Fargate', False)]},
            ]
        }
    },
]


class Command(BaseCommand):
    help = 'Populate database with mock course data'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing data first')

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Course.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()

        self.stdout.write('Creating courses and exams...')

        for course_data in COURSES_DATA:
            exam_data = course_data.pop('exam')
            lessons_data = course_data.pop('lessons')

            course, created = Course.objects.get_or_create(
                title=course_data['title'],
                defaults=course_data
            )

            if created:
                self.stdout.write(f'  Created course: {course.title}')

                for i, lesson_data in enumerate(lessons_data, 1):
                    Lesson.objects.create(
                        course=course,
                        order=i,
                        title=lesson_data['title'],
                        content=lesson_data['content'],
                        estimated_reading_time=lesson_data['time'],
                    )

                exam = Exam.objects.create(
                    course=course,
                    title=exam_data['title'],
                    description=exam_data['description'],
                    pass_score=exam_data['pass_score'],
                    time_limit_minutes=exam_data['time_limit_minutes'],
                )

                for q_idx, q_data in enumerate(exam_data['questions'], 1):
                    question = Question.objects.create(
                        exam=exam,
                        question_text=q_data['text'],
                        question_type=q_data['type'],
                        order=q_idx,
                    )
                    for a_idx, (answer_text, is_correct) in enumerate(q_data['answers'], 1):
                        Answer.objects.create(
                            question=question,
                            answer_text=answer_text,
                            is_correct=is_correct,
                            order=a_idx,
                        )

        # Create demo students
        demo_students = [
            {'username': 'student1', 'email': 'student1@example.com', 'first_name': 'Alice', 'last_name': 'Smith'},
            {'username': 'student2', 'email': 'student2@example.com', 'first_name': 'Bob', 'last_name': 'Jones'},
            {'username': 'student3', 'email': 'student3@example.com', 'first_name': 'Carol', 'last_name': 'Davis'},
        ]

        for student_data in demo_students:
            user, created = User.objects.get_or_create(
                username=student_data['username'],
                defaults={**student_data, 'is_active': True}
            )
            if created:
                user.set_password('testpass123')
                user.save()
                self.stdout.write(f'  Created student: {user.username}')

                # Enroll first student in first 2 courses
                if user.username == 'student1':
                    courses = Course.objects.all()[:2]
                    for course in courses:
                        Enrollment.objects.get_or_create(user=user, course=course)

        self.stdout.write(self.style.SUCCESS('Mock data populated successfully!'))
        self.stdout.write(f'  Courses: {Course.objects.count()}')
        self.stdout.write(f'  Lessons: {Lesson.objects.count()}')
        self.stdout.write(f'  Exams: {Exam.objects.count()}')
        self.stdout.write(f'  Questions: {Question.objects.count()}')
