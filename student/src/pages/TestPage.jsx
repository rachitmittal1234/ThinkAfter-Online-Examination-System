import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import mockTests from '../data/mockTests.json';

const TestPage = () => {
  // console.log("✅ TestPage component loaded");
  const { testId } = useParams();
  const navigate = useNavigate();

  // console.log('URL param testId:', testId);
  // console.log('Loaded mockTests:', mockTests);

  const test = mockTests.find(t => t.id === testId);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(test ? test.duration * 60 : 0); // duration in seconds

  useEffect(() => {
    if (!test || submitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const handleChange = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    alert('Test submitted successfully!');
    navigate('/report', { state: { testId: test.id, answers } });
  };

  if (!test) {
    console.error('Test not found for testId:', testId);
    return <p className="p-4 text-red-600">Test not found.</p>;
  }

  if (!test.questions || test.questions.length === 0) {
    console.warn('Test found but no questions:', test);
    return <p className="p-4 text-yellow-600">No questions found in this test.</p>;
  }

  const groupedBySubject = test.questions.reduce((acc, q) => {
    if (!acc[q.subject]) acc[q.subject] = [];
    acc[q.subject].push(q);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded shadow">
        <h2 className="text-2xl font-semibold">{test.title}</h2>
        <div className="text-red-600 font-mono text-lg">
          Time Left: {formatTime(timeLeft)}
        </div>
      </div>

      {Object.keys(groupedBySubject).map((subject, i) => (
        <div key={i} className="mb-6">
          <h3 className="text-xl font-bold mb-2 text-blue-700">{subject}</h3>
          {groupedBySubject[subject].map((q, index) => (
            <div key={q.id} className="bg-white p-4 rounded-lg shadow mb-4 border">
              <p className="font-medium mb-2">
                Q{index + 1}: {q.questionText}
              </p>
              <div className="space-y-1">
                {q.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleChange(q.id, opt)}
                      className="accent-blue-600"
                    />
                    {opt}
                  </label>
                ))}
              </div>
              {/* <p className="text-sm text-gray-500 mt-1">Topic: {q.topic}</p> */}
            </div>
          ))}
        </div>
      ))}

      <div className="text-center">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded shadow-md hover:bg-green-700 transition"
          disabled={submitted}
        >
          Submit Test
        </button>
      </div>
    </div>
  );
};

export default TestPage;
