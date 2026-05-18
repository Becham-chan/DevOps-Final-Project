import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import CourseCard from '../components/CourseCard';
import { GraduationCap, Search, ArrowRight, BookOpen, Award, Users } from 'lucide-react';

const CATEGORIES = ['', 'python', 'web_dev', 'devops', 'data_science', 'cloud'];
const LEVELS = ['', 'beginner', 'intermediate', 'advanced'];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { request, loading } = useApi();
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ category: '', level: '' });
  const [search, setSearch] = useState('');

  useEffect(() => { fetchCourses(); }, [filters]);

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      const url = `/api/courses/${params.toString() ? '?' + params.toString() : ''}`;
      const data = await request('GET', url);
      // DRF pagination returns { count, results: [...] } or plain array
      setCourses(Array.isArray(data) ? data : (data.results ?? []));
    } catch (err) { console.error(err); }
  };

  const filtered = search ? courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase())) : courses;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 backdrop-blur rounded-2xl p-3">
                <GraduationCap size={36} className="text-white" />
              </div>
              <span className="text-indigo-200 font-semibold text-lg">LearnHub Platform</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight">
              Learn. Practice.<br />
              <span className="text-indigo-300">Get Certified.</span>
            </h1>
            <p className="text-indigo-100 text-xl mb-10 max-w-xl">
              Enroll in quality courses, study at your pace, and validate your skills with real exams.
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="flex items-center gap-2 bg-white text-indigo-700 px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl">
                  Start Learning Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="flex items-center gap-2 border-2 border-white/50 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-all">
                  Sign In
                </Link>
              </div>
            ) : (
              <Link to="/dashboard" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-indigo-500/30 bg-indigo-800/30 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-3 gap-4 text-center">
            {[['5+', 'Courses', BookOpen], ['50+', 'Lessons', Award], ['100+', 'Students', Users]].map(([n, l, Icon]) => (
              <div key={l} className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-white">{n}</span>
                <span className="text-indigo-200 text-sm flex items-center gap-1"><Icon size={13} />{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Courses */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search courses..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className="input-field sm:w-48">
            <option value="">All Categories</option>
            <option value="python">Python</option>
            <option value="web_dev">Web Development</option>
            <option value="devops">DevOps</option>
            <option value="data_science">Data Science</option>
            <option value="cloud">Cloud Computing</option>
          </select>
          <select value={filters.level} onChange={e => setFilters(f => ({ ...f, level: e.target.value }))} className="input-field sm:w-44">
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {filtered.length} Course{filtered.length !== 1 ? 's' : ''} Available
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-72 animate-pulse">
                <div className="h-36 bg-gray-200 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500 font-medium">No courses found</p>
            <p className="text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
