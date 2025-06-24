import { useState ,useRef} from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AddNewQuestion = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [positiveMarks, setPositiveMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [difficulty, setDifficulty] = useState('');
  const [topics, setTopics] = useState('');
  const [subject, setSubject] = useState('');
  // const [image, setImage] = useState(null);

  const fileInputRef = useRef(null);


  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  if (!options.includes(correctAnswer)) {
    toast.error('Correct answer must match one of the options');
    setIsSubmitting(false);
    return;
  }

  try {
    const payload = {
      questionText,
      options,
      correctAnswer,
      positiveMarks,
      negativeMarks,
      difficulty,
      topics: topics.split(',').map(t => t.trim()), // convert comma-separated to array
      subject
    };

    const res = await axios.post(`${backendUrl}/api/questions`, payload, {
      headers: {
        token: localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
    });

    if (res.data.success) {
      toast.success(res.data.message || 'Question added successfully');

      // Reset the form
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      setPositiveMarks(1);
      setNegativeMarks(0);
      setDifficulty('');
      setTopics('');
      setSubject('');
    }
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Failed to add question');
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Question</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Text*</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your question here..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              required
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Options*</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center">
                  <span className="mr-2 font-medium">{i + 1}.</span>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[i] = e.target.value;
                      setOptions(updated);
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Correct Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer*</label>
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={options.every(opt => !opt)}
            >
              <option value="">Select correct option</option>
              {options.map((opt, i) => (
                opt && <option key={i} value={opt}>Option {i + 1}: {opt}</option>
              ))}
            </select>
          </div>

          {/* Marks and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Positive Marks</label>
              <input
                type="number"
                value={positiveMarks}
                onChange={(e) => setPositiveMarks(Number(e.target.value))}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Negative Marks</label>
              <input
                type="number"
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(Number(e.target.value))}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty*</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select difficulty level</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Topics and Subject */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topics</label>
              <input
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="Comma-separated topics (e.g., Algebra, Geometry)"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject (e.g., Mathematics)"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Image Upload */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Image (Optional)</label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setImage(e.target.files[0])}
                accept="image/*"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
          </div> */}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mr-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewQuestion;