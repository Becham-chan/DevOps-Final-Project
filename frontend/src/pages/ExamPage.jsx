import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Clock } from 'lucide-react';

const ExamPage = () => {
  const { examId } = useParams();
  const { request, loading } = useApi();
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) return;
    const timer = setInterval(() => setTimeRemaining(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const fetchExam = async () => {
    try {
      const data = await request('GET', `/api/exams/${examId}/`);
      setExam(data);
      startAttempt();
    } catch (err) {
      console.error('Failed to fetch exam:', err);
    }
  };

  const startAttempt = async () => {
    try {
      const data = await request('POST', '/api/attempts/', { exam_id: examId });
      setAttempt(data);
      setTimeRemaining(exam.time_limit_minutes * 60);
    } catch (err) {
      console.error('Failed to start attempt:', err);
    }
  };

  const handleAnswerSelect = (questionId, answerId) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const submitExam = async () => {
    try {
      const submitData = {
        responses: Object.entries(responses).map(([questionId, answerId]) => ({
          question_id: parseInt(questionId),
          selected_answer_id: answerId,
        }))
      };
      await request('POST', `/api/attempts/${attempt.id}/submit/`, submitData);
      // Redirect to results
    } catch (err) {
      console.error('Failed to submit exam:', err);
    }
  };

  if (loading || !exam || !attempt) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Timer and Progress */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{exam.title}</h2>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock size={24} />
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Question {currentQuestionIndex + 1} of {exam.questions.length}
          </p>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{currentQuestion.question_text}</h3>

          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => (
              <label
                key={answer.id}
                className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={answer.id}
                  checked={responses[currentQuestion.id] === answer.id}
                  onChange={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                  className="w-4 h-4"
                />
                <span className="ml-3 text-gray-900">{answer.answer_text}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          
          {currentQuestionIndex === exam.questions.length - 1 ? (
            <button
              onClick={submitExam}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
``
