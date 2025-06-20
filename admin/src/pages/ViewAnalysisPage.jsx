import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import Navbar from '../components/Navbar';
import { backendUrl } from '../App';
import { FiEye, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ViewAnalysisPage = () => {
  const { userId, testId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [report, setReport] = useState([]);
  const [analysis, setAnalysis] = useState([]);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resQuestions, resReport, resAnalysis] = await Promise.all([
          axios.get(`${backendUrl}/api/questions/by-test/${testId}`),
          axios.get(`${backendUrl}/api/reports/report/${userId}/${testId}`),
          axios.get(`${backendUrl}/api/post-analysis/${userId}/${testId}`)
        ]);

        setQuestions(resQuestions.data.questions);
        setReport(resReport.data.report);
        setAnalysis(resAnalysis.data.analysis);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [userId, testId]);

  const getStatus = (questionId) => {
    const entry = report.find(r => r.question._id === questionId);
    if (!entry) return 'Unattempted';
    return entry.isCorrect ? 'Correct' : 'Incorrect';
  };

  const getAnalysisEntry = (questionId) => {
    return analysis.find(a => a.question._id === questionId);
  };

  const handleViewQuestion = (q) => {
    const reportEntry = report.find(r => r.question._id === q._id);
    navigate(`/admin/user/tests/${userId}/${testId}/question/${q._id}`, {
      state: {
        ...reportEntry,
        question: q,
        subject: q.subject,
        topic: q.topics?.[0],
        positiveMarks: q.positiveMarks || 1,
        negativeMarks: q.negativeMarks || 0.25,
        difficulty: q.difficulty || 'Medium'
      }
    });
  };

  const toggleExpand = (qid) => {
    setExpandedQuestion(prev => prev === qid ? null : qid);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <div className="p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-semibold text-blue-700 mb-4 md:mb-6">User's Post Test Analysis</h2>
        <div className="text-right mb-4">
                    <button
                        onClick={() => navigate(`/admin/user/tests/${userId}/${testId}/analysis/report`)}
                        
                        className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        📊 View Analysis Report
                    </button>
                </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-3 w-12">Q.No</th>
                <th className="px-4 py-3 w-24">Status</th>
                <th className="px-4 py-3 w-20">View</th>
                <th className="px-4 py-3 min-w-[150px]">Error Type</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {questions.map((q, idx) => {
                const analysisEntry = getAnalysisEntry(q._id);
                return (
                  <tr key={q._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center font-medium">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        getStatus(q._id) === 'Correct' ? 'bg-green-100 text-green-800' :
                        getStatus(q._id) === 'Incorrect' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatus(q._id)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewQuestion(q)}
                        className="flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 mx-auto"
                      >
                        <FiEye size={16} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-sm">
                      {getStatus(q._id) === 'Correct' ? (
                        <span className="text-gray-400 italic">Correct Answer</span>
                      ) : (
                        analysisEntry?.errorType || 'N/A'
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {analysisEntry?.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {questions.map((q, idx) => {
            const analysisEntry = getAnalysisEntry(q._id);
            return (
              <div key={q._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => toggleExpand(q._id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-700 rounded-full font-medium">
                      {idx + 1}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      getStatus(q._id) === 'Correct' ? 'bg-green-100 text-green-800' :
                      getStatus(q._id) === 'Incorrect' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatus(q._id)}
                    </span>
                  </div>
                  <button className="text-gray-500">
                    {expandedQuestion === q._id ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>

                {expandedQuestion === q._id && (
                  <div className="p-3 border-t border-gray-200 space-y-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewQuestion(q)}
                        className="flex-1 flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 border border-blue-200 rounded py-2"
                      >
                        <FiEye size={14} /> View
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Error Type</label>
                      <p className="text-sm text-gray-800">
                        {getStatus(q._id) === 'Correct' ? <i className="text-gray-400">Correct Answer</i> : (analysisEntry?.errorType || 'N/A')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{analysisEntry?.notes || '-'}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ViewAnalysisPage;
