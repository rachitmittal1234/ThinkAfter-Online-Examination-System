import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { backendUrl } from '../App';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [hoveredTest, setHoveredTest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    mobile: ''
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) return navigate('/login');
    
    // Fetch user profile data
    axios.get(`${backendUrl}/api/user/profile/${storedUser._id}`)
      .then(res => {
        if (res.data.success) {
          setUser(res.data.user);
          setEditForm({
            name: res.data.user.name,
            mobile: res.data.user.mobile || ''
          });
        }
      })
      .catch(err => console.error('Error fetching user profile:', err));

    // Fetch stats data
    axios.get(`${backendUrl}/api/reports/overall/${storedUser._id}`)
      .then(res => {
        if (res.data.success) {
          setStats(res.data.data);
        }
      })
      .catch(err => console.error('Error fetching profile stats:', err));
  }, [navigate]);

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const validatePasswordForm = () => {
    const errors = {};
    let isValid = true;

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handleSaveProfile = async () => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/user/profile/${user._id}`,
        editForm
      );
      
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    try {
      const response = await axios.put(
        `${backendUrl}/api/user/change-password/${user._id}`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }
      );
      
      if (response.data.success) {
        setPasswordSuccess(true);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setPasswordSuccess(false);
          setShowPasswordModal(false);
        }, 3000);
      }
    } catch (error) {
      if (error.response && error.response.data.message === 'Current password is incorrect') {
        setPasswordErrors({
          ...passwordErrors,
          currentPassword: 'Current password is incorrect'
        });
      } else {
        console.error('Error changing password:', error);
      }
    }
  };

  // Prepare chart data for performance
  const chartData = {
    labels: stats ? Object.values(stats.performanceGraph).map(e => e.title || 'Test') : [],
    datasets: [
      {
        label: 'Performance (%)',
        data: stats ? Object.values(stats.performanceGraph).map(e => e.percentage) : [],
        borderColor: '#10B981',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
          return gradient;
        },
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10B981',
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHitRadius: 10
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `${context.parsed.y.toFixed(2)}%`;
          },
          title: function(context) {
            setHoveredTest(context[0].label);
            return context[0].label;
          }
        },
        displayColors: false,
        backgroundColor: '#1F2937',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 14
        },
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#6B7280'
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: '#E5E7EB',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          callback: function(value) {
            return value + '%';
          },
          stepSize: 20
        }
      }
    },
    onHover: (event, chartElement) => {
      if (chartElement.length > 0) {
        setHoveredTest(chartData.labels[chartElement[0].index]);
      } else {
        setHoveredTest(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Section */}
        {user && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">PROFILE INFORMATION</h2>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Change Password
                </button>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="text-gray-600 hover:text-gray-800 font-medium px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-1 rounded"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isEditing ? (
                <>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Name</p>
                    <p className="text-lg font-medium text-gray-900 mt-1">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="text-lg font-medium text-gray-900 mt-1">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Mobile</p>
                    <p className="text-lg font-medium text-gray-900 mt-1">
                      {user.mobile || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Member Since</p>
                    <p className="text-lg font-medium text-gray-900 mt-1">
                      {new Date(user.joiningDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm text-gray-500 uppercase tracking-wider mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 uppercase tracking-wider mb-1">
                      Mobile
                    </label>
                    <input
                      type="text"
                      name="mobile"
                      value={editForm.mobile}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter mobile number"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-blue-50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
                <button 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordErrors({});
                    setPasswordSuccess(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {passwordSuccess ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  Password changed successfully!
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 border rounded-md ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 border rounded-md ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 border rounded-md ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setPasswordErrors({});
                        setPasswordSuccess(false);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Change Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Rest of the profile page remains the same */}
        {/* Stats Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PERFORMANCE DASHBOARD</h1>
          </div>
          {stats && (
            <div className="mt-4 md:mt-0 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Tests</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.totalTests}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Score</p>
                  <p className="text-2xl font-bold text-green-600">{stats.avgScore}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Accuracy</p>
                  <p className="text-2xl font-bold text-green-600">{stats.avgAccuracy}%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">PERFORMANCE TREND</h2>
              {hoveredTest && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {hoveredTest}
                </div>
              )}
            </div>
          </div>
          <div className="p-6 h-96">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              label="Total Questions" 
              value={stats.totalAttempted + stats.totalUnattempted} 
              icon={
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
            <StatCard 
              label="Attempted" 
              value={stats.totalAttempted} 
              percentage={stats.totalAttempted > 0 ? `${((stats.totalAttempted / (stats.totalAttempted + stats.totalUnattempted)) * 100).toFixed(1)}%` : '0%'}
              icon={
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            />
            <StatCard 
              label="Correct" 
              value={stats.totalCorrect} 
              percentage={stats.totalAttempted > 0 ? `${((stats.totalCorrect / stats.totalAttempted) * 100).toFixed(1)}%` : '0%'}
              icon={
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            />
            <StatCard 
              label="Incorrect" 
              value={stats.totalIncorrect} 
              percentage={stats.totalAttempted > 0 ? `${((stats.totalIncorrect / stats.totalAttempted) * 100).toFixed(1)}%` : '0%'}
              icon={
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            />
          </div>
        )}

        {/* Test Highlights */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">TOP PERFORMANCE</h3>
              </div>
              {stats.highestScoringTest[1] ? (
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.highestScoringTest[1].title}</p>
                  <div className="mt-4 flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Score</p>
                      <p className="text-3xl font-bold text-green-600">{stats.highestScoringTest[1].percentage}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="text-lg font-medium text-gray-700">{stats.highestScoringTest[1].testDate}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No tests completed yet</p>
              )}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">NEEDS IMPROVEMENT</h3>
              </div>
              {stats.lowestScoringTest[1] ? (
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowestScoringTest[1].title}</p>
                  <div className="mt-4 flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Score</p>
                      <p className="text-3xl font-bold text-red-600">{stats.lowestScoringTest[1].percentage}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="text-lg font-medium text-gray-700">{stats.lowestScoringTest[1].testDate}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No tests completed yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, percentage, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start">
      <div className="mr-4 mt-1">
        {icon}
      </div>
      <div>
        <h4 className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-1">{label}</h4>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {percentage && (
          <p className={`text-sm mt-1 ${label === 'Incorrect' ? 'text-red-600' : 'text-green-600'}`}>
            {percentage}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default ProfilePage;