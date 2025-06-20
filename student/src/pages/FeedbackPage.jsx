import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { 
  FiSend, 
  FiCheckCircle, 
  FiMessageSquare,
  FiAlertCircle,
  FiLogIn
} from 'react-icons/fi';
import feedbackImage from '../images/feedbackimage.jpg';
import { backendUrl } from '../App';

// Loading Spinner Component (same as in Test.jsx)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const FeedbackPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const maxLength = 2000;

  useEffect(() => {
    // Simulate loading delay (can be removed if not needed)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleFeedbackChange = (e) => {
    const input = e.target.value;
    if (input.length <= maxLength) {
      setFeedback(input);
      setCharCount(input.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await axios.post(
        `${backendUrl}/api/anonymous/submit`,
        { text: feedback },
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
      );

      if (res.data.success) {
        setSubmitted(true);
        setFeedback('');
        setCharCount(0);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewFeedback = () => {
    setSubmitted(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <Navbar />
          <div className="max-w-md mx-auto px-4 py-20">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLogIn className="text-red-500 text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Authentication Required</h2>
              <p className="text-gray-600 mb-6">Please login to submit feedback</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <Navbar />
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Share Your Feedback</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your anonymous feedback helps us improve. We value every suggestion, comment, or concern you have.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feedback Form Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <FiCheckCircle className="text-green-500 text-5xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
                  <p className="text-gray-600 mb-6">Your feedback has been submitted anonymously.</p>
                  <button
                    onClick={handleNewFeedback}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Submit Another Feedback
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FiMessageSquare className="mr-2 text-indigo-600" />
                    Your Feedback
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <textarea
                        value={feedback}
                        onChange={handleFeedbackChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        rows="6"
                        placeholder="What's on your mind? (Max 2000 characters)"
                        required
                      ></textarea>
                      <div className="text-right text-sm text-gray-500 mt-1">
                        {charCount}/{maxLength} characters
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || !feedback.trim()}
                      className={`w-full flex items-center justify-center px-6 py-3 rounded-lg transition ${
                        submitting
                          ? 'bg-indigo-400 cursor-not-allowed'
                          : !feedback.trim()
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <FiSend className="mr-2" />
                      {submitting ? 'Submitting...' : 'Submit Anonymously'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Image and Info Section */}
          <div className="flex flex-col">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 flex-1">
              <img
                src={feedbackImage}
                alt="Feedback illustration"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Why Your Feedback Matters</h2>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Helps us improve our services and features</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Completely anonymous - no personal data collected</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>Directly influences our development priorities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>We read every single submission</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Anonymous Assurance Card */}
            <div className="mt-6 bg-indigo-50 rounded-xl p-5 border border-indigo-100">
              <div className="flex items-start">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">100% Anonymous</h3>
                  <p className="text-gray-600 text-sm">
                    We don't store any personal information with your feedback. Your identity remains completely private.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;