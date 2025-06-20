import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
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

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!storedUser || !token) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      const userId = parsed._id;

      axios
        .get(`${backendUrl}/api/reports/attempted/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          if (res.data.success && res.data.reports.length > 0) {
            setReports(res.data.reports);
          } else {
            setReports([]);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('🚨 Error fetching reports:', err);
          setLoading(false);
        });
    } catch (e) {
      console.error('🚨 Invalid user format in localStorage', e);
      setLoading(false);
    }
  }, []);

  if (!storedUser || !token) {
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
                      <p className="text-gray-600 mb-6">Please login to access your reports</p>
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
        <p className="text-lg text-gray-500">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <Navbar />
        <h2 className="text-2xl font-semibold text-blue-700 my-6">📊 Your Reports</h2>

        {reports.length === 0 ? (
          <p className="text-gray-500">No Reports Available</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
              <thead className="bg-gray-200 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Duration (min)</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr
                    key={report._id}
                    className={`hover:bg-gray-300 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{report.title}</td>
                    <td className="px-6 py-4 text-gray-700">{report.description}</td>
                    <td className="px-6 py-4 text-gray-700">{report.duration}</td>
                    <td className="px-6 py-4">
                      <button
                        className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
                        onClick={() => navigate(`/user/report/${report._id}/score`)}
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
