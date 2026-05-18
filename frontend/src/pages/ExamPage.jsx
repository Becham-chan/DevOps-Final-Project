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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${
              isUrgent ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-700'
            }`}>
              <Clock size={18} />
              {timeRemaining !== null ? fmt(timeRemaining) : '--:--'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full transition-all"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
            </div>
            <span className="text-sm text-gray-500 shrink-0">
              {currentIdx + 1} / {questions.length}
            </span>
          </div>

          <p className="text-xs text-gray-400 mt-2">{answered} of {questions.length} answered</p>
        </div>

        {/* Question */}
        {current && (
          <div className="card p-8 mb-6">
            <div className="flex items-start gap-3 mb-6">
              <span className="bg-indigo-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                {currentIdx + 1}
              </span>
              <h2 className="text-xl font-bold text-gray-900 leading-snug">{current.question_text}</h2>
            </div>

            {current.question_type === 'short_answer' ? (
              <textarea
                value={responses[current.id] || ''}
                onChange={e => setResponses(r => ({ ...r, [current.id]: e.target.value }))}
                placeholder="Type your answer here..."
                className="input-field h-28 resize-none"
              />
            ) : (
              <div className="space-y-3">
                {current.answers?.map(answer => (
                  <label key={answer.id}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      responses[current.id] === answer.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}>
                    <input type="radio" name={`q-${current.id}`} value={answer.id}
                      checked={responses[current.id] === answer.id}
                      onChange={() => setResponses(r => ({ ...r, [current.id]: answer.id }))}
                      className="w-4 h-4 text-indigo-600" />
                    <span className="text-gray-800 font-medium">{answer.answer_text}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-40">
            <ChevronLeft size={18} /> Previous
          </button>

          {/* Question dots */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {questions.map((q, i) => (
              <button key={q.id} onClick={() => setCurrentIdx(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                  i === currentIdx ? 'bg-indigo-600 text-white'
                    : responses[q.id] ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}>{i + 1}</button>
            ))}
          </div>

          {currentIdx < questions.length - 1 ? (
            <button onClick={() => setCurrentIdx(i => i + 1)} className="btn-primary flex items-center gap-2">
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} id="submit-exam-btn"
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-60">
              <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          )}
        </div>

        {isUrgent && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <AlertTriangle size={16} /> Time is almost up! Exam will auto-submit.
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamPage;
