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
    <div className="min-h-screen bg-slate-50">
      {/* Premium Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden border-b border-slate-800/30">
        {/* Glowing Decorative Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-650/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-650/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto px-4 py-24 sm:py-32 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 shadow-lg">
                <GraduationCap size={28} className="text-violet-400" />
              </div>
              <span className="text-violet-300 font-bold text-sm tracking-wider uppercase">LearnHub Platform</span>
            </div>
            <h1 className="text-4xl sm:text-6.5xl font-extrabold mb-6 leading-[1.1] tracking-tight font-display">
              Learn. Practice.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-300">Get Certified.</span>
            </h1>
            <p className="text-slate-300 text-lg sm:text-xl mb-12 max-w-xl leading-relaxed">
              Enroll in high-quality DevOps and Web courses, study at your own pace, and validate your skills with real exams.
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="flex items-center gap-2 bg-white text-violet-750 px-8 py-4 rounded-xl font-extrabold hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl hover:shadow-violet-950/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
                  Start Learning Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="flex items-center gap-2 border border-slate-700/60 bg-slate-800/40 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800/80 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all">
                  Sign In
                </Link>
              </div>
            ) : (
              <Link to="/dashboard" className="inline-flex items-center gap-2 bg-white text-violet-750 px-8 py-4 rounded-xl font-extrabold hover:bg-slate-50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all shadow-lg">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-slate-800/30 bg-slate-950/20 backdrop-blur-md relative z-10">
          <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-3 gap-4 text-center">
            {[['5+', 'Courses', BookOpen], ['50+', 'Lessons', Award], ['100+', 'Students', Users]].map(([n, l, Icon]) => (
              <div key={l} className="flex flex-col items-center gap-1">
                <span className="text-2xl sm:text-3.5xl font-extrabold text-white font-display">{n}</span>
                <span className="text-slate-400 text-xs sm:text-sm font-semibold flex items-center gap-1.5 justify-center"><Icon size={14} className="text-violet-400" />{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Courses */}
      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450 group-focus-within:text-violet-550 transition-colors" />
            <input
              type="text" placeholder="Search courses..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-11 shadow-sm hover:border-slate-350"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className="input-field sm:w-52 shadow-sm cursor-pointer hover:border-slate-350">
              <option value="">All Categories</option>
              <option value="python">Python</option>
              <option value="web_dev">Web Development</option>
              <option value="devops">DevOps</option>
              <option value="data_science">Data Science</option>
              <option value="cloud">Cloud Computing</option>
            </select>
            <select value={filters.level} onChange={e => setFilters(f => ({ ...f, level: e.target.value }))} className="input-field sm:w-48 shadow-sm cursor-pointer hover:border-slate-350">
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-8 font-display">
          {filtered.length} Course{filtered.length !== 1 ? 's' : ''} Available
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-80 animate-pulse overflow-hidden bg-white">
                <div className="h-36 bg-slate-100" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                  <div className="h-6 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <BookOpen size={56} className="mx-auto text-slate-200 mb-4" />
            <p className="text-xl text-slate-600 font-bold font-display">No courses found</p>
            <p className="text-slate-400 mt-2 text-sm">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
