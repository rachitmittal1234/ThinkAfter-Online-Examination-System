import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { backendUrl } from '../App';
import { FiEye, FiSave, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const errorTypes = [
    'Silly Mistake',
    'Conceptual Error',
    'Calculation Error',
    'Misinterpretation',
    'Missed/Skipped Reading',
    'Time Pressure',
    'Guessing',
    'Did Not Revise Topic',
    'Marked Wrong Option',
    'Lack of Practice',
    'Left Blank Intentionally',
    'Tricked by Options',
    'Application Error'
];

const DoAnalysisPage = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [report, setReport] = useState([]);
    const [analysisData, setAnalysisData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resQuestions, resReport] = await Promise.all([
                    axios.get(`${backendUrl}/api/questions/by-test/${testId}`),
                    axios.get(`${backendUrl}/api/reports/report/${user._id}/${testId}`)
                ]);

                setQuestions(resQuestions.data.questions);
                setReport(resReport.data.report);

                const resAnalysis = await axios.get(`${backendUrl}/api/post-analysis/${user._id}/${testId}`);
                const existingData = {};
                resAnalysis.data.analysis.forEach(item => {
                    existingData[item.question._id] = {
                        errorType: item.errorType,
                        notes: item.notes
                    };
                });
                setAnalysisData(existingData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [testId, user._id]);

    const getStatus = (questionId) => {
        const entry = report.find(r => r.question._id === questionId);
        if (!entry) return 'Unattempted';
        return entry.isCorrect ? 'Correct' : 'Incorrect';
    };

    const isCorrect = (questionId) => {
        return getStatus(questionId) === 'Correct';
    };

    const handleChange = (questionId, field, value) => {
        setAnalysisData(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                [field]: value
            }
        }));
    };

    const handleSave = async (questionId) => {
        if (!analysisData[questionId]) return;

        setIsSaving(true);
        try {
            const payload = {
                userId: user._id,
                testId: testId,
                questionId: questionId,
                isAttempted: getStatus(questionId) !== 'Unattempted',
                isCorrect: isCorrect(questionId),
                selectedOption: report.find(r => r.question._id === questionId)?.selectedOption || null,
                errorType: isCorrect(questionId) ? null : analysisData[questionId].errorType || null,
                notes: analysisData[questionId].notes || ''
            };

            await axios.post(`${backendUrl}/api/post-analysis/save`, payload);
            alert('Analysis saved successfully');
        } catch (err) {
            console.error('Save error:', err.response?.data || err.message);
            alert('Failed to save analysis');
        } finally {
            setIsSaving(false);
        }
    };

    const handleViewQuestion = (questionId) => {
        const question = questions.find(q => q._id === questionId);
        const response = report.find(r => r.question._id === questionId) || {
            question: { _id: questionId },
            isCorrect: false,
            selectedOption: null
        };

        if (question) {
            navigate(`/view-question-response/${questionId}`, {
                state: {
                    ...response,
                    question: question,
                    positiveMarks: question.positiveMarks || 1,
                    negativeMarks: question.negativeMarks || 0.25,
                    subject: question.subject,
                    topic: question.topic,
                    difficulty: question.difficulty
                }
            });
        }
    };

    const toggleExpand = (questionId) => {
        setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-semibold text-blue-700 mb-4 md:mb-6">Post Test Analysis</h2>
                <div className="text-right mb-4">
                    <button
                        onClick={() => navigate(`/user/analysis-report/${testId}`)}
                        className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        📊 View Analysis Report
                    </button>
                </div>


                {/* Desktop/Tablet View */}
                <div className="hidden md:block overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-200 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 w-12">Q.No</th>
                                <th className="px-4 py-3 w-24">Status</th>
                                <th className="px-4 py-3 w-20">View</th>
                                <th className="px-4 py-3 min-w-[150px]">Error Type</th>
                                <th className="px-4 py-3">Notes</th>
                                <th className="px-4 py-3 w-20">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {questions.map((q, idx) => (
                                <tr key={q._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center font-medium">{idx + 1}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs md:text-sm ${getStatus(q._id) === 'Correct' ? 'bg-green-100 text-green-800' :
                                                getStatus(q._id) === 'Incorrect' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {getStatus(q._id)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleViewQuestion(q._id)}
                                            className="flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 mx-auto"
                                        >
                                            <FiEye size={16} />
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        {isCorrect(q._id) ? (
                                            <div className="text-gray-500 text-sm italic">Correct Answer</div>
                                        ) : (
                                            <select
                                                value={analysisData[q._id]?.errorType || ''}
                                                onChange={(e) => handleChange(q._id, 'errorType', e.target.value)}
                                                className="border rounded p-2 w-full text-sm"
                                            >
                                                <option value="">Select error type</option>
                                                {errorTypes.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="text"
                                            value={analysisData[q._id]?.notes || ''}
                                            onChange={(e) => handleChange(q._id, 'notes', e.target.value)}
                                            className="border p-2 w-full rounded text-sm"
                                            placeholder="Add notes..."
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleSave(q._id)}
                                            disabled={isSaving}
                                            className={`flex items-center justify-center gap-1 px-3 py-2 rounded mx-auto text-sm ${isSaving ? 'bg-gray-300' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                }`}
                                        >
                                            <FiSave size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-3">
                    {questions.map((q, idx) => (
                        <div key={q._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div
                                className="flex items-center justify-between p-3 cursor-pointer"
                                onClick={() => toggleExpand(q._id)}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-700 rounded-full font-medium">
                                        {idx + 1}
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs ${getStatus(q._id) === 'Correct' ? 'bg-green-100 text-green-800' :
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
                                            onClick={() => handleViewQuestion(q._id)}
                                            className="flex-1 flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 border border-blue-200 rounded py-2"
                                        >
                                            <FiEye size={14} /> View
                                        </button>
                                        <button
                                            onClick={() => handleSave(q._id)}
                                            disabled={isSaving}
                                            className={`flex-1 flex items-center justify-center gap-1 rounded py-2 ${isSaving ? 'bg-gray-300' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                }`}
                                        >
                                            <FiSave size={14} /> Save
                                        </button>
                                    </div>

                                    {!isCorrect(q._id) && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Error Type</label>
                                            <select
                                                value={analysisData[q._id]?.errorType || ''}
                                                onChange={(e) => handleChange(q._id, 'errorType', e.target.value)}
                                                className="border rounded p-2 w-full text-sm"
                                            >
                                                <option value="">Select error type</option>
                                                {errorTypes.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                                        <textarea
                                            value={analysisData[q._id]?.notes || ''}
                                            onChange={(e) => handleChange(q._id, 'notes', e.target.value)}
                                            className="border p-2 w-full rounded text-sm h-20"
                                            placeholder="Add your notes here..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DoAnalysisPage;