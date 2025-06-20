import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiBarChart2 } from "react-icons/fi";

const AllUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/user/all`);
      
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const viewPerformance = (userId) => {
    navigate(`/admin/user/tests/${userId}`);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">All Registered Users</h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-indigo-50 text-indigo-700 font-medium p-4 rounded-t-lg">
            <div className="col-span-4 flex items-center gap-1">
              <FiUser /> Name
            </div>
            <div className="col-span-4 flex items-center gap-1">
              <FiMail /> Email
            </div>
            <div className="col-span-2 flex items-center gap-1">
              <FiPhone /> Mobile
            </div>
            <div className="col-span-2 flex items-center gap-1">
              <FiBarChart2 /> Performance
            </div>
          </div>

          {/* Users List */}
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 transition-colors"
              >
                <div className="md:col-span-4 font-medium text-gray-800 flex items-center gap-2">
                  <FiUser className="text-indigo-500" />
                  {user.name}
                </div>
                <div className="md:col-span-4 text-gray-600 truncate">
                  {user.email}
                </div>
                <div className="md:col-span-2 text-gray-600">
                  {user.mobile || 'Not provided'}
                </div>
                <div className="md:col-span-2 flex items-center">
                  <button
                    onClick={() => viewPerformance(user._id)}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                    title="View Performance"
                  >
                    <FiBarChart2 size={18} />
                    <span className="hidden sm:inline">View</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No users found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllUsersPage;