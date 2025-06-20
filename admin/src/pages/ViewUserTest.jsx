import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../App';
import { 
  FiX, 
  FiCheck,
  FiLogIn,
  FiBarChart2 
} from 'react-icons/fi';

const ViewUserTest = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ 
    attempted: [], 
    missed: [] 
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchTestStatus = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/reports/status/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStatus({
          attempted: res.data.result.attempted || [],
          missed: res.data.result.missed || []
        });
      } catch (err) {
        console.error('Error fetching test status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestStatus();
  }, [token, userId]);

  if (!token) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-md mx-auto px-4 py-20">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLogIn className="text-red-500 text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Authentication Required</h2>
              <p className="text-gray-600 mb-6">Please login to access user tests</p>
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
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-lg text-gray-500">Loading test data...</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  const formatTime = (timeString) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString("en-IN", { 
      timeZone: "Asia/Kolkata",
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-blue-700 my-6">📋 User Test History</h2>

        <div className="mb-10">
          <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
            <FiCheck className="text-green-500 mr-2" />
            Attempted Tests
          </h3>
          {status.attempted.length === 0 ? (
            <p className="text-gray-500">No attempted tests found</p>
          ) : (
            <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200 mb-8">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                <thead className="bg-gray-200 text-gray-700 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Duration (min)</th>
                    <th className="px-6 py-3">Report</th>
                    <th className="px-6 py-3">Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {status.attempted.map((test, index) => (
                    <tr
                      key={test._id}
                      className={`hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{test.title}</td>
                      <td className="px-6 py-4 text-gray-700">{test.description}</td>
                      <td className="px-6 py-4 text-gray-700">{formatDate(test.testDate)}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {formatTime(test.startTime)} - {formatTime(test.endTime)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{test.duration}</td>
                      <td className="px-6 py-4">
                        <button
                          className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
                          onClick={() => navigate(`/admin/user/tests/${userId}/${test._id}/scorecard`)}
                        >
                          View Report
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="bg-purple-600 text-white px-4 py-1.5 rounded hover:bg-purple-700 transition flex items-center"
                          onClick={() => navigate(`/admin/user/tests/${userId}/${test._id}/analysis`)}
                        >
                          <FiBarChart2 className="mr-1" />
                          View Analysis
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mb-10">
          <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
            <FiX className="text-red-500 mr-2" />
            Missed Tests
          </h3>
          {status.missed.length === 0 ? (
            <p className="text-gray-500">No missed tests found</p>
          ) : (
            <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                <thead className="bg-gray-200 text-gray-700 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Duration (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {status.missed.map((test, index) => (
                    <tr
                      key={test._id}
                      className={`hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{test.title}</td>
                      <td className="px-6 py-4 text-gray-700">{test.description}</td>
                      <td className="px-6 py-4 text-gray-700">{formatDate(test.testDate)}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {formatTime(test.startTime)} - {formatTime(test.endTime)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{test.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewUserTest;