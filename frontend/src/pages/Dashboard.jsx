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
    request('GET', '/api/enrollments/').then(setEnrollments).catch(() => {});
    request('GET', '/api/attempts/').then(setAttempts).catch(() => {});
  }, []);

  const completed = enrollments.filter(e => e.is_completed).length;
  const passed = attempts.filter(a => a.is_passed).length;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome back, <span className="text-indigo-600">{user?.first_name || user?.username}</span>! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's your learning progress</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Enrolled', value: enrollments.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Exams Taken', value: attempts.length, icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Exams Passed', value: passed, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className={`${bg} rounded-xl p-3`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-800">My Courses</h2>
            <Link to="/" className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1">
              Browse more <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => <div key={i} className="card h-52 animate-pulse bg-gray-100" />)}
            </div>
          ) : enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrollments.map(enrollment => (
                <div key={enrollment.id} className="card overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5">
                    <h3 className="text-white font-bold text-lg line-clamp-1">{enrollment.course_detail?.title}</h3>
                    <p className="text-indigo-100 text-xs mt-1 capitalize">{enrollment.course_detail?.category?.replace('_', ' ')} · {enrollment.course_detail?.level}</p>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span className="font-medium">Progress</span>
                      <span className="font-bold text-indigo-600">{enrollment.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${enrollment.progress_percentage}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      {enrollment.is_completed
                        ? <span className="flex items-center gap-1 text-green-600 text-sm font-semibold"><CheckCircle size={15} />Completed</span>
                        : <span className="flex items-center gap-1 text-orange-500 text-sm font-medium"><Clock size={15} />In Progress</span>
                      }
                      <Link to={`/course/${enrollment.course}`}
                        className="flex items-center gap-1 bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                        Continue <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-16 px-4">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses yet</h3>
              <p className="text-gray-400 mb-6">Enroll in a course to start your learning journey</p>
              <Link to="/" className="btn-primary inline-flex items-center gap-2">
                Browse Courses <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* Exam History */}
        {attempts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5">Recent Exam Results</h2>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Exam', 'Course', 'Score', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left py-3 px-5 text-gray-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attempts.slice(0, 5).map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-5 font-medium text-gray-800">{a.exam_title}</td>
                      <td className="py-3 px-5 text-gray-500">{a.course_title}</td>
                      <td className="py-3 px-5 font-bold text-indigo-600">{a.score != null ? `${a.score}%` : 'N/A'}</td>
                      <td className="py-3 px-5">
                        {a.is_passed == null ? <span className="text-gray-400">Pending</span>
                          : a.is_passed
                            ? <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-semibold">Passed</span>
                            : <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-semibold">Failed</span>
                        }
                      </td>
                      <td className="py-3 px-5 text-gray-400">{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
