import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX, FiClock, FiBook, FiBookmark, FiAward } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../../App';

const ViewQuestionResponse = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const response = state;
    const [fullQuestion, setFullQuestion] = useState(null);

    useEffect(() => {
  const fetchQuestionWithImage = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/questions/${response.question._id}`, {
        headers: { token: localStorage.getItem('token') }
      });
      setFullQuestion(res.data);
    } catch (err) {
      console.error('Failed to fetch question with image:', err);
    }
  };

  if (response?.question?._id) {
    fetchQuestionWithImage();
  }
}, [response]);


    if (!response) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md mx-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">No Response Data Found</h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        <FiArrowLeft /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    const getStatusIcon = () => {
        if (!response.selectedOption) return <FiClock className="text-yellow-500 text-xl" />;
        return response.isCorrect ? (
            <FiCheck className="text-green-500 text-xl" />
        ) : (
            <FiX className="text-red-500 text-xl" />
        );
    };

    const getStatusText = () => {
        if (!response.selectedOption) return 'Skipped';
        return response.isCorrect ? 'Correct Answer' : 'Incorrect Answer';
    };

    const getScore = () => {
        if (!response.selectedOption) return 0;
        return response.isCorrect ? response.positiveMarks : -response.negativeMarks;
    };

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
                    {/* Question Header */}
                    <div className="bg-indigo-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Question Details</h2>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        <FiBook className="mr-1" /> {response.subject || 'General'}
                                    </span>
                                    {response.topic && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            <FiBookmark className="mr-1" /> {response.topic}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                                        {response.difficulty?.toLowerCase() || 'Medium'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md shadow-sm border border-gray-200">
                                {getStatusIcon()}
                                <span className="font-medium">{getStatusText()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="p-6">
                        {/* Question Text */}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 p-1.5 rounded-md text-blue-600">
                                    <FiBook size={18} />
                                </span>
                                Question:
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <p className="whitespace-pre-wrap text-gray-800">{response.question?.questionText}</p>
                                {fullQuestion?.image && (
  <div className="mt-4">
    <img
      src={`${backendUrl}/uploads/questions/${fullQuestion.image}`}
      alt="Question"
      className="max-w-full max-h-72 border rounded"
    />
  </div>
)}
                                
                            </div>
                        </div>

                        {/* Options */}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">Options:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {response.question?.options?.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 border rounded-md transition-all ${option === response.question.correctAnswer
                                                ? 'border-green-500 bg-green-50 shadow-green-sm'
                                                : option === response.selectedOption
                                                    ? 'border-red-500 bg-red-50 shadow-red-sm'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="font-medium bg-gray-100 px-2.5 py-1 rounded-md">
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-gray-800">{option}</p>
                                                {option === response.question.correctAnswer && (
                                                    <p className="text-sm text-green-600 mt-1 font-medium flex items-center gap-1">
                                                        <FiCheck /> Correct Answer
                                                    </p>
                                                )}
                                                {option === response.selectedOption && option !== response.question.correctAnswer && (
                                                    <p className="text-sm text-red-600 mt-1 font-medium flex items-center gap-1">
                                                        <FiX /> Your Answer
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Response and Marking Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Response Details */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <h3 className="font-medium text-gray-700 mb-2">Your Response</h3>
                                    <p className={`text-lg font-medium ${!response.selectedOption ? 'text-gray-500' :
                                            response.isCorrect ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {response.selectedOption || 'Not Attempted'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <h3 className="font-medium text-gray-700 mb-2">Correct Answer</h3>
                                    <p className="text-lg font-medium text-green-600">{response.question?.correctAnswer}</p>
                                </div>
                            </div>

                            {/* Marking Scheme */}
                            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                                <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <FiAward className="text-blue-600" /> Marking Scheme
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Positive Marks:</span>
                                        <span className="font-medium text-green-600">+{response.positiveMarks || 1}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Negative Marks:</span>
                                        <span className="font-medium text-red-600">-{response.negativeMarks || 0}</span>
                                    </div>
                                    <div className="border-t border-blue-200 pt-2 mt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-800">Your Score:</span>
                                            <span className={`text-xl font-semibold ${getScore() > 0 ? 'text-green-600' : getScore() < 0 ? 'text-red-600' : 'text-gray-600'
                                                }`}>
                                                {getScore()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <h3 className="font-medium text-gray-700 mb-1 text-sm">Subject</h3>
                                <p className="text-gray-800">{response.subject || 'General'}</p>
                            </div>
                            {/* <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-1 text-sm">Topic</h3>
                <p className="text-gray-800">{response.topic || 'N/A'}</p>
              </div> */}
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <h3 className="font-medium text-gray-700 mb-1 text-sm">Difficulty</h3>
                                <p className="text-gray-800 capitalize">{response.difficulty?.toLowerCase() || 'Medium'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <h3 className="font-medium text-gray-700 mb-1 text-sm">Confidence Level</h3>
                                <p className="text-gray-800">{response.confidenceLevel || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewQuestionResponse;