import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SummaryPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { test, questions, answers, reviewStatus, isAutoSubmitted } = state || {};

  useEffect(() => {
    if (isAutoSubmitted) {
      localStorage.setItem('reviewState_' + test._id, JSON.stringify({
  test,
  questions,
  answers,
  reviewStatus
}));
      const timer = setTimeout(() => {
        navigate(`/test-review/${test._id}`, {
          replace:true,
          state: {
            test,
            questions,
            answers,
            reviewStatus
          }
        });
      }, 3000); // Auto redirect after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isAutoSubmitted, navigate, test, questions, answers, reviewStatus]);

  // Calculate summary statistics
  const getSummaryData = () => {
    if (!questions || !answers) return {};

    return {
      totalQuestions: questions.length,
      answered: Object.keys(answers).length,
      unanswered: questions.length - Object.keys(answers).length,
      markedForReview: Object.values(reviewStatus || {}).filter(Boolean).length,
      subjectBreakdown: [...new Set(questions.map(q => q.subject))].map(subject => ({
        subject,
        count: questions.filter(q => q.subject === subject).length,
        answered: questions.filter((q, index) =>
          q.subject === subject && answers[index] !== undefined
        ).length
      }))
    };
  };

  const summary = getSummaryData();

  const handleFinalSubmit = () => {
    localStorage.setItem('reviewState_' + test._id, JSON.stringify({
  test,
  questions,
  answers,
  reviewStatus
}));
    navigate(`/test-review/${test._id}`, {
      replace:true,
      state: {
        test,
        questions,
        answers,
        reviewStatus
      }
    });
  };

  const handleBackToTest = () => {
    navigate(`/start-test/${test._id}/0`, {
      state: { test, questions, answers, reviewStatus }
    });
  };

  if (!test || !questions) return <div className="p-6 text-center">No summary data available</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">{test.title} - Test Summary</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Question Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Questions:</span>
              <span className="font-medium">{summary.totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span>Answered:</span>
              <span className="font-medium text-green-600">{summary.answered}</span>
            </div>
            <div className="flex justify-between">
              <span>Unanswered:</span>
              <span className="font-medium text-red-600">{summary.unanswered}</span>
            </div>
            <div className="flex justify-between">
              <span>Marked for Review:</span>
              <span className="font-medium text-purple-600">{summary.markedForReview}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Subject Breakdown</h3>
          <div className="space-y-3">
            {summary.subjectBreakdown?.map((subject, index) => (
              <div key={index} className="flex justify-between">
                <span>{subject.subject}:</span>
                <span>
                  <span className="font-medium">{subject.answered}</span>
                  <span className="text-gray-500">/{subject.count}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Question List</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {questions.map((q, index) => (
            <div
              key={index}
              className={`p-3 rounded border ${
                answers[index] !== undefined
                  ? reviewStatus[index]
                    ? 'bg-purple-100 border-purple-300'
                    : 'bg-green-100 border-green-300'
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Q{index + 1}</span>
                <span className="text-sm">
                  {answers[index] !== undefined
                    ? reviewStatus[index] ? 'Marked' : 'Answered'
                    : 'Unanswered'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">{q.subject}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between border-t pt-4">
        <button
          onClick={handleBackToTest}
          disabled={isAutoSubmitted}
          className={`px-6 py-2 rounded text-white ${
            isAutoSubmitted
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Back to Test
        </button>
        <button
          onClick={handleFinalSubmit}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Submit Test
        </button>
      </div>
    </div>
  );
};

export default SummaryPage;
