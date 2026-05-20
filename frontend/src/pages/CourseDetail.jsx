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
      const list = Array.isArray(data) ? data : (data.results ?? []);
      const found = list.find(e => String(e.course) === String(id));
      if (found) setEnrollment(found);
    }).catch(() => {});

    request('GET', '/api/lesson-progress/').then(data => {
      const list = Array.isArray(data) ? data : (data.results ?? []);
      setReadLessons(new Set(list.filter(p => p.is_read).map(p => p.lesson)));
    }).catch(() => {});

    request('GET', '/api/exams/').then(data => {
      const list = Array.isArray(data) ? data : (data.results ?? []);
      setExams(list.filter(e => String(e.course) === String(id)));
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
          const list = Array.isArray(data) ? data : (data.results ?? []);
          const found = list.find(e => String(e.course) === String(id));
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
    <div className="min-h-screen bg-slate-50">
      {/* Course Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-4 sm:px-6 relative overflow-hidden border-b border-slate-800/30">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-650/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-semibold mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to courses
          </Link>
          <div className="flex flex-wrap gap-2.5 mb-5">
            <span className="bg-white/5 border border-white/10 backdrop-blur-md text-violet-300 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
              {course.category?.replace('_', ' ')}
            </span>
            <span className="bg-white/5 border border-white/10 backdrop-blur-md text-violet-300 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
              {course.level}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4.5xl font-extrabold mb-5 font-display tracking-tight leading-tight">{course.title}</h1>
          <p className="text-slate-350 text-lg max-w-3xl mb-8 leading-relaxed font-normal">{course.description}</p>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-450 font-medium">
            <span className="flex items-center gap-2"><User size={15} className="text-violet-400" />Instructor: <span className="text-slate-300 font-semibold">{course.instructor_name}</span></span>
            <span className="flex items-center gap-2"><Clock size={15} className="text-violet-400" />{course.duration_hours} hours total</span>
            <span className="flex items-center gap-2"><BookOpen size={15} className="text-violet-400" />{course.lesson_count} lessons</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Enroll card */}
            <div className="card p-6 border-slate-100">
              {!enrollment ? (
                <>
                  <h3 className="font-bold text-slate-800 text-lg mb-2 font-display">Start Learning Today</h3>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">Enroll now to unlock all course lessons, track your progress, and challenge the final exam.</p>
                  <button onClick={handleEnroll} disabled={enrolling} id="enroll-btn"
                    className="btn-primary w-full py-3.5 text-base disabled:opacity-60 shadow-lg shadow-violet-100/50 cursor-pointer">
                    {enrolling ? 'Enrolling...' : 'Enroll Now — Free'}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-sm mb-4 uppercase tracking-wider bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-100/50 self-start inline-flex">
                    <CheckCircle size={16} /> Enrolled
                  </div>
                  <div className="flex justify-between text-sm text-slate-650 mb-2.5">
                    <span className="font-semibold text-slate-500">Your Study Progress</span>
                    <span className="font-bold text-violet-650">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-violet-500 to-indigo-650 h-2 rounded-full transition-all duration-550" style={{ width: `${progress}%` }} />
                  </div>
                  {exams.length > 0 && (
                    <Link to={`/exam/${exams[0].id}`} id="take-exam-btn"
                      className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 hover:shadow-md transition-all text-sm active:scale-95 shadow-emerald-100">
                      <Trophy size={16} /> Challenge Final Exam
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Lesson list */}
            <div className="card p-6 border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg mb-4 font-display border-b border-slate-50 pb-3">Course Curriculum</h3>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {course.lessons?.map((lesson, idx) => (
                  <button key={lesson.id} onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left p-3.5 rounded-xl flex items-center gap-3.5 transition-all duration-200 cursor-pointer ${
                      selectedLesson?.id === lesson.id
                        ? 'bg-violet-50/80 text-violet-900 border border-violet-100/60 shadow-sm'
                        : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                    }`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm transition-colors ${
                      readLessons.has(lesson.id) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {readLessons.has(lesson.id) ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${selectedLesson?.id === lesson.id ? 'text-violet-900' : 'text-slate-700'}`}>{lesson.title}</p>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{lesson.estimated_reading_time} mins reading</p>
                    </div>
                    {selectedLesson?.id === lesson.id && <ChevronRight size={15} className="text-violet-500 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="card p-8 border-slate-100 shadow-premium">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-slate-100 pb-6">
                  <div>
                    <h2 className="text-2xl sm:text-3.5xl font-extrabold text-slate-900 font-display leading-snug">{selectedLesson.title}</h2>
                    <p className="text-slate-400 text-sm mt-2 flex items-center gap-1.5 font-medium">
                      <Clock size={14} className="text-slate-350" /> {selectedLesson.estimated_reading_time} minutes reading time
                    </p>
                  </div>
                  {readLessons.has(selectedLesson.id) && (
                    <span className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100/50 self-start sm:self-center">
                      <CheckCircle size={14} /> Completed
                    </span>
                  )}
                </div>

                <div className="prose prose-slate prose-violet max-w-none text-slate-700 leading-relaxed font-normal mb-10 text-base sm:text-lg"
                  dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />

                <div className="flex items-center justify-between pt-6 border-t border-slate-150/70">
                  <button
                    onClick={() => {
                      const idx = course.lessons.findIndex(l => l.id === selectedLesson.id);
                      if (idx > 0) setSelectedLesson(course.lessons[idx - 1]);
                    }}
                    disabled={course.lessons?.findIndex(l => l.id === selectedLesson.id) === 0}
                    className="btn-secondary text-sm disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                    ← Previous
                  </button>

                  {!readLessons.has(selectedLesson.id) && enrollment && (
                    <button onClick={() => markAsRead(selectedLesson)}
                      className="flex items-center gap-2 bg-emerald-650 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all text-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5 active:scale-95">
                      <CheckCircle size={16} /> Mark as Complete
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const idx = course.lessons.findIndex(l => l.id === selectedLesson.id);
                      if (idx < course.lessons.length - 1) setSelectedLesson(course.lessons[idx + 1]);
                    }}
                    disabled={course.lessons?.findIndex(l => l.id === selectedLesson.id) === (course.lessons?.length - 1)}
                    className="btn-secondary text-sm disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                    Next →
                  </button>
                </div>
              </div>
            ) : (
              <div className="card p-24 text-center border-slate-100 shadow-premium">
                <BookOpen size={64} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-1 font-display">Begin Your Learning Journey</h3>
                <p className="text-slate-400 text-sm">Select a lesson from the curriculum outline on the left to start reading.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
