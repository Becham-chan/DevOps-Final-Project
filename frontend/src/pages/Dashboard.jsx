import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { BookOpen, CheckCircle, Clock, ArrowRight, Trophy, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { request, loading } = useApi();
  const [enrollments, setEnrollments] = useState([]);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    // DRF pagination returns { count, results: [...] } — unwrap .results
    request('GET', '/api/enrollments/').then(data => {
      setEnrollments(Array.isArray(data) ? data : (data.results ?? []));
    }).catch(() => {});
    request('GET', '/api/attempts/').then(data => {
      setAttempts(Array.isArray(data) ? data : (data.results ?? []));
    }).catch(() => {});
  }, []);

  const completed = enrollments.filter(e => e.is_completed).length;
  const passed = attempts.filter(a => a.is_passed).length;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4.5xl font-extrabold text-slate-900 font-display tracking-tight">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-650">{user?.first_name || user?.username}</span>! 👋
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Here&apos;s a look at your current learning progress</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {[
            { label: 'Enrolled Courses', value: enrollments.length, icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-50/80 border border-violet-100/40' },
            { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50/80 border border-emerald-100/40' },
            { label: 'Exams Taken', value: attempts.length, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50/80 border border-amber-100/40' },
            { label: 'Exams Passed', value: passed, icon: TrendingUp, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50/80 border border-fuchsia-100/40' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-6 flex items-center gap-5 hover:-translate-y-0.5 transition-all">
              <div className={`${bg} rounded-2xl p-3.5 shadow-sm`}>
                <Icon size={24} className={color} />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 font-display">{value}</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Courses */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 font-display">My Courses</h2>
            <Link to="/" className="text-violet-600 text-sm font-bold hover:text-violet-750 flex items-center gap-1 transition-colors">
              Browse more <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <div key={i} className="card h-56 animate-pulse bg-slate-100" />)}
            </div>
          ) : enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map(enrollment => (
                <div key={enrollment.id} className="card overflow-hidden group hover:border-violet-200/50">
                  <div className="bg-gradient-to-r from-violet-600 to-indigo-650 p-6 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
                    <h3 className="text-white font-bold text-lg line-clamp-1 font-display leading-snug">{enrollment.course_detail?.title}</h3>
                    <p className="text-violet-100 text-[11px] font-bold tracking-wider uppercase mt-2 opacity-90">{enrollment.course_detail?.category?.replace('_', ' ')} · {enrollment.course_detail?.level}</p>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between text-sm text-slate-600 mb-2.5">
                      <span className="font-semibold text-slate-500">Progress</span>
                      <span className="font-bold text-violet-600">{enrollment.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-5 overflow-hidden">
                      <div className="bg-gradient-to-r from-violet-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${enrollment.progress_percentage}%` }} />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      {enrollment.is_completed
                        ? <span className="flex items-center gap-1.5 text-emerald-600 text-xs sm:text-sm font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/60"><CheckCircle size={14} />Completed</span>
                        : <span className="flex items-center gap-1.5 text-amber-600 text-xs sm:text-sm font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100/60"><Clock size={14} />In Progress</span>
                      }
                      <Link to={`/course/${enrollment.course}`}
                        className="flex items-center gap-1.5 bg-violet-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-violet-700 hover:shadow-md transition-all active:scale-95">
                        Continue <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-20 px-6 max-w-xl mx-auto">
              <BookOpen size={56} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2 font-display">No enrolled courses</h3>
              <p className="text-slate-400 mb-8 text-sm">You haven&apos;t enrolled in any courses yet. Choose a course and start your learning journey today.</p>
              <Link to="/" className="btn-primary inline-flex items-center gap-2">
                Browse Courses <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* Exam History */}
        {attempts.length > 0 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 font-display">Recent Exam Results</h2>
            <div className="card overflow-hidden border border-slate-100/80 shadow-premium">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100/85">
                      {['Exam Title', 'Course Name', 'Earned Score', 'Passing Status', 'Submitted Date'].map(h => (
                        <th key={h} className="py-4 px-6 text-slate-500 font-extrabold text-[11px] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/70">
                    {attempts.slice(0, 5).map(a => (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4.5 px-6 font-bold text-slate-800 text-sm font-display">{a.exam_title}</td>
                        <td className="py-4.5 px-6 text-slate-550 text-sm">{a.course_title}</td>
                        <td className="py-4.5 px-6 font-extrabold text-violet-650 text-sm">{a.score != null ? `${a.score}%` : 'N/A'}</td>
                        <td className="py-4.5 px-6">
                          {a.is_passed == null ? (
                            <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full font-bold text-xs border border-slate-200/60 shadow-sm">Pending</span>
                          ) : a.is_passed ? (
                            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold text-xs border border-emerald-100/60 shadow-sm inline-flex items-center gap-1">✓ Passed</span>
                          ) : (
                            <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full font-bold text-xs border border-rose-100/60 shadow-sm inline-flex items-center gap-1">✗ Failed</span>
                          )}
                        </td>
                        <td className="py-4.5 px-6 text-slate-400 text-xs font-semibold">{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
