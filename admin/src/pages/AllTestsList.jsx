import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiEye, FiClock, FiCalendar } from "react-icons/fi";

const AllTestsList = ({ token }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/tests/list`, {
        headers: { token },
      });

      if (response.data.success) {
        setTests(response.data.tests);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch tests.");
    } finally {
      setLoading(false);
    }
  };

  const removeTest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    
    try {
      const response = await axios.delete(`${backendUrl}/api/tests/${id}`, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchTests(); // Refresh the list after deletion
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete test.");
    }
  };

  const viewQuestions = (testId) => {
    navigate(`/admin/tests/${testId}/questions`);
  };

  useEffect(() => {
    fetchTests();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">All Created Tests</h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-indigo-50 text-indigo-700 font-medium p-4 rounded-t-lg">
            <div className="col-span-4">Title</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-2 flex items-center gap-1">
              <FiClock /> Duration
            </div>
            <div className="col-span-2 flex items-center gap-1">
              <FiCalendar /> Date
            </div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Test List */}
          {tests.length > 0 ? (
            tests.map((test) => (
              <div
                key={test._id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 transition-colors"
              >
                <div className="md:col-span-4 font-medium text-gray-800">
                  {test.title}
                </div>
                <div className="md:col-span-3 text-gray-600 truncate">
                  {test.description}
                </div>
                <div className="md:col-span-2 flex items-center gap-1 text-gray-600">
                  {/* <FiClock className="text-indigo-500" /> */}
                  {test.duration} min
                </div>
                <div className="md:col-span-2 text-gray-600">
                  {new Date(test.testDate).toLocaleDateString()}
                </div>
                <div className="md:col-span-1 flex items-center justify-end gap-3">
                  <button
                    onClick={() => viewQuestions(test._id)}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                    title="View Questions"
                  >
                    <FiEye size={18} />
                  </button>
                  <button
                    onClick={() => removeTest(test._id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete Test"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No tests found. Create your first test to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllTestsList;