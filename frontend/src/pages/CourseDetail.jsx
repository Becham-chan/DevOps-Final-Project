import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Clock, User, BookOpen, CheckCircle, ChevronRight, Trophy, ArrowLeft } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request, loading } = useApi();
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [readLessons, setReadLessons] = useState(new Set());
  const [enrolling, setEnrolling] = useState(false);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    request('GET', `/api/courses/${id}/`).then(data => {
      setCourse(data);
      if (data.lessons?.length > 0) setSelectedLesson(data.lessons[0]);
    }).catch(() => {});

    request('GET', '/api/enrollments/').then(data => {
      const found = data.find(e => String(e.course) === String(id));
      if (found) setEnrollment(found);
    }).catch(() => {});

    request('GET', '/api/lesson-progress/').then(data => {
      setReadLessons(new Set(data.filter(p => p.is_read).map(p => p.lesson)));
    }).catch(() => {});

    request('GET', '/api/exams/').then(data => {
      setExams(data.filter(e => String(e.course) === String(id)));
    }).catch(() => {});
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const data = await request('POST', '/api/enrollments/', { course_id: parseInt(id) });
      setEnrollment(data);
    } catch (err) {
      if (err.response?.data?.detail?.includes('Already')) {
        request('GET', '/api/enrollments/').then(data => {
          const found = data.find(e => String(e.course) === String(id));
          if (found) setEnrollment(found);
        });
      }
    } finally {
      setEnrolling(false);
    }
  };

  const markAsRead = async (lesson) => {
    try {
      await request('POST', '/api/lesson-progress/', { lesson_id: lesson.id });
      setReadLessons(prev => new Set([...prev, lesson.id]));
    } catch (err) { console.error(err); }
  };

  if (loading && !course) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600" />
    </div>
  );

  if (!course) return <div className="text-center py-20 text-gray-500">Course not found.</div>;

  const progress = course.lessons?.length > 0
    ? Math.round((readLessons.size / course.lessons.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1 text-indigo-200 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to courses
          </Link>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">
              {course.category?.replace('_', ' ')}
            </span>
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">
              {course.level}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">{course.title}</h1>
          <p className="text-indigo-100 text-lg max-w-2xl mb-6">{course.description}</p>
          <div className="flex flex-wrap gap-6 text-sm text-indigo-200">
            <span className="flex items-center gap-1.5"><User size={15} />{course.instructor_name}</span>
            <span className="flex items-center gap-1.5"><Clock size={15} />{course.duration_hours}h total</span>
            <span className="flex items-center gap-1.5"><BookOpen size={15} />{course.lesson_count} lessons</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Enroll card */}
            <div className="card p-6">
              {!enrollment ? (
                <>
                  <p className="text-gray-600 text-sm mb-4">Enroll to access lessons and take the final exam.</p>
                  <button onClick={handleEnroll} disabled={enrolling} id="enroll-btn"
                    className="btn-primary w-full py-3 disabled:opacity-60">
                    {enrolling ? 'Enrolling...' : 'Enroll Now — Free'}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-green-600 font-semibold mb-3">
                    <CheckCircle size={18} /> Enrolled
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Your progress</span>
                    <span className="font-bold text-indigo-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  {exams.length > 0 && (
                    <Link to={`/exam/${exams[0].id}`} id="take-exam-btn"
                      className="flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm">
                      <Trophy size={16} /> Take Exam
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Lesson list */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-3">Course Content</h3>
              <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                {course.lessons?.map((lesson, idx) => (
                  <button key={lesson.id} onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                      selectedLesson?.id === lesson.id
                        ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      readLessons.has(lesson.id) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {readLessons.has(lesson.id) ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{lesson.title}</p>
                      <p className="text-xs text-gray-400">{lesson.estimated_reading_time} min</p>
                    </div>
                    {selectedLesson?.id === lesson.id && <ChevronRight size={14} className="text-indigo-500 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="card p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedLesson.title}</h2>
                    <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                      <Clock size={13} /> {selectedLesson.estimated_reading_time} min read
                    </p>
                  </div>
                  {readLessons.has(selectedLesson.id) && (
                    <span className="flex items-center gap-1 text-green-600 text-sm font-semibold bg-green-50 px-3 py-1.5 rounded-full">
                      <CheckCircle size={14} /> Read
                    </span>
                  )}
                </div>

                <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed mb-8"
                  dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />

                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <button
                    onClick={() => {
                      const idx = course.lessons.findIndex(l => l.id === selectedLesson.id);
                      if (idx > 0) setSelectedLesson(course.lessons[idx - 1]);
                    }}
                    disabled={course.lessons?.findIndex(l => l.id === selectedLesson.id) === 0}
                    className="btn-secondary text-sm disabled:opacity-40">
                    ← Previous
                  </button>

                  {!readLessons.has(selectedLesson.id) && enrollment && (
                    <button onClick={() => markAsRead(selectedLesson)}
                      className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm">
                      <CheckCircle size={16} /> Mark as Complete
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const idx = course.lessons.findIndex(l => l.id === selectedLesson.id);
                      if (idx < course.lessons.length - 1) setSelectedLesson(course.lessons[idx + 1]);
                    }}
                    disabled={course.lessons?.findIndex(l => l.id === selectedLesson.id) === (course.lessons?.length - 1)}
                    className="btn-secondary text-sm disabled:opacity-40">
                    Next →
                  </button>
                </div>
              </div>
            ) : (
              <div className="card p-16 text-center">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Select a lesson to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
