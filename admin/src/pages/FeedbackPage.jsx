import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { FiTrash2, FiMenu, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState({});

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/anonymous/all`, {
        headers: { token }
      });

      if (res.data.success) {
        setFeedbacks(res.data.messages);
      } else {
        alert(res.data.message || 'Failed to fetch feedback');
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this feedback?');
  if (!confirmDelete) return;

  try {
    const res = await axios.delete(`${backendUrl}/api/anonymous/delete/${id}`, {
      headers: { token }
    });

    if (res.data.success) {
      toast.success('Feedback deleted successfully');
      setFeedbacks(prev => prev.filter(msg => msg._id !== id));
    } else {
      toast.error(res.data.message || 'Failed to delete feedback');
    }
  } catch (err) {
    console.error('Delete error:', err);
    toast.error('Error deleting feedback');
  }
};


  const toggleMessageExpansion = (id) => {
    setExpandedMessages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const truncateMessage = (message, length = 100) => {
    if (message.length <= length) return message;
    return message.substring(0, length) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading feedback...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Toggle for Mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white shadow-md text-gray-600 hover:text-indigo-500 focus:outline-none"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Main Content */}
      <div className={`flex-1 p-4 md:p-8 transition-all duration-300 ${sidebarOpen ? 'ml-[220px]' : 'ml-0'}`}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Anonymous Feedback</h1>

          {feedbacks.length === 0 ? (
            <p className="text-gray-500 text-center">No feedback messages found.</p>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto border border-gray-200">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">Feedback</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {feedbacks.map((fb) => (
                      <tr key={fb._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700 max-w-xl">
                          <div className="flex flex-col">
                            <span className="break-words">{truncateMessage(fb.text)}</span>
                            {fb.text.length > 100 && (
                              <button
                                onClick={() => toggleMessageExpansion(fb._id)}
                                className="text-indigo-600 hover:text-indigo-800 text-sm mt-1 flex items-center"
                              >
                                {expandedMessages[fb._id] ? (
                                  <>
                                    <FiChevronUp className="mr-1" /> Show Less
                                  </>
                                ) : (
                                  <>
                                    <FiChevronDown className="mr-1" /> View Full
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          {expandedMessages[fb._id] && (
                            <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                              <p className="break-words whitespace-pre-line">{fb.text}</p>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{new Date(fb.date).toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDelete(fb._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Message"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden">
                {feedbacks.map((fb) => (
                  <div key={fb._id} className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <p className="text-gray-500 text-sm">
                        {new Date(fb.date).toLocaleString()}
                      </p>
                      <button
                        onClick={() => handleDelete(fb._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Feedback"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-700 break-words">{truncateMessage(fb.text, 50)}</p>
                      {fb.text.length > 50 && (
                        <button
                          onClick={() => toggleMessageExpansion(fb._id)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm mt-1 flex items-center"
                        >
                          {expandedMessages[fb._id] ? (
                            <>
                              <FiChevronUp className="mr-1" /> Show Less
                            </>
                          ) : (
                            <>
                              <FiChevronDown className="mr-1" /> View Full
                            </>
                          )}
                        </button>
                      )}
                      {expandedMessages[fb._id] && (
                        <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                          <p className="break-words whitespace-pre-line">{fb.text}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
