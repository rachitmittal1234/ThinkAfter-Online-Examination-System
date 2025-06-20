import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TestReportNavbar from '../components/TestReportNavbar';
import { backendUrl } from '../App';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiFileText, FiRefreshCw, FiClock } from 'react-icons/fi';

const QuestionReportPage = () => {
  const { userId, testId } = useParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    subject: 'all',
    difficulty: 'all'
  });
  const [subjects, setSubjects] = useState([]);
  const [difficulties, setDifficulties] = useState([]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');

        // First get the test details to find all questions
        const testRes = await axios.get(
          `${backendUrl}/api/tests/${testId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Test response:', testRes.data); // Debug log
        
        // Then get the user's responses for this test
        const reportRes = await axios.get(
          `${backendUrl}/api/reports/report/${userId}/${testId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Report response:', reportRes.data); // Debug log
        
        const allQuestions = testRes.data.questions || [];
        const responses = reportRes.data.report || [];
        
        console.log('All questions:', allQuestions); // Debug log
        console.log('Responses:', responses); // Debug log
        
        // Create a map of question IDs to responses for quick lookup
        const responseMap = {};
        responses.forEach(response => {
          if (response.question && response.question._id) {
            responseMap[response.question._id] = response;
          }
        });
        
        // Create a complete report with all questions, including unattempted ones
        const completeReport = allQuestions.map((question, index) => {
          const response = responseMap[question._id];
          if (response) {
            return {
              ...response,
              subject: question.subject || 'General',
              difficulty: question.difficulty || 'Medium'
            };
          }
          return {
            question,
            selectedOption: null,
            isCorrect: false,
            positiveMarks: question.positiveMarks || 1,
            negativeMarks: question.negativeMarks || 0,
            confidenceLevel: null,
            subject: question.subject || 'General',
            difficulty: question.difficulty || 'Medium'
          };
        });

        // Extract unique subjects and difficulties
        const uniqueSubjects = [...new Set(completeReport.map(item => item.subject))];
        const uniqueDifficulties = [...new Set(completeReport.map(item => item.difficulty))];

        console.log('Complete report:', completeReport); // Debug log
        
        setReportData(completeReport);
        setFilteredData(completeReport);
        setSubjects(uniqueSubjects);
        setDifficulties(uniqueDifficulties);
      } catch (err) {
        console.error('Error loading question report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [userId, testId]);

  useEffect(() => {
    applyFilters();
  }, [filters, reportData]);

  const applyFilters = () => {
    let filtered = [...reportData];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(item => {
        if (filters.status === 'correct') return item.isCorrect;
        if (filters.status === 'incorrect') return item.selectedOption && !item.isCorrect;
        if (filters.status === 'skipped') return !item.selectedOption;
        return true;
      });
    }

    // Apply subject filter
    if (filters.subject !== 'all') {
      filtered = filtered.filter(item => item.subject === filters.subject);
    }

    // Apply difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(item => item.difficulty === filters.difficulty);
    }

    setFilteredData(filtered);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      subject: 'all',
      difficulty: 'all'
    });
  };

  const getScore = (entry) => {
    if (!entry.selectedOption) return 0;
    return entry.isCorrect ? entry.positiveMarks : -entry.negativeMarks;
  };

  const getStatusIcon = (entry) => {
    if (!entry.selectedOption) return <FiClock className="text-yellow-500 text-xl" />;
    return entry.isCorrect ? (
      <FiCheckCircle className="text-green-500 text-xl" />
    ) : (
      <FiXCircle className="text-red-500 text-xl" />
    );
  };

  const getStatusText = (entry) => {
    if (!entry.selectedOption) return 'Skipped';
    return entry.isCorrect ? 'Correct' : 'Incorrect';
  };

  const handleViewResponse = (entry) => {
    navigate(`/admin/user/tests/${userId}/${testId}/question/${entry.question._id}`, {
      state: entry
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <TestReportNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <TestReportNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Question Report</h1>
          <p className="text-lg text-gray-600">Detailed question-wise analysis</p>
        </motion.div>

        {/* Debug Info - Remove in production */}
        {/* <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-medium text-yellow-800">Debug Information</h3>
          <p className="text-sm text-yellow-700">
            User ID: {userId} | Test ID: {testId}
          </p>
          <p className="text-sm text-yellow-700">
            Report Data: {reportData.length} items | Filtered Data: {filteredData.length} items
          </p>
        </div> */}

        {/* Filter Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="correct">Correct</option>
                <option value="incorrect">Incorrect</option>
                <option value="skipped">Skipped</option>
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={filters.subject}
                onChange={(e) => setFilters({...filters, subject: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
              >
                <FiRefreshCw size={14} /> Reset Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Questions</h3>
            <p className="text-2xl font-bold text-gray-800">
              {filteredData.length} <span className="text-sm font-normal text-gray-500">/ {reportData.length}</span>
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Correct Answers</h3>
            <p className="text-2xl font-bold text-green-600">
              {filteredData.filter(item => item.isCorrect).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Average Score</h3>
            <p className="text-2xl font-bold text-blue-600">
              {filteredData.length > 0 
                ? (filteredData.reduce((sum, item) => sum + getScore(item), 0) / filteredData.length).toFixed(2)
                : '0.00'}
            </p>
          </div>
        </motion.div>

        {/* Questions Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="overflow-x-auto">
            {filteredData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No questions match the current filters
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-6 py-3">Q.No</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Difficulty</th>
                    <th className="px-6 py-3">Correct Answer</th>
                    <th className="px-6 py-3">Your Answer</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Confidence</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((entry, index) => (
                    <tr key={entry._id || entry.question._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(entry)}
                          <span className="hidden md:inline">{getStatusText(entry)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{entry.subject}</td>
                      <td className="px-6 py-4 capitalize">{entry.difficulty.toLowerCase()}</td>
                      <td className="px-6 py-4">{entry.question?.correctAnswer || '-'}</td>
                      <td className="px-6 py-4">{entry.selectedOption || '-'}</td>
                      <td className="px-6 py-4">{getScore(entry)}</td>
                      <td className="px-6 py-4">{entry.confidenceLevel || '-'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewResponse(entry)}
                          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          title="View response"
                        >
                          <FiFileText /> <span className="hidden md:inline">View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuestionReportPage;