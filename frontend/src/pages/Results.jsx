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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Score Card */}
        <div className={`card p-10 text-center mb-8 border-2 ${passed ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
          <div className={`inline-flex rounded-full p-4 mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
            {passed
              ? <Trophy size={40} className="text-green-600" />
              : <XCircle size={40} className="text-red-600" />
            }
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {passed ? '🎉 Congratulations!' : 'Keep Practicing!'}
          </h1>
          <p className={`text-lg font-semibold mb-6 ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {passed ? 'You passed the exam!' : 'You did not pass this time.'}
          </p>

          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 mb-6 ${
            passed ? 'border-green-400 text-green-600' : 'border-red-400 text-red-600'
          }`}>
            <span className="text-4xl font-extrabold">{score}%</span>
          </div>

          <p className="text-gray-500">
            {attempt.responses?.length} questions answered
            {attempt.submitted_at && (
              <> · {new Date(attempt.submitted_at).toLocaleString()}</>
            )}
          </p>
        </div>

        {/* Response Review */}
        {attempt.responses?.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Answer Review</h2>
            <div className="space-y-3">
              {attempt.responses.map((r, i) => {
                const isAnswered = r.selected_answer !== null;
                return (
                  <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <span className="text-xs font-bold text-gray-400 mt-0.5 w-5 shrink-0">Q{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">{r.question_text}</p>
                      {r.user_answer_text && (
                        <p className="text-xs text-gray-500 mt-1">Your answer: {r.user_answer_text}</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {isAnswered
                        ? <CheckCircle size={18} className="text-green-500" />
                        : <XCircle size={18} className="text-gray-300" />
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/dashboard" className="btn-secondary flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <Link to={`/exam/${attempt.exam}`} className="btn-primary flex items-center justify-center gap-2">
            <RotateCcw size={16} /> Retake Exam
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;
