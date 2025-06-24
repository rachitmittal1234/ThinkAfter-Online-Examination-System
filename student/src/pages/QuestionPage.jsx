import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../App';

const QuestionPage = () => {
  const { testId, questionIndex } = useParams();
  const index = isNaN(parseInt(questionIndex)) ? 0 : parseInt(questionIndex);
  const { state } = useLocation();
  const navigate = useNavigate();

  const [test, setTest] = useState(state?.test || null);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [reviewStatus, setReviewStatus] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [activeSubject, setActiveSubject] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const timerRef = useRef(null);

  const question = questions[index];

  const handleSubmit = () => {
    navigate(`/summary/${testId}`, {
      state: {
        test,
        questions,
        answers,
        reviewStatus,
        isAutoSubmitted: true,
      },
    });
  };

  // Load test & questions
  useEffect(() => {
    const fetchTestAndQuestions = async () => {
      try {
        setIsLoading(true);

        const storedUser = JSON.parse(localStorage.getItem('user'));
        const userId = storedUser?._id;

        const [testRes, questionsRes] = await Promise.all([
          axios.get(`${backendUrl}/api/tests/${testId}`),
          axios.get(`${backendUrl}/api/questions/by-test/${testId}`)
        ]);

        setTest(testRes.data);
        setQuestions(questionsRes.data.questions);
        setFilteredQuestions(questionsRes.data.questions);

        // User-specific startedAt key
        const startedAtKey = `startedAt_${testId}_${userId}`;
        const durationInSeconds = testRes.data.duration * 60;
        const now = Date.now();
        const startedAt = localStorage.getItem(startedAtKey);
        let newStartedAt = startedAt ? parseInt(startedAt) : now;
        if (!startedAt) localStorage.setItem(startedAtKey, newStartedAt.toString());

        const elapsed = Math.floor((now - newStartedAt) / 1000);
        const remaining = durationInSeconds - elapsed;

        if (remaining <= 0) {
          handleSubmit();
        } else {
          setTimeLeft(remaining);
        }

        // Load answers/review status from user-specific storage
        const storedAnswers = JSON.parse(localStorage.getItem(`answers_${testId}_${userId}`)) || {};
        const storedReviewStatus = JSON.parse(localStorage.getItem(`reviewStatus_${testId}_${userId}`)) || {};

        const validatedAnswers = {};
        const validatedReviewStatus = {};

        questionsRes.data.questions.forEach((q, idx) => {
          if (storedAnswers[idx] !== undefined) validatedAnswers[idx] = storedAnswers[idx];
          if (storedReviewStatus[idx] !== undefined) validatedReviewStatus[idx] = storedReviewStatus[idx];
        });

        setAnswers(validatedAnswers);
        setReviewStatus(validatedReviewStatus);

      } catch (error) {
        console.error('Failed to load test or questions', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestAndQuestions();
  }, [testId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  // Persist answers & review status to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      const userId = JSON.parse(localStorage.getItem('user'))?._id;
      localStorage.setItem(`answers_${testId}_${userId}`, JSON.stringify(answers));
    }
  }, [answers, testId, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      const userId = JSON.parse(localStorage.getItem('user'))?._id;
      localStorage.setItem(`reviewStatus_${testId}_${userId}`, JSON.stringify(reviewStatus));
    }
  }, [reviewStatus, testId, isLoading]);

  // Subject filter
  useEffect(() => {
    if (activeSubject === 'All') {
      setFilteredQuestions(questions);
    } else {
      setFilteredQuestions(questions.filter(q => q.subject === activeSubject));
    }
  }, [activeSubject, questions]);

  const handleOptionSelect = (option) => {
    setAnswers(prev => ({ ...prev, [index]: option }));
  };

  const handleClearResponse = () => {
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const handleMarkForReview = () => {
    setReviewStatus(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleNext = () => {
    if (index + 1 < questions.length) {
      navigate(`/start-test/${testId}/${index + 1}`);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      navigate(`/start-test/${testId}/${index - 1}`);
    }
  };

  const handleShowSummary = () => {
    navigate(`/summary/${testId}`, {
      state: {
        test,
        questions,
        answers,
        reviewStatus,
      },
    });
  };

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const subjects = ['All', ...new Set(questions.map(q => q.subject))];

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!question) return <div className="p-4">Question not found</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-4 px-4 py-4 max-w-7xl mx-auto">
      {/* Mobile header */}
      <div className="lg:hidden flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-blue-700 truncate max-w-[180px]">{test?.title}</h2>
        <div className="flex items-center gap-2">
          <p className="text-red-600 font-mono text-sm">Time: {formatTime(timeLeft)}</p>
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 bg-gray-200 rounded"
          >
            {showSidebar ? 'Hide' : 'Palette'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 order-2 lg:order-1">
        <div className="hidden lg:flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-700">{test?.title}</h2>
          <p className="text-red-600 font-mono">Time Left: {formatTime(timeLeft)}</p>
        </div>

        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="text-lg font-semibold mb-2">Q{index + 1}. {question.questionText}</h3>
          {/* {question.image && (
            <div className="my-4">
              <img
                src={`${backendUrl}/uploads/questions/${question.image}`}
                alt="Question Visual"
                className="max-w-full max-h-72 border rounded"
              />
            </div>
          )} */}
          <p className="text-sm text-gray-600 mb-3">Subject: {question.subject}</p>
          <ul className="space-y-2">
            {question.options.map((opt, idx) => (
              <li
                key={idx}
                onClick={() => handleOptionSelect(opt)}
                className={`p-2 border rounded cursor-pointer ${answers[index] === opt ? 'bg-green-100 border-green-500' : 'hover:bg-gray-100'}`}
              >
                {opt}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button 
            onClick={handlePrev} 
            disabled={index === 0} 
            className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 text-sm sm:text-base"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={index + 1 >= questions.length}
            className={`px-3 py-1 sm:px-4 sm:py-2 text-white rounded transition-colors text-sm sm:text-base ${
              index + 1 >= questions.length
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Next
          </button>
          {index + 1 === questions.length && (
            <button
              onClick={handleShowSummary}
              className="px-3 py-1 sm:px-4 sm:py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm sm:text-base"
            >
              Summary
            </button>
          )}
          <button 
            onClick={handleClearResponse} 
            className="px-3 py-1 sm:px-4 sm:py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm sm:text-base"
          >
            Clear
          </button>
          <button 
            onClick={handleMarkForReview} 
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded hover:bg-purple-700 text-sm sm:text-base ${
              reviewStatus[index] ? 'bg-purple-800 text-white' : 'bg-purple-600 text-white'
            }`}
          >
            {reviewStatus[index] ? 'Unmark' : 'Mark'}
          </button>
        </div>
      </div>

      {/* Sidebar - Question Palette */}
      <div className={`${showSidebar ? 'block' : 'hidden'} lg:block w-full lg:w-64 order-1 lg:order-2 bg-white border rounded shadow p-4 mb-4 lg:mb-0`}>
        <h4 className="font-semibold mb-2 text-center">Question Palette</h4>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Filter by Subject:</label>
          <select
            value={activeSubject}
            onChange={(e) => setActiveSubject(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            {subjects.map((subject, i) => (
              <option key={i} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-4 gap-2">
          {filteredQuestions.map((q, i) => {
            const actualIndex = questions.findIndex(orig => orig._id === q._id);
            const isAnswered = answers[actualIndex] !== undefined;
            const isReviewed = reviewStatus[actualIndex];
            const isCurrent = actualIndex === index;

            let bgClass = 'bg-gray-200';
            if (isCurrent) bgClass = 'bg-blue-500 text-white';
            else if (isReviewed && isAnswered) bgClass = 'bg-purple-500 text-white';
            else if (isReviewed) bgClass = 'bg-purple-300';
            else if (isAnswered) bgClass = 'bg-green-300';

            return (
              <button
                key={q._id}
                onClick={() => {
                  navigate(`/start-test/${testId}/${actualIndex}`);
                  setShowSidebar(false);
                }}
                className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm rounded-full border ${bgClass}`}
              >
                {actualIndex + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-xs sm:text-sm space-y-1">
          <p><span className="inline-block w-3 h-3 bg-blue-500 mr-2 rounded-full"></span>Current</p>
          <p><span className="inline-block w-3 h-3 bg-green-300 mr-2 rounded-full"></span>Answered</p>
          <p><span className="inline-block w-3 h-3 bg-purple-300 mr-2 rounded-full"></span>Marked</p>
          <p><span className="inline-block w-3 h-3 bg-purple-500 mr-2 rounded-full"></span>Marked + Answered</p>
          <p><span className="inline-block w-3 h-3 bg-gray-200 mr-2 rounded-full"></span>Not Answered</p>
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;