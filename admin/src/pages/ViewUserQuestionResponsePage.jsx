import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../App';
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiClock,
  FiBook,
  FiBookmark,
  FiAward,
} from 'react-icons/fi';

const ViewUserQuestionResponsePage = () => {
  const { userId, testId, questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      try {
        const reportRes = await axios.get(`${backendUrl}/api/reports/report/${userId}/${testId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allResponses = reportRes.data.report || [];
        const matchedResponse = allResponses.find((r) => r.question._id === questionId);
        setResponse(matchedResponse || null);

        const testRes = await axios.get(`${backendUrl}/api/tests/${testId}`);
        const matchedQuestion = testRes.data.questions.find((q) => q._id === questionId);
        setQuestion(matchedQuestion || null);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, testId, questionId]);

  const getStatusIcon = () => {
    if (!response?.selectedOption) return <FiClock className="text-yellow-500 text-xl" />;
    return response.isCorrect ? (
      <FiCheck className="text-green-500 text-xl" />
    ) : (
      <FiX className="text-red-500 text-xl" />
    );
  };

  const getStatusText = () => {
    if (!response?.selectedOption) return 'Skipped';
    return response.isCorrect ? 'Correct Answer' : 'Incorrect Answer';
  };

  const getScore = () => {
    if (!response?.selectedOption) return 0;
    return response.isCorrect ? response.positiveMarks : -response.negativeMarks;
  };

  if (loading) return <div className="min-h-screen bg-gray-100 flex justify-center items-center">Loading...</div>;
  if (!question) return <div className="min-h-screen flex justify-center items-center">Question not found</div>;

  const selectedOption = response?.selectedOption;
  const correctAnswer = question.correctAnswer;
  const isCorrect = response?.isCorrect || false;
  const confidenceLevel = response?.confidenceLevel || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <FiArrowLeft /> Back to Report
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Question Details</h2>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <FiBook className="mr-1" /> {question.subject || 'N/A'}
                  </span>
                  {question.topics?.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <FiBookmark className="mr-1" /> {question.topics[0]}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {question.difficulty?.toLowerCase() || 'Medium'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md shadow-sm border border-gray-200">
                {getStatusIcon()}
                <span className="font-medium">{getStatusText()}</span>
              </div>
            </div>
          </div>

          {/* Question + Options */}
          <div className="p-6">
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Question:</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="whitespace-pre-wrap text-gray-800">{question.questionText}</p>
                {/* {question.image && (
    <div className="mt-2">
      <img
        src={`${backendUrl}/uploads/questions/${question.image}`}
        alt="Question Image"
        className="max-w-full max-h-64 rounded border border-gray-300"
      />
    </div>
  )} */}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Options:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.options.map((option, index) => {
                  const isSelected = option === selectedOption;
                  const isCorrectAns = option === correctAnswer;

                  return (
                    <div
                      key={index}
                      className={`p-4 border rounded-md transition-all ${
                        isCorrectAns
                          ? 'border-green-500 bg-green-50'
                          : isSelected
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-medium bg-gray-100 px-2.5 py-1 rounded-md">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <div className="flex-1">
                          <p className="text-gray-800">{option}</p>
                          {isCorrectAns && (
                            <p className="text-sm text-green-600 mt-1 font-medium flex items-center gap-1">
                              <FiCheck /> Correct Answer
                            </p>
                          )}
                          {isSelected && !isCorrectAns && (
                            <p className="text-sm text-red-600 mt-1 font-medium flex items-center gap-1">
                              <FiX /> Your Answer
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scoring & Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-2">Your Response</h3>
                  <p
                    className={`text-lg font-medium ${
                      !selectedOption
                        ? 'text-gray-500'
                        : isCorrect
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {selectedOption || 'Not Attempted'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-2">Correct Answer</h3>
                  <p className="text-lg font-medium text-green-600">{correctAnswer}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FiAward className="text-blue-600" /> Marking Scheme
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Positive Marks:</span>
                    <span className="font-medium text-green-600">+{question.positiveMarks || 1}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Negative Marks:</span>
                    <span className="font-medium text-red-600">-{question.negativeMarks || 0}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">Your Score:</span>
                      <span
                        className={`text-xl font-semibold ${
                          getScore() > 0
                            ? 'text-green-600'
                            : getScore() < 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {getScore()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-1 text-sm">Subject</h3>
                <p className="text-gray-800">{question.subject || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-1 text-sm">Difficulty</h3>
                <p className="text-gray-800 capitalize">{question.difficulty || 'Medium'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-1 text-sm">Confidence Level</h3>
                <p className="text-gray-800">{confidenceLevel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserQuestionResponsePage;
