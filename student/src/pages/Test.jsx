import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { backendUrl } from '../App';
import { 
  FiAlertCircle, 
  FiClock, 
  FiX, 
  FiCheck, 
  FiPlay,
  FiLogIn,
  FiCalendar
} from 'react-icons/fi';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const Test = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ 
    attempted: [], 
    upcoming: [], 
    missed: [], 
    active: [] 
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchTestStatus = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const res = await axios.get(`${backendUrl}/api/reports/status/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStatus({
          attempted: res.data.result.attempted,
          upcoming: res.data.result.upcoming,
          missed: res.data.result.missed,
          active: res.data.result.active
        });
      } catch (err) {
        console.error('Error fetching test status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestStatus();
  }, [token]);

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
            <p className="text-gray-600 mb-6">Please login to access your tests</p>
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

  const nowIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(nowIST);
  const todayStr = istDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const currentTime = istDate.getHours() * 60 + istDate.getMinutes();

  const parseTimeToMinutes = (dateStr) => {
    const date = new Date(dateStr).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const parsed = new Date(date);
    return parsed.getHours() * 60 + parsed.getMinutes();
  };

  const categorized = {
    attempted: [],
    active: [],
    upcoming: [],
    missed: []
  };

  tests.forEach(test => {
    const testDateStr = new Date(test.testDate).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const isAttempted = attemptedTests.includes(test._id);

    const startTime = parseTimeToMinutes(test.startTime);
    const endTime = parseTimeToMinutes(test.endTime);
    const isToday = testDateStr === todayStr;
    const isActiveNow = isToday && currentTime >= startTime && currentTime <= endTime;

    if (isAttempted) {
      categorized.attempted.push(test);
    } else if (isActiveNow) {
      categorized.active.push(test);
    } else if (new Date(test.testDate) > istDate) {
      categorized.upcoming.push(test);
    } else if (new Date(test.testDate) < istDate || (isToday && currentTime > endTime)) {
      categorized.missed.push(test);
    }
  });

  const handleStartTest = (test) => {
    navigate(`/instructions/${test._id}`, { state: { test } });
  };

  const TestCard = ({ test, type }) => {
    const testDate = new Date(test.testDate).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    const startTime = new Date(test.startTime).toLocaleTimeString("en-IN", { 
      timeZone: "Asia/Kolkata",
      hour: '2-digit',
      minute: '2-digit'
    });
    const endTime = new Date(test.endTime).toLocaleTimeString("en-IN", { 
      timeZone: "Asia/Kolkata",
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div className={`bg-white rounded-xl shadow-md overflow-hidden border-l-4 ${
        type === 'active' ? 'border-green-500 hover:shadow-green-100' :
        type === 'upcoming' ? 'border-yellow-500 hover:shadow-yellow-100' :
        type === 'missed' ? 'border-red-500 hover:shadow-red-100' : 
        'border-blue-500 hover:shadow-blue-100'
      } hover:shadow-lg transition-all duration-200`}>
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-gray-800">{test.title}</h3>
            {/* {type === 'attempted' && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                
              </span>
            )} */}
          </div>

          <p className="text-gray-600 text-sm mb-4">{test.description}</p>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <FiClock className="mr-1" />
              <span>{test.duration} mins</span>
            </div>
            <div className="flex items-center">
              <FiCalendar className="mr-1" />
              <span>{testDate}</span>
            </div>
            <div className="flex items-center col-span-2">
              <FiClock className="mr-1" />
              <span>{startTime} - {endTime}</span>
            </div>
          </div>

          {type === 'active' && (
            <button
              onClick={() => handleStartTest(test)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-all flex items-center justify-center"
            >
              <FiPlay className="mr-2" />
              Start Test
            </button>
          )}

          {type === 'upcoming' && (
            <div className="text-center py-2 text-yellow-600 bg-yellow-50 rounded-lg text-sm font-medium">
              <FiClock className="inline mr-1" />
              Coming Soon
            </div>
          )}

          {type === 'missed' && (
            <div className="text-center py-2 text-red-600 bg-red-50 rounded-lg text-sm font-medium">
              {/* <FiX className="inline mr-1" /> */}
              Missed
            </div>
          )}

          {type === 'attempted' && (
            <button
              onClick={() => navigate(`/report`)}
              className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 rounded-lg transition-all flex items-center justify-center"
            >
              {/* <FiCheck className="mr-2" /> */}
              View Results
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderTests = (tests, label, icon, type) => (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="text-xl font-semibold ml-2">{label}</h2>
      </div>
      {tests.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          No tests in this category
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {tests.map(test => (
            <TestCard key={test._id} test={test} type={type} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-6  bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <Navbar />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Tests</h1>
          <p className="text-gray-600">Manage and take your scheduled tests</p>
        </div>

        {renderTests(status.active, 'Active Tests', <FiAlertCircle className="text-green-500 text-xl" />, 'active')}
        {renderTests(status.upcoming, 'Upcoming Tests', <FiClock className="text-yellow-500 text-xl" />, 'upcoming')}
        {renderTests(status.missed, 'Missed Tests', <FiX className="text-red-500 text-xl" />, 'missed')}
        {renderTests(status.attempted, 'Attempted Tests', <FiCheck className="text-blue-500 text-xl" />, 'attempted')}
      </div>
    </div>
  );
};

export default Test;