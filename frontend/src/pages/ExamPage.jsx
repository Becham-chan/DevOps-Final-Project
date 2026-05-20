import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, Send } from 'lucide-react';

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { request } = useApi();
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const examData = await request('GET', `/api/exams/${examId}/`);
        setExam(examData);
        const attemptData = await request('POST', '/api/attempts/', { exam_id: parseInt(examId) });
        setAttempt(attemptData);
        setTimeRemaining(examData.time_limit_minutes * 60);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [examId]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeRemaining !== null]);

  const handleSubmit = async () => {
    if (!attempt || submitting) return;
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const submitData = {
        responses: attempt.responses.map(r => ({
          id: r.id,
          selected_answer_id: responses[r.question] || null,
        }))
      };
      const result = await request('POST', `/api/attempts/${attempt.id}/submit/`, submitData);
      navigate(`/results/${result.id}`);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const isUrgent = timeRemaining !== null && timeRemaining < 120;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4" />
        <p className="text-gray-500">Preparing your exam...</p>
      </div>
    </div>
  );

  if (!exam || !attempt) return <div className="text-center py-20 text-gray-500">Could not load exam.</div>;

  const questions = exam.questions || [];
  const current = questions[currentIdx];
  const answered = Object.keys(responses).length;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header Dashboard */}
        <div className="card p-6 mb-8 border-slate-100 shadow-premium">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 font-display tracking-tight leading-snug">{exam.title}</h1>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-lg shadow-sm border self-start sm:self-center ${
              isUrgent ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' : 'bg-violet-50 text-violet-750 border-violet-100/50'
            }`}>
              <Clock size={18} className={isUrgent ? 'text-rose-500' : 'text-violet-650'} />
              <span>{timeRemaining !== null ? fmt(timeRemaining) : '--:--'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
            </div>
            <span className="text-xs font-bold text-slate-400 shrink-0 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
              {currentIdx + 1} / {questions.length} Questions
            </span>
          </div>

          <div className="flex items-center justify-between mt-3 text-xs font-semibold text-slate-400">
            <span>{answered} of {questions.length} answered</span>
            {isUrgent && <span className="text-rose-500 animate-pulse">Time is almost up!</span>}
          </div>
        </div>

        {/* Question Pane */}
        {current && (
          <div className="card p-8 mb-8 border-slate-100 shadow-premium-hover animate-fade-in">
            <div className="flex items-start gap-4 mb-8">
              <span className="bg-violet-600 text-white text-sm font-extrabold w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm shadow-violet-100 font-display">
                {currentIdx + 1}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-snug font-display">{current.question_text}</h2>
            </div>

            {current.question_type === 'short_answer' ? (
              <textarea
                value={responses[current.id] || ''}
                onChange={e => setResponses(r => ({ ...r, [current.id]: e.target.value }))}
                placeholder="Type your answer here..."
                className="input-field h-36 resize-none p-4 text-base focus:ring-violet-100"
              />
            ) : (
              <div className="space-y-3.5">
                {current.answers?.map(answer => (
                  <label key={answer.id}
                    className={`flex items-center gap-4.5 p-4.5 border-2 rounded-2xl cursor-pointer transition-all active:scale-[0.99] ${
                      responses[current.id] === answer.id
                        ? 'border-violet-500 bg-violet-50/50 shadow-sm shadow-violet-150/10 text-violet-900'
                        : 'border-slate-150 hover:border-violet-200 hover:bg-violet-50/20 text-slate-700'
                    }`}>
                    <input type="radio" name={`q-${current.id}`} value={answer.id}
                      checked={responses[current.id] === answer.id}
                      onChange={() => setResponses(r => ({ ...r, [current.id]: answer.id }))}
                      className="w-4 h-4 text-violet-600 border-slate-300 focus:ring-violet-500 cursor-pointer" />
                    <span className="text-slate-850 text-sm sm:text-base font-semibold leading-relaxed">{answer.answer_text}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed w-full sm:w-auto">
            <ChevronLeft size={18} /> Previous
          </button>

          {/* Question Dot indicators */}
          <div className="flex flex-wrap justify-center gap-2">
            {questions.map((q, i) => (
              <button key={q.id} onClick={() => setCurrentIdx(i)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all hover:scale-105 cursor-pointer ${
                  i === currentIdx ? 'bg-violet-600 text-white shadow-md shadow-violet-100/50 ring-2 ring-violet-200'
                    : responses[q.id] ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>{i + 1}</button>
            ))}
          </div>

          {currentIdx < questions.length - 1 ? (
            <button onClick={() => setCurrentIdx(i => i + 1)} className="btn-primary flex items-center gap-2 w-full sm:w-auto">
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} id="submit-exam-btn"
              className="flex items-center justify-center gap-2 bg-emerald-650 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-60 cursor-pointer w-full sm:w-auto hover:shadow-md hover:shadow-emerald-100/50">
              <Send size={15} /> {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          )}
        </div>

        {isUrgent && (
          <div className="mt-6 flex items-center gap-2 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-semibold animate-pulse">
            <AlertTriangle size={18} className="shrink-0" />
            <span>Time is almost up! The exam will automatically submit when the timer hits zero.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamPage;
