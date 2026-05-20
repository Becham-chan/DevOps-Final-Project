import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { CheckCircle, XCircle, Trophy, ArrowLeft, RotateCcw } from 'lucide-react';

const Results = () => {
  const { attemptId } = useParams();
  const { request } = useApi();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request('GET', `/api/attempts/${attemptId}/`)
      .then(setAttempt)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600" />
    </div>
  );

  if (!attempt) return <div className="text-center py-20 text-gray-500">Results not found.</div>;

  const passed = attempt.is_passed;
  const score = attempt.score ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Score Card */}
        <div className={`card p-10 text-center mb-8 border-2 ${passed ? 'border-emerald-200 bg-emerald-50/20 shadow-lg shadow-emerald-50/30' : 'border-rose-200 bg-rose-50/20 shadow-lg shadow-rose-50/30'}`}>
          <div className={`inline-flex rounded-full p-5 mb-5 ${passed ? 'bg-emerald-100/60 text-emerald-600 shadow-inner' : 'bg-rose-100/60 text-rose-600 shadow-inner'}`}>
            {passed
              ? <Trophy size={42} />
              : <XCircle size={42} />
            }
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 font-display tracking-tight">
            {passed ? '🎉 Congratulations!' : 'Keep Practicing!'}
          </h1>
          <p className={`text-base font-extrabold mb-8 uppercase tracking-wide ${passed ? 'text-emerald-600' : 'text-rose-650'}`}>
            {passed ? 'You passed the exam!' : 'You did not pass this time.'}
          </p>

          <div className={`inline-flex items-center justify-center w-36 h-36 rounded-full border-[10px] mb-8 font-extrabold text-4xl shadow-md bg-white font-display ${
            passed ? 'border-emerald-400 text-emerald-600' : 'border-rose-450 text-rose-600'
          }`}>
            <span>{score}%</span>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm font-semibold">
            {attempt.responses?.length} questions answered
            {attempt.submitted_at && (
              <> · Completed on {new Date(attempt.submitted_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</>
            )}
          </p>
        </div>

        {/* Response Review */}
        {attempt.responses?.length > 0 && (
          <div className="card p-6 sm:p-8 mb-8 border-slate-100 shadow-premium">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-6 font-display border-b border-slate-50 pb-3">Answer Review</h2>
            <div className="space-y-4">
              {attempt.responses.map((r, i) => {
                const isAnswered = r.selected_answer !== null;
                return (
                  <div key={r.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
                    <span className="text-xs font-extrabold text-slate-400 mt-1 w-7 shrink-0 tracking-wider">Q{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-bold text-slate-850 leading-relaxed font-display">{r.question_text}</p>
                      {r.user_answer_text && (
                        <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2.5 bg-white py-1.5 px-3 rounded-xl border border-slate-100 inline-block shadow-sm">Your response: <span className="text-slate-700 font-bold">{r.user_answer_text}</span></p>
                      )}
                    </div>
                    <div className="shrink-0 mt-1">
                      {isAnswered
                        ? <CheckCircle size={20} className="text-emerald-500" />
                        : <XCircle size={20} className="text-slate-350" />
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center sm:items-center">
          <Link to="/dashboard" className="btn-secondary flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto py-3 px-8 text-sm sm:text-base">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <Link to={`/exam/${attempt.exam}`} className="btn-primary flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto py-3 px-8 text-sm sm:text-base">
            <RotateCcw size={16} /> Retake Exam
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;
