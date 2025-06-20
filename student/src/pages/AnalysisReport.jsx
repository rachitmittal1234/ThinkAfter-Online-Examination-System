import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { backendUrl } from '../App';
import { FiChevronLeft, FiFilter, FiX, FiBarChart2 } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalysisReportPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [subjectTopicsMap, setSubjectTopicsMap] = useState({});
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedErrorType, setSelectedErrorType] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const [viewMode, setViewMode] = useState('subject'); // 'subject' or 'error'

  const errorTypes = [
    'Silly Mistake',
    'Conceptual Error',
    'Calculation Error',
    'Misinterpretation',
    'Missed/Skipping',
    'Time Pressure',
    'Guessing',
    'Did Not Revise Topic',
    'Wrong Option',
    'Lack of Practice',
    'Left Blank Intentionally',
    'Tricked by Options',
    'Application Error'
  ];

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/post-analysis/${user._id}/${testId}`);
        setAnalysisData(response.data.analysis);
        
        // Process subjects and topics
        const subjectMap = new Set();
        const subjectTopics = {};
        
        response.data.analysis.forEach(item => {
          if (!item.question?.subject) return;
          
          subjectMap.add(item.question.subject);
          
          if (!subjectTopics[item.question.subject]) {
            subjectTopics[item.question.subject] = new Set();
          }
          
          if (item.question.topics) {
            item.question.topics.forEach(topic => {
              subjectTopics[item.question.subject].add(topic);
            });
          }
        });
        
        setSubjects(Array.from(subjectMap));
        setSubjectTopicsMap(subjectTopics);
        
      } catch (error) {
        console.error('Error fetching analysis data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysisData();
  }, [testId, user._id]);

  useEffect(() => {
    // Filter data based on selections
    let filtered = analysisData;
    
    if (viewMode === 'subject') {
      if (selectedSubject !== 'all') {
        filtered = filtered.filter(item => 
          item.question?.subject === selectedSubject
        );
        
        if (selectedTopic !== 'all') {
          filtered = filtered.filter(item => 
            item.question?.topics?.includes(selectedTopic)
          );
        }
      }
    } else { // Error Wise view
      if (selectedErrorType !== 'all') {
        filtered = filtered.filter(item => 
          item.errorType === selectedErrorType
        );
      }
    }
    
    setFilteredData(filtered);
  }, [analysisData, selectedSubject, selectedTopic, selectedErrorType, viewMode]);

  const resetFilters = () => {
    if (viewMode === 'subject') {
      setSelectedSubject('all');
      setSelectedTopic('all');
    } else {
      setSelectedErrorType('all');
    }
  };

  // Calculate statistics
  const totalAttemptedQuestions = filteredData.filter(item => 
    item.selectedOption !== null && item.selectedOption !== undefined
  ).length;

  const totalSkippedQuestions = filteredData.filter(item => 
    item.selectedOption === null || item.selectedOption === undefined
  ).length;

  const totalWrongQuestions = filteredData.filter(item => 
    item.selectedOption !== null && 
    item.selectedOption !== undefined && 
    item.selectedOption !== item.question?.correctAnswer
  ).length;

  const totalAnalyzedQuestions = filteredData.filter(item => 
    item.errorType
  ).length;

  // Subject View Charts
  const getSubjectErrorTypeChart = () => {
    const errorTypeCounts = {};
    errorTypes.forEach(type => {
      errorTypeCounts[type] = 0;
    });

    filteredData.forEach(item => {
      if (item.errorType && errorTypes.includes(item.errorType)) {
        errorTypeCounts[item.errorType]++;
      }
    });

    return {
      labels: errorTypes,
      datasets: [{
        label: 'Error Count',
        data: errorTypes.map(type => errorTypeCounts[type]),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: '#1D4ED8',
      }]
    };
  };

  // Error Wise View Charts
  const getErrorWiseSubjectChart = () => {
    const subjectCounts = {};
    subjects.forEach(subject => {
      subjectCounts[subject] = 0;
    });

    filteredData.forEach(item => {
      if (item.errorType && item.question?.subject) {
        subjectCounts[item.question.subject]++;
      }
    });

    return {
      labels: subjects,
      datasets: [{
        label: 'Error Count',
        data: subjects.map(subject => subjectCounts[subject]),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: '#047857',
      }]
    };
  };

  const getErrorWiseTopicChart = () => {
    const allTopics = Object.values(subjectTopicsMap).flatMap(set => Array.from(set));
    const topicCounts = {};
    
    allTopics.forEach(topic => {
      topicCounts[topic] = 0;
    });

    filteredData.forEach(item => {
      if (item.errorType && item.question?.topics) {
        item.question.topics.forEach(topic => {
          if (allTopics.includes(topic)) {
            topicCounts[topic]++;
          }
        });
      }
    });

    return {
      labels: allTopics,
      datasets: [{
        label: 'Error Count',
        data: allTopics.map(topic => topicCounts[topic]),
        backgroundColor: '#F59E0B',
        borderColor: '#D97706',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: '#B45309',
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} errors`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        },
        grid: {
          color: '#E5E7EB'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-4 md:p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-200"
            >
              <FiChevronLeft size={20} />
            </button>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Test Analysis Report</h2>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                setViewMode('subject');
                setSelectedErrorType('all');
              }}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                viewMode === 'subject' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiBarChart2 size={16} /> Subject Wise
            </button>
            <button
              onClick={() => {
                setViewMode('error');
                setSelectedSubject('all');
                setSelectedTopic('all');
              }}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                viewMode === 'error' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiBarChart2 size={16} /> Error Wise
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-medium text-gray-700 flex items-center">
              <FiFilter className="mr-2" /> Filter Results
            </h3>
            
            {((viewMode === 'subject' && (selectedSubject !== 'all' || selectedTopic !== 'all')) || 
              (viewMode === 'error' && selectedErrorType !== 'all')) && (
              <button 
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <FiX size={14} /> Reset Filters
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {viewMode === 'subject' ? (
              <>
                {/* Subjects */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Subjects</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedSubject('all');
                        setSelectedTopic('all');
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedSubject === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Subjects
                    </button>
                    {subjects.map(subject => (
                      <button
                        key={subject}
                        onClick={() => {
                          setSelectedSubject(subject);
                          setSelectedTopic('all');
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm ${
                          selectedSubject === subject
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Topics */}
                {selectedSubject !== 'all' && subjectTopicsMap[selectedSubject]?.size > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Topics in {selectedSubject}</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedTopic('all')}
                        className={`px-3 py-1.5 rounded-full text-sm ${
                          selectedTopic === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All Topics
                      </button>
                      {Array.from(subjectTopicsMap[selectedSubject]).map(topic => (
                        <button
                          key={topic}
                          onClick={() => setSelectedTopic(topic)}
                          className={`px-3 py-1.5 rounded-full text-sm ${
                            selectedTopic === topic
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Error Types</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedErrorType('all')}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      selectedErrorType === 'all'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Errors
                  </button>
                  {errorTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedErrorType(type)}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedErrorType === type
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Attempted Questions</h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-semibold text-gray-800">
                {totalAttemptedQuestions}
              </p>
              <div className="text-sm text-gray-500">
                <span className="text-red-500">{totalWrongQuestions} wrong</span>
                {' '}•{' '}
                <span className="text-gray-500">{totalSkippedQuestions} skipped</span>
              </div>
            </div>
          </div> */}
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Analyzed Questions</h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-semibold text-gray-800">
                {totalAnalyzedQuestions}
              </p>
              {/* <div className="text-sm text-gray-500">
                {totalAnalyzedQuestions > 0 ? (
                  <span>{Math.round((totalAnalyzedQuestions / totalAttemptedQuestions) * 100)}% analyzed</span>
                ) : (
                  <span>No analysis yet</span>
                )}
              </div> */}
            </div>
          </div>
        </div>

        {/* Chart Section */}
        {viewMode === 'subject' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              {selectedSubject === 'all' ? 'All Subjects' : selectedSubject}
              {selectedTopic !== 'all' && ` > ${selectedTopic}`} - Error Types Distribution
            </h3>
            <div className="h-96">
              <Bar 
                data={getSubjectErrorTypeChart()} 
                options={chartOptions}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Error Distribution by Subject
                  {selectedErrorType !== 'all' && ` (${selectedErrorType})`}
                </h3>
                <div className="h-96">
                  <Bar 
                    data={getErrorWiseSubjectChart()} 
                    options={chartOptions}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Error Distribution by Topic
                  {selectedErrorType !== 'all' && ` (${selectedErrorType})`}
                </h3>
                <div className="h-96">
                  <Bar 
                    data={getErrorWiseTopicChart()} 
                    options={chartOptions}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Questions with Errors ({totalAnalyzedQuestions})
          </h3>
          
          {totalAnalyzedQuestions > 0 ? (
            <div className="space-y-4">
              {filteredData
                .filter(item => item.errorType)
                .map((item, index) => {
                  // Get the correct answer text
                  const correctAnswer = item.question?.correctAnswer;
                  // If correctAnswer is a letter (A, B, C, D), get the full option text
                  const correctOptionText = ['A', 'B', 'C', 'D'].includes(correctAnswer) 
                    ? item.question?.options[correctAnswer.charCodeAt(0) - 65]
                    : correctAnswer;

                  // Get the selected option text
                  const selectedOptionText = ['A', 'B', 'C', 'D'].includes(item.selectedOption)
                    ? item.question?.options[item.selectedOption.charCodeAt(0) - 65]
                    : item.selectedOption;

                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-3">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Q{index + 1}
                          </span>
                          <div>
                            <p className="text-gray-800 font-medium">
                              {item.question?.questionText}
                              {item.question?.image && (
  <div className="mt-2">
    <img
      src={`${backendUrl}/uploads/questions/${item.question.image}`}
      alt="Question"
      className="max-w-full max-h-72 border rounded"
    />
  </div>
)}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                                {item.question?.subject}
                              </span>
                              {item.question?.topics?.map((topic, i) => (
                                <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded whitespace-nowrap">
                          {item.errorType}
                        </span>
                      </div>
                      
                      {item.notes && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Notes:</h4>
                          <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded">{item.notes}</p>
                        </div>
                      )}
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Selected Option:</h4>
                          <p className="text-sm text-gray-700">
                            {selectedOptionText || 'Not selected'}
                            {item.selectedOption && ` (${item.selectedOption})`}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Correct Option:</h4>
                          <p className="text-sm text-gray-700">
                            {correctOptionText || 'Not available'}
                            {correctAnswer && ` (${correctAnswer})`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No errors found matching your filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisReportPage;