import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { FiTrash2, FiMenu, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';

const AdminContactMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState({});

  const token = localStorage.getItem('token'); // Admin token

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
  try {
    const res = await axios.get(`${backendUrl}/api/contact/all`, {
      headers: { token }
    });

    if (res.data.success) {
      setMessages(res.data.messages);
    } else {
      toast.error(res.data.message || 'Failed to fetch messages');
    }
  } catch (err) {
    console.error('Error fetching messages:', err);
    toast.error('Error fetching contact messages');
  } finally {
    setLoading(false);
  }
};


  const handleDelete = async (id) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this message?');
  if (!confirmDelete) return;

  try {
    const res = await axios.delete(`${backendUrl}/api/contact/${id}`, {
      headers: { token }
    });

    if (res.data.success) {
      toast.success('Message deleted successfully');
      setMessages(prev => prev.filter(msg => msg._id !== id));
    } else {
      toast.error(res.data.message || 'Failed to delete message');
    }
  } catch (err) {
    console.error('Delete error:', err);
    toast.error('Error deleting message');
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
        Loading messages...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Button (only visible on small screens) */}
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Queries</h1>

          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">No contact messages found.</p>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto border border-gray-200">
              <div className="hidden md:block">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Message</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {messages.map((msg) => (
                      <tr key={msg._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{msg.name}</td>
                        <td className="px-4 py-3 text-blue-600">{msg.email}</td>
                        <td className="px-4 py-3 text-gray-700 max-w-md">
                          <div className="flex flex-col">
                            <span className="break-words">
                              {truncateMessage(msg.message)}
                            </span>
                            {msg.message.length > 100 && (
                              <button
                                onClick={() => toggleMessageExpansion(msg._id)}
                                className="text-indigo-600 hover:text-indigo-800 text-sm mt-1 flex items-center"
                              >
                                {expandedMessages[msg._id] ? (
                                  <>
                                    <FiChevronUp className="mr-1" /> Show Less
                                  </>
                                ) : (
                                  <>
                                    <FiChevronDown className="mr-1" /> View Full Message
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          {expandedMessages[msg._id] && (
                            <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                              <p className="break-words whitespace-pre-line">{msg.message}</p>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{new Date(msg.date).toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDelete(msg._id)}
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
                {messages.map((msg) => (
                  <div key={msg._id} className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{msg.name}</h3>
                        <p className="text-blue-600 text-sm">{msg.email}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          {new Date(msg.date).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(msg._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Message"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-700 break-words">
                        {truncateMessage(msg.message, 50)}
                      </p>
                      {msg.message.length > 50 && (
                        <button
                          onClick={() => toggleMessageExpansion(msg._id)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm mt-1 flex items-center"
                        >
                          {expandedMessages[msg._id] ? (
                            <>
                              <FiChevronUp className="mr-1" /> Show Less
                            </>
                          ) : (
                            <>
                              <FiChevronDown className="mr-1" /> View Full Message
                            </>
                          )}
                        </button>
                      )}
                      {expandedMessages[msg._id] && (
                        <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                          <p className="break-words whitespace-pre-line">{msg.message}</p>
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

export default AdminContactMessagesPage;