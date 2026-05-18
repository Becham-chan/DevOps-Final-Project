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
