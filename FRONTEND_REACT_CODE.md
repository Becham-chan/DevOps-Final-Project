# Frontend Implementation Guide

## Project Structure Setup

### package.json
```json
{
  "name": "course-learning-platform",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2"
  }
}
```

### vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

### tailwind.config.js
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

## Core Context & Services

### src/context/AuthContext.jsx
```javascript
import React, { createContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from stored token
  useEffect(() => {
    if (token) {
      // Verify token is still valid
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await api.get('/api/auth/user/');
      setUser(response.data);
      setError(null);
    } catch (err) {
      // Token is invalid
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = useCallback(async (username, email, password, firstName = '', lastName = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/register/', {
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Registration failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/login/', { email, password });
      
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### src/services/api.js
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Hooks

### src/hooks/useAuth.js
```javascript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### src/hooks/useApi.js
```javascript
import { useState, useCallback } from 'react';
import api from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null) => {
    setLoading(true);
    setError(null);
    try {
      const config = { method, url };
      if (data) config.data = data;
      const response = await api(config);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'An error occurred';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error };
};
```

---

## Protected Routes

### src/components/ProtectedRoute.jsx
```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

---

## Pages

### src/pages/Home.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import CourseCard from '../components/CourseCard';
import { BookOpen, ArrowRight } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { request, loading } = useApi();
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ category: '', level: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      const data = await request('GET', '/api/courses/');
      let filtered = data;
      
      if (filters.category) {
        filtered = filtered.filter(c => c.category === filters.category);
      }
      if (filters.level) {
        filtered = filtered.filter(c => c.level === filters.level);
      }
      
      setCourses(filtered);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <BookOpen size={40} />
            <h1 className="text-5xl font-bold">Course Learning Platform</h1>
          </div>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl">
            Enroll in quality courses, learn at your own pace, and validate your knowledge with exams.
          </p>
          {!isAuthenticated ? (
            <div className="flex gap-4">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Go to Dashboard <ArrowRight size={20} />
            </Link>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Categories</option>
            <option value="python">Python</option>
            <option value="web_dev">Web Development</option>
            <option value="devops">DevOps</option>
            <option value="data_science">Data Science</option>
            <option value="cloud">Cloud Computing</option>
          </select>

          <select
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No courses found. Try different filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
```

### src/pages/Login.jsx
```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Sign In</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
```

### src/pages/Register.jsx
```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Create Account</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
```

