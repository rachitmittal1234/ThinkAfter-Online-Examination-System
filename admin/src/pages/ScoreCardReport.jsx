import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import TestReportNavbar from '../components/TestReportNavbar';
import { backendUrl } from '../App';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiClock, FiBarChart2, FiAward, FiTrendingUp, FiDownload } from 'react-icons/fi';

const COLORS = ['#10B981', '#3B82F6', '#EF4444']; // Green, Blue, Red

const ScorecardReport = () => {
    const { userId, testId } = useParams();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [testDetails, setTestDetails] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch test details first
                const testRes = await axios.get(`${backendUrl}/api/tests/${testId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTestDetails(testRes.data);
                const totalQuestions = testRes.data.questions.length;

                // Fetch user responses - changed to match the endpoint used in ScoreCard
                const reportRes = await axios.get(
                    `${backendUrl}/api/reports/report/${userId}/${testId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                // Changed to match the response structure from ScoreCard
                const reportData = reportRes.data.report;

                let attempted = 0,
                    correct = 0,
                    incorrect = 0;
                let positiveMarks = 0,
                    negativeMarks = 0;

                const confidenceStats = {
                    '100% Sure': { correct: 0, incorrect: 0 },
                    'Partially Sure': { correct: 0, incorrect: 0 },
                    'Randomly Selected': { correct: 0, incorrect: 0 },
                };

                reportData.forEach((resp) => {
                    const posMark = resp.positiveMarks ?? 1;
                    const negMark = resp.negativeMarks ?? 0;

                    if (resp.selectedOption !== null) {
                        attempted++;

                        if (resp.isCorrect) {
                            correct++;
                            positiveMarks += posMark;
                        } else {
                            incorrect++;
                            negativeMarks += negMark;
                        }

                        const level = resp.confidenceLevel;
                        if (confidenceStats[level]) {
                            if (resp.isCorrect) {
                                confidenceStats[level].correct++;
                            } else {
                                confidenceStats[level].incorrect++;
                            }
                        }
                    }
                });

                const unattempted = totalQuestions - attempted;
                const finalScore = positiveMarks - negativeMarks;
                const maxPossibleMarks = testRes.data.questions.reduce(
                    (sum, q) => sum + (q.positiveMarks ?? 1),
                    0
                );
                const percentage = maxPossibleMarks > 0
                    ? Math.max((finalScore / maxPossibleMarks) * 100, 0).toFixed(2)
                    : '0.00';
                const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(2) : '0.00';

                setStats({
                    total: totalQuestions,
                    attempted,
                    correct,
                    incorrect,
                    unattempted,
                    positiveMarks,
                    negativeMarks,
                    finalScore,
                    percentage,
                    accuracy,
                    maxPossibleMarks,
                    confidenceStats,
                });
            } catch (error) {
                console.error('Error computing scorecard:', error);
                // Add error handling (e.g., show error message to user)
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userId, testId]);

    // Rest of your component remains the same...
    const pieData = stats
        ? [
            { name: 'Correct', value: stats.correct, color: COLORS[0] },
            { name: 'Unattempted', value: stats.unattempted, color: COLORS[1] },
            { name: 'Incorrect', value: stats.incorrect, color: COLORS[2] },
        ]
        : [];

    const barData = stats
        ? [
            { name: 'Your Score', value: stats.finalScore },
            { name: 'Max Score', value: stats.maxPossibleMarks },
        ]
        : [];

    const confidenceData = stats
        ? [
            {
                name: '100% Sure',
                correct: stats.confidenceStats['100% Sure'].correct,
                incorrect: stats.confidenceStats['100% Sure'].incorrect,
                fill: '#10B981'
            },
            {
                name: 'Partially Sure',
                correct: stats.confidenceStats['Partially Sure'].correct,
                incorrect: stats.confidenceStats['Partially Sure'].incorrect,
                fill: '#3B82F6'
            },
            {
                name: 'Randomly Selected',
                correct: stats.confidenceStats['Randomly Selected'].correct,
                incorrect: stats.confidenceStats['Randomly Selected'].incorrect,
                fill: '#EF4444'
            }
        ]
        : [];

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
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Test Performance</h1>
                    <p className="text-lg text-gray-600">Detailed analysis of your overall results</p>
                </motion.div>

                {/* {testId && (
                    <div className="flex justify-center mb-8">
                        <a
                            href={`${backendUrl}/api/questions/pdf/${testId}`}
                            download={`Test_${testId}_Questions.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                        >
                            <FiDownload className="mr-2" />
                            Download Test PDF with Answer Key
                        </a>
                    </div>
                )} */}

                {/* Score Highlights */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <ScoreHighlight
                        title="Final Score"
                        value={stats?.finalScore}
                        max={stats?.maxPossibleMarks}
                        icon={<FiAward className="text-indigo-600" size={24} />}
                        color="bg-indigo-100"
                        textColor="text-indigo-700"
                    />
                    <ScoreHighlight
                        title="Accuracy"
                        value={`${stats?.accuracy}%`}
                        icon={<FiCheckCircle className="text-green-600" size={24} />}
                        color="bg-green-100"
                        textColor="text-green-700"
                    />
                    <ScoreHighlight
                        title="Percentage"
                        value={`${stats?.percentage}%`}
                        icon={<FiBarChart2 className="text-blue-600" size={24} />}
                        color="bg-blue-100"
                        textColor="text-blue-700"
                    />
                </motion.div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Charts */}
                    <div className="space-y-8">
                        {/* Performance Breakdown */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-xl shadow-md p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <FiBarChart2 className="mr-2 text-indigo-600" /> Question Breakdown
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={90}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name, props) => [`${value} questions`, name]}
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: 'none',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Score Comparison */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="bg-white rounded-xl shadow-md p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Comparison</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#4F46E5" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Detailed Stats */}
                    <div className="space-y-8">
                        {/* Marks Breakdown */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-xl shadow-md p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Marks Breakdown</h3>
                            <div className="space-y-4">
                                <StatItem
                                    label="Positive Marks"
                                    value={`+${stats?.positiveMarks}`}
                                    icon={<FiCheckCircle className="text-green-500" />}
                                />
                                <StatItem
                                    label="Negative Marks"
                                    value={`-${stats?.negativeMarks}`}
                                    icon={<FiXCircle className="text-red-500" />}
                                />
                                <div className="border-t border-gray-200 pt-3">
                                    <StatItem
                                        label="Net Score"
                                        value={stats?.finalScore}
                                        isBold={true}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Attempt Stats */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="bg-white rounded-xl shadow-md p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Attempt Statistics</h3>
                            <div className="space-y-4">
                                <StatItem
                                    label="Total Questions"
                                    value={stats?.total}
                                    icon={<FiBarChart2 className="text-gray-500" />}
                                />
                                <StatItem
                                    label="Attempted"
                                    value={`${stats?.attempted} (${((stats?.attempted / stats?.total) * 100).toFixed(1)}%)`}
                                    icon={<FiCheckCircle className="text-blue-500" />}
                                />
                                <StatItem
                                    label="Unattempted"
                                    value={stats?.unattempted}
                                    icon={<FiClock className="text-yellow-500" />}
                                />
                            </div>
                        </motion.div>

                        {/* Accuracy Breakdown */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="bg-white rounded-xl shadow-md p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Accuracy Breakdown</h3>
                            <div className="space-y-4">
                                <StatItem
                                    label="Correct Answers"
                                    value={stats?.correct}
                                    icon={<FiCheckCircle className="text-green-500" />}
                                />
                                <StatItem
                                    label="Incorrect Answers"
                                    value={stats?.incorrect}
                                    icon={<FiXCircle className="text-red-500" />}
                                />
                                <div className="pt-2">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ width: `${stats?.accuracy}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 text-right">
                                        {stats?.accuracy}% Accuracy
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Confidence Analysis */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="bg-white rounded-xl shadow-md p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <FiTrendingUp className="mr-2 text-purple-600" /> Confidence Level Analysis
                            </h3>
                            <div className="space-y-6">
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={confidenceData}
                                            layout="vertical"
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="correct" name="Correct" stackId="a" fill="#10B981" radius={[0, 4, 4, 0]} />
                                            <Bar dataKey="incorrect" name="Incorrect" stackId="a" fill="#EF4444" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-4">
                                    {confidenceData.map((level) => (
                                        <div key={level.name} className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-700">{level.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    Accuracy: {level.correct + level.incorrect > 0
                                                        ? ((level.correct / (level.correct + level.incorrect)) * 100).toFixed(1) + '%'
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-green-600 font-semibold">{level.correct} ✅</span>
                                                <span className="text-red-600 font-semibold">{level.incorrect} ❌</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable Components
const ScoreHighlight = ({ title, value, max, icon, color, textColor }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`${color} rounded-xl shadow-sm p-6 flex flex-col items-center`}
    >
        <div className="mb-3">
            {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className={`text-3xl font-bold ${textColor} mt-1`}>{value}</p>
        {max && (
            <p className="text-xs text-gray-500 mt-1">out of {max}</p>
        )}
    </motion.div>
);

const StatItem = ({ label, value, icon, isBold = false }) => (
    <div className="flex justify-between items-center">
        <div className="flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            <span className={`text-gray-700 ${isBold ? 'font-medium' : ''}`}>{label}</span>
        </div>
        <span className={`${isBold ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
            {value}
        </span>
    </div>
);

export default ScorecardReport;