import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiCheckCircle, FiClock, FiArrowRight } from 'react-icons/fi';

const TestInstruction = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const test = state?.test;

  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const handleStart = () => {
    console.log("Navigating to:", test._id, test);
    navigate(`/start-test/${test._id}/0`, { state: { test } });
  };

  if (!test) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md text-center">
        <FiAlertCircle className="text-red-500 text-4xl mx-auto mb-4" />
        <p className="text-xl font-semibold text-gray-800">Test not found</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6">
          <h2 className="text-2xl font-bold">{test.title}</h2>
          <p className="opacity-90">Test Instructions</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Test Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-700">
              <FiClock className="mr-2 text-indigo-600" />
              <span>Duration: {test.duration} minutes</span>
            </div>
            <div className="flex items-center text-gray-700">
              <FiCheckCircle className="mr-2 text-indigo-600" />
              <span>Total Questions: {test.questions?.length || 0}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Important Instructions</h3>
            <div className="bg-indigo-50 rounded-lg p-4">
              {Array.isArray(test.instructions) ? (
                <ul className="space-y-2">
                  {test.instructions.map((instr, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      <span className="text-gray-700">{instr}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700">{test.instructions || 'No specific instructions provided.'}</p>
              )}
            </div>
          </div>

          {/* Agreement */}
          <div className="mb-8">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                id="agree"
                checked={isChecked}
                onChange={handleCheckboxChange}
                className="mt-1 form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="ml-3 text-gray-700">
                I confirm that I have read and understood all the instructions above.
                I'm ready to begin the test.
              </span>
            </label>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!isChecked}
            className={`w-full md:w-auto flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all ${
              isChecked
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Start Test</span>
            <FiArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestInstruction;