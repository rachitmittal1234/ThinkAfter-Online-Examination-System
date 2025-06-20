import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const TestQuestionsPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/tests/${testId}/questions`, {
        headers: { token: localStorage.getItem('token') }
      });
      if (response.data.success) {
        setQuestions(response.data.questions);
      } else {
        toast.error("Failed to load questions.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching questions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await axios.delete(`${backendUrl}/api/questions/${questionId}`, {
        headers: { token: localStorage.getItem('token') }
      });
      if (res.data.message) {
        toast.success("Question deleted successfully");
        fetchQuestions();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting question");
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [testId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Test Questions</h2>
          <button
            onClick={() => navigate(`/admin/tests/${testId}/questions/add`)}
            className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New Question
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No questions found in this test.</p>
            <button
              onClick={() => navigate(`/admin/tests/${testId}/questions/add`)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Your First Question
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, index) => (
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

                  {q.image && (
                    <div className="my-3">
                      <img
  src={`${backendUrl}/uploads/questions/${q.image}`}
  alt="question"
  className="max-w-full h-auto max-h-60 rounded border border-gray-200"
/>

                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-4">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-2 border rounded ${
                          opt === q.correctAnswer 
                            ? 'bg-green-50 border-green-300 font-medium' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <span className="font-medium">Option {i + 1}:</span> {opt}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mt-4">
                    <div>
                      <span className="font-medium">Correct Answer:</span> {q.correctAnswer}
                    </div>
                    <div>
                      <span className="font-medium">Marks:</span> +{q.positiveMarks} / -{q.negativeMarks}
                    </div>
                    {q.subject && (
                      <div>
                        <span className="font-medium">Subject:</span> {q.subject}
                      </div>
                    )}
                    {q.topics && (
                      <div className="sm:col-span-2 md:col-span-1">
                        <span className="font-medium">Topics:</span> {q.topics}
                      </div>
                    )}
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

export default TestQuestionsPage;