import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../../App';
import Navbar from '../../components/Navbar';
import ReportNavbar from '../../components/ReportNavbar';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { FiBook, FiCheckCircle, FiXCircle, FiClock, FiAward } from 'react-icons/fi';

const COLORS = ['#10B981', '#EF4444', '#3B82F6'];
const CONFIDENCE_COLORS = ['#22c55e', '#facc15', '#6366f1'];

const SubjectReport = () => {
    const { reportId } = useParams();
    const [subjects, setSubjects] = useState([]);
    const [activeSubject, setActiveSubject] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [testQuestions, setTestQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user'));

                const reportRes = await axios.get(
                    `${backendUrl}/api/reports/report/${user._id}/${reportId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setReportData(reportRes.data.report);

                const testId = reportRes.data.report[0]?.test;
                const testRes = await axios.get(`${backendUrl}/api/tests/${testId}`);
                const uniqueSubjects = [...new Set(testRes.data.questions.map(q => q.subject))];
                setSubjects(uniqueSubjects);
                setActiveSubject(uniqueSubjects[0]);
                setTestQuestions(testRes.data.questions);

            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [reportId]);

    const calculateSubjectStats = (subject) => {
        const subjectQuestions = testQuestions.filter(q => q.subject === subject);
        const subjectResponses = reportData.filter(resp => resp?.question?.subject === subject);

        let stats = {
            total: subjectQuestions.length,
            attempted: 0,
            correct: 0,
            incorrect: 0,
            positiveMarks: 0,
            negativeMarks: 0,
            confidenceStats: {
                '100% Sure': { correct: 0, incorrect: 0 },
                'Partially Sure': { correct: 0, incorrect: 0 },
                'Randomly Selected': { correct: 0, incorrect: 0 },
            },
        };

        subjectResponses.forEach(resp => {
            if (resp.selectedOption !== null && resp.selectedOption !== undefined) {
                stats.attempted++;
                if (resp.isCorrect) {
                    stats.correct++;
                    stats.positiveMarks += resp.positiveMarks ?? 1;
                } else {
                    stats.incorrect++;
                    stats.negativeMarks += resp.negativeMarks ?? 0;
                }

                const level = (resp.confidenceLevel || '').trim();
                if (level && stats.confidenceStats[level]) {
                    if (resp.isCorrect) stats.confidenceStats[level].correct++;
                    else stats.confidenceStats[level].incorrect++;
                }
            }
        });

        const finalScore = stats.positiveMarks - stats.negativeMarks;
        const maxPossibleMarks = subjectQuestions.reduce((sum, q) => sum + (q.positiveMarks ?? 1), 0);
        const percentage = maxPossibleMarks > 0
            ? Math.max((finalScore / maxPossibleMarks) * 100, 0).toFixed(2)
            : '0.00';
        const accuracy = stats.attempted > 0
            ? ((stats.correct / stats.attempted) * 100).toFixed(2)
            : '0.00';

        const pieData = [
            { name: 'Correct', value: stats.correct },
            { name: 'Incorrect', value: stats.incorrect },
            { name: 'Unattempted', value: stats.total - stats.attempted },
        ];

        const confidenceAccuracyBarData = Object.entries(stats.confidenceStats).map(([level, val]) => {
            const total = val.correct + val.incorrect;
            const acc = total > 0 ? ((val.correct / total) * 100).toFixed(1) : 0;
            return { name: level, accuracy: parseFloat(acc) };
        });

        return {
            subject,
            ...stats,
            finalScore,
            maxPossibleMarks,
            percentage,
            accuracy,
            pieData,
            confidenceAccuracyBarData
        };
    };

    if (loading) return <div className="min-h-screen bg-blue-50">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <ReportNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-6"
                >
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Subject-wise Report</h1>
                    <p className="text-lg text-gray-600">Detailed analysis of your subject-wise results </p>
                </motion.div>

                <div className="flex flex-wrap gap-3 justify-center mb-6">
                    {subjects.map((sub) => (
                        <button
                            key={sub}
                            onClick={() => setActiveSubject(sub)}
                            className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-all duration-200 ${activeSubject === sub ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                                }`}
                        >
                            {sub}
                        </button>
                    ))}
                </div>

                {activeSubject && (() => {
                    const stats = calculateSubjectStats(activeSubject);
                    return (
                        <div className="grid gap-6">
                            <div className="bg-white shadow rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-blue-700 mb-4">{stats.subject} Report</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Stat label="Total Questions" value={stats.total} />
                                    <Stat label="Attempted" value={stats.attempted} />
                                    <Stat label="Correct" value={stats.correct} />
                                    <Stat label="Incorrect" value={stats.incorrect} />
                                    <Stat label="Unattempted" value={stats.total - stats.attempted} />
                                    <Stat label="Final Score" value={`${stats.finalScore}/${stats.maxPossibleMarks}`} />
                                    <Stat label="Percentage" value={`${stats.percentage}%`} />
                                    <Stat label="Accuracy" value={`${stats.accuracy}%`} />
                                </div>
                            </div>

                            <div className="bg-white shadow rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Breakdown</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={85}
                                                paddingAngle={4}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {stats.pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>



                            <div className="bg-white shadow rounded-xl p-6">
                                <h3 className="text-lg font-medium text-gray-800 mb-2">Confidence Level Report</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {Object.entries(stats.confidenceStats).map(([level, val]) => {
                                        const total = val.correct + val.incorrect;
                                        const acc = total > 0 ? ((val.correct / total) * 100).toFixed(1) : '0.0';
                                        return (
                                            <div key={level} className="bg-gray-50 p-4 rounded-xl border">
                                                <p className="font-semibold text-gray-700 mb-2">{level}</p>
                                                <p className="text-sm text-green-600">Correct: {val.correct}</p>
                                                <p className="text-sm text-red-500">Incorrect: {val.incorrect}</p>
                                                <p className="text-sm text-blue-700 font-semibold">Accuracy: {acc}%</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white shadow rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Confidence Level Accuracy</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.confidenceAccuracyBarData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Bar dataKey="accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

const Stat = ({ label, value }) => (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex justify-between items-center">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="font-semibold text-blue-700">{value}</span>
    </div>
);

export default SubjectReport;