### src/pages/Dashboard.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { request, loading } = useApi();
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const data = await request('GET', '/api/enrollments/');
      setEnrollments(data);
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {user?.first_name || user?.username}!</h1>
        <p className="text-gray-600 mb-8">Continue learning and grow your skills</p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32 flex items-end p-4">
                  <BookOpen className="text-white mr-3" size={24} />
                  <h3 className="text-xl font-bold text-white">{enrollment.course_detail.title}</h3>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">{enrollment.course_detail.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">{enrollment.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    {enrollment.is_completed ? (
                      <div className="flex items-center text-green-600 font-semibold">
                        <CheckCircle size={16} className="mr-1" />
                        Completed
                      </div>
                    ) : (
                      <div className="flex items-center text-orange-600 font-semibold">
                        <Clock size={16} className="mr-1" />
                        In Progress
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/course/${enrollment.course}`}
                    className="block mt-4 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Continue Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 mb-4">You haven't enrolled in any courses yet</p>
            <Link to="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
```

### src/pages/CourseDetail.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { BookOpen, Clock, User, PlayCircle } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const { request, loading } = useApi();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await request('GET', `/api/courses/${id}/`);
      setCourse(data);
      setLessons(data.lessons);
      if (data.lessons.length > 0) {
        setSelectedLesson(data.lessons[0]);
      }
    } catch (err) {
      console.error('Failed to fetch course:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-12">Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {course.category}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-600 text-lg mb-6">{course.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Clock size={18} className="mr-2" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <p className="font-semibold">{course.duration_hours} hours</p>
                </div>
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <User size={18} className="mr-2" />
                    <span className="text-sm">Instructor</span>
                  </div>
                  <p className="font-semibold">{course.instructor_name}</p>
                </div>
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <BookOpen size={18} className="mr-2" />
                    <span className="text-sm">Level</span>
                  </div>
                  <p className="font-semibold capitalize">{course.level}</p>
                </div>
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <PlayCircle size={18} className="mr-2" />
                    <span className="text-sm">Lessons</span>
                  </div>
                  <p className="font-semibold">{course.lesson_count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lessons Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Course Content</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedLesson?.id === lesson.id
                        ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <p className="font-semibold">{lesson.title}</p>
                    <p className="text-sm text-gray-600">{lesson.estimated_reading_time} min</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedLesson.title}</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Estimated reading time: {selectedLesson.estimated_reading_time} minutes
                </p>
                
                <div className="prose prose-sm max-w-none text-gray-700 mb-8">
                  <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                </div>

                <div className="flex justify-between pt-6 border-t">
                  <button className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                    ← Previous
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Mark as Complete →
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">Select a lesson to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
```

### src/pages/ExamPage.jsx (Abbreviated)
```javascript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Clock } from 'lucide-react';

const ExamPage = () => {
  const { examId } = useParams();
  const { request, loading } = useApi();
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) return;
    const timer = setInterval(() => setTimeRemaining(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const fetchExam = async () => {
    try {
      const data = await request('GET', `/api/exams/${examId}/`);
      setExam(data);
      startAttempt();
    } catch (err) {
      console.error('Failed to fetch exam:', err);
    }
  };

  const startAttempt = async () => {
    try {
      const data = await request('POST', '/api/attempts/', { exam_id: examId });
      setAttempt(data);
      setTimeRemaining(exam.time_limit_minutes * 60);
    } catch (err) {
      console.error('Failed to start attempt:', err);
    }
  };

  const handleAnswerSelect = (questionId, answerId) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const submitExam = async () => {
    try {
      const submitData = {
        responses: Object.entries(responses).map(([questionId, answerId]) => ({
          question_id: parseInt(questionId),
          selected_answer_id: answerId,
        }))
      };
      await request('POST', `/api/attempts/${attempt.id}/submit/`, submitData);
      // Redirect to results
    } catch (err) {
      console.error('Failed to submit exam:', err);
    }
  };

  if (loading || !exam || !attempt) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Timer and Progress */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{exam.title}</h2>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock size={24} />
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Question {currentQuestionIndex + 1} of {exam.questions.length}
          </p>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{currentQuestion.question_text}</h3>

          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => (
              <label
                key={answer.id}
                className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={answer.id}
                  checked={responses[currentQuestion.id] === answer.id}
                  onChange={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                  className="w-4 h-4"
                />
                <span className="ml-3 text-gray-900">{answer.answer_text}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          
          {currentQuestionIndex === exam.questions.length - 1 ? (
            <button
              onClick={submitExam}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
```

---

## Components

### src/components/Navbar.jsx
```javascript
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-blue-600">
          <BookOpen size={28} />
          Course Platform
        </Link>

        {/* Mobile menu button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <span className="text-gray-700">Welcome, {user?.username}</span>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-50 px-4 py-4 space-y-3">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="block text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link to="/register" className="block bg-blue-600 text-white px-4 py-2 rounded-lg">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
```

### src/components/CourseCard.jsx
```javascript
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, User } from 'lucide-react';

const CourseCard = ({ course }) => {
  return (
    <Link to={`/course/${course.id}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105 cursor-pointer h-full">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32 flex items-end p-4">
          <h3 className="text-xl font-bold text-white">{course.title}</h3>
        </div>

        <div className="p-6">
          <div className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full mb-3 font-semibold">
            {course.category}
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{course.duration_hours} hours</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{course.instructor_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen size={16} />
              <span>{course.lesson_count} lessons</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              course.level === 'beginner' ? 'bg-green-100 text-green-800' :
              course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {course.level}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
```

---

## Main App Router

### src/App.jsx
```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import ExamPage from './pages/ExamPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:id"
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:examId"
              element={
                <ProtectedRoute>
                  <ExamPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}
```

---

## Styling Setup

### src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition;
  }

  .card {
    @apply bg-white rounded-lg shadow-lg;
  }
}
```

