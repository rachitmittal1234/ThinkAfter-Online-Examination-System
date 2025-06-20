import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { backendUrl } from '../App';
import { useParams } from 'react-router-dom'; // ✅ Add at the top

//solving
const TestReviewPage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const { testId } = useParams(); // ✅ Extract testId from the route


  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [reviewStatus, setReviewStatus] = useState([]);
  const [confidenceLevels, setConfidenceLevels] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
  const savedData = localStorage.getItem('reviewState_' + testId);
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      setTest(parsed.test);
      setQuestions(parsed.questions);
      setAnswers(parsed.answers);
      setReviewStatus(parsed.reviewStatus);
    } catch (err) {
      console.error('Error parsing reviewState from localStorage:', err);
    }
  } else {
    console.warn('No review state found in localStorage for testId:', testId);
  }
}, [testId]);


  // Handle browser back button
  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    const handleBackButton = () => {
      window.history.pushState(null, null, window.location.href);
      toast.info("You can't go back after submission.");
    };
    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, []);

  const attemptedQuestions = questions?.filter((_, index) => answers?.[index] !== undefined) || [];

  const handleConfidenceSelect = (questionIndex, level) => {
    setConfidenceLevels(prev => ({
      ...prev,
      [questionIndex]: level
    }));
  };

  const handleFinalSubmission = async () => {
    if (!userId) {
      toast.error('Please login again to submit your test');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (Object.keys(confidenceLevels).length !== attemptedQuestions.length) {
      toast.error('Please select confidence level for all attempted questions');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Submitting your test...');

    try {
      const responses = attemptedQuestions.map((q) => {
        const originalIndex = questions.findIndex(question => question._id === q._id);
        return {
          questionId: q._id,
          selectedOption: answers[originalIndex] || null,
          confidenceLevel: confidenceLevels[originalIndex],
          isMarkedForReview: reviewStatus?.[originalIndex] || false
        };
      });

      const { data } = await axios.post(`${backendUrl}/api/reports/submit`, {
        userId,
        testId: test._id,
        responses
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      toast.update(toastId, {
        render: data.message || 'Test submitted successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 2000
      });

      // Delay cleanup to avoid "Test Data Not Found"
      setTimeout(() => {
        localStorage.removeItem('answers_' + test._id);
        localStorage.removeItem('reviewStatus_' + test._id);
        localStorage.removeItem('reviewState_' + test._id);
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Submission error:', error);
      toast.update(toastId, {
        render: error.response?.data?.message || 'Failed to submit test. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ❌ If still missing data
  if (!test || !questions?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Test Data Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (attemptedQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Questions Attempted</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-700 p-6 text-white">
          <h1 className="text-2xl font-bold text-center">{test.title} - Review Your Answers</h1>
          <p className="text-center mt-2 text-blue-100">
            Confirm your responses before final submission
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {attemptedQuestions.map((q) => {
            const originalIndex = questions.findIndex(question => question._id === q._id);
            return (
              <div key={q._id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">
                    <span className="text-blue-600">Q{originalIndex + 1}:</span> {q.questionText}
                  </h3>
                  {reviewStatus?.[originalIndex] && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      Marked for Review
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 mb-3">Subject: {q.subject}</p>

                <div className="mt-4 space-y-2">
                  {q.options.map((opt, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-3 border rounded-lg ${
                        answers[originalIndex] === opt
                          ? 'bg-blue-50 border-blue-300 font-medium'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    How confident are you about this answer?
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['100% Sure', 'Partially Sure', 'Randomly Selected'].map((level) => (
                      <button
                        key={level}
                        onClick={() => handleConfidenceSelect(originalIndex, level)}
                        disabled={isSubmitting}
                        className={`px-4 py-2 text-sm rounded-full transition ${
                          confidenceLevels[originalIndex] === level
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
          <div className="text-sm text-gray-600">
            {Object.keys(confidenceLevels).length}/{attemptedQuestions.length} questions rated
          </div>
          <button
            onClick={handleFinalSubmission}
            disabled={isSubmitting || Object.keys(confidenceLevels).length !== attemptedQuestions.length}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Confirm Submission'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestReviewPage;
