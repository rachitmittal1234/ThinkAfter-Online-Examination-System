import { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AllQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login as admin');
      navigate('/admin/login');
    }
  }, [navigate]);

  // Fetch all questions
  const fetchAllQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/questions`, {
        headers: { token: localStorage.getItem('token') }
      });
      setQuestions(res.data);
      setFilteredQuestions(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Error fetching all questions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllQuestions();
  }, []);

  useEffect(() => {
    let filtered = [...questions];

    if (difficultyFilter) {
      filtered = filtered.filter(q => q.difficulty === difficultyFilter);
    }

    if (topicFilter) {
      filtered = filtered.filter(q => {
        if (Array.isArray(q.topics)) {
          return q.topics.join(', ').toLowerCase().includes(topicFilter.toLowerCase());
        } else if (typeof q.topics === 'string') {
          return q.topics.toLowerCase().includes(topicFilter.toLowerCase());
        }
        return false;
      });
    }

    if (subjectFilter) {
      filtered = filtered.filter(q => q.subject?.toLowerCase() === subjectFilter.toLowerCase());
    }

    if (searchText) {
      filtered = filtered.filter(q =>
        (q.questionText || '').toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  }, [difficultyFilter, topicFilter, searchText, questions, subjectFilter]);

  const handleDelete = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await axios.delete(`${backendUrl}/api/questions/${questionId}`, {
        headers: { token: localStorage.getItem('token') }
      });
      if (res.data.message) {
        toast.success("Question deleted successfully");
        fetchAllQuestions();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting question");
    }
  };

  const resetFilters = () => {
    setDifficultyFilter('');
    setTopicFilter('');
    setSearchText('');
    setSubjectFilter('');
  };

  const subjects = Array.from(new Set(questions.map(q => q.subject).filter(Boolean)));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage Questions</h2>

        {/* Filters Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Filter Questions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((subj, idx) => (
                  <option key={idx} value={subj}>{subj}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <input
                type="text"
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                placeholder="Enter topic"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search questions..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Questions List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No questions found with the selected filters.</p>
            <button 
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                Showing <span className="font-bold">{filteredQuestions.length}</span> questions
              </p>
              <button
                onClick={() => navigate('/admin/questions/add')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add New Question
              </button>
            </div>

            {filteredQuestions.map((q, index) => (
              <div key={q._id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Q{index + 1}: {q.questionText}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {q.difficulty || 'N/A'}
                    </span>
                  </div>

                  {/* {q.image && (
                    <div className="my-3">
                      <img
  src={`${backendUrl}/uploads/questions/${q.image}`}
  alt="question"
  className="max-w-full h-auto max-h-60 rounded border border-gray-200"
/>

                    </div>
                  )} */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-4">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-2 border rounded ${
                          opt === q.correctAnswer 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <span className="font-medium">Option {i + 1}:</span> {opt}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-4">
                    <div>
                      <span className="font-medium">Subject:</span> {q.subject || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Topics:</span> {Array.isArray(q.topics) ? q.topics.join(', ') : (q.topics || 'N/A')}
                    </div>
                    <div>
                      <span className="font-medium">Marks:</span> +{q.positiveMarks} / -{q.negativeMarks}
                    </div>
                    <div>
                      <span className="font-medium">Correct Answer:</span> <span className="font-bold">{q.correctAnswer}</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => navigate(`/admin/questions/${q._id}/edit`)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllQuestionsPage;