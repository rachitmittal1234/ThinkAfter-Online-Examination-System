import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const EditQuestionPage = () => {
    const { questionId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // const [existingImage, setExistingImage] = useState(null);
    // const [newImage, setNewImage] = useState(null);
    // const [removeImage, setRemoveImage] = useState(false);


    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [positiveMarks, setPositiveMarks] = useState(1);
    const [negativeMarks, setNegativeMarks] = useState(0);
    const [difficulty, setDifficulty] = useState('');
    const [topics, setTopics] = useState('');
    const [subject, setSubject] = useState('');

    useEffect(() => {
        const fetchQuestion = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${backendUrl}/api/questions/${questionId}`, {
                    headers: { token: localStorage.getItem('token') },
                });
                const q = res.data;
                setQuestionText(q.questionText);
                setOptions(q.options);
                setCorrectAnswer(q.correctAnswer);
                setPositiveMarks(q.positiveMarks);
                setNegativeMarks(q.negativeMarks);
                setDifficulty(q.difficulty || '');
                setTopics(q.topics || '');
                setSubject(q.subject || '');
                // setExistingImage(q.image || null);

            } catch (err) {
                toast.error('Failed to fetch question');
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestion();
    }, [questionId]);

    const handleUpdate = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // Handle topics - check if it's already an array
    const topicsArray = Array.isArray(topics) 
      ? topics 
      : topics.split(',').map(t => t.trim()).filter(t => t);

    const payload = {
      questionText,
      positiveMarks: Number(positiveMarks),
      negativeMarks: Number(negativeMarks),
      correctAnswer,
      difficulty,
      topics: topicsArray,
      subject,
      options: options.filter(opt => opt.trim() !== '') // Remove empty options
    };

    console.log("Sending payload:", payload); // Debug log

    const res = await axios.put(`${backendUrl}/api/questions/${questionId}`, payload, {
      headers: {
        token: localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    });

    console.log("Response:", res); // Debug log

    if (res.data.updatedQuestion) {
      toast.success('Question updated successfully');
      navigate(-1);
    }
  } catch (err) {
    console.error("Update error:", err); // Detailed error log
    console.error("Error response:", err.response); // Response data
    toast.error(err.response?.data?.message || 'Failed to update question');
  } finally {
    setIsSubmitting(false);
  }
};



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
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Question</h2>
                
                <form onSubmit={handleUpdate} className="space-y-6">
                    {/* Question Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Text*</label>
                        <textarea
                            value={questionText}
                            onChange={e => setQuestionText(e.target.value)}
                            placeholder="Enter the question"
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
                                        onChange={e => {
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
                            onChange={e => setCorrectAnswer(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
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
                                min="0"
                                onChange={e => setPositiveMarks(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Negative Marks</label>
                            <input
                                type="number"
                                value={negativeMarks}
                                min="0"
                                onChange={e => setNegativeMarks(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty*</label>
                            <select
                                value={difficulty}
                                onChange={e => setDifficulty(e.target.value)}
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
                                onChange={e => setTopics(e.target.value)}
                                placeholder="Comma-separated topics (e.g., Algebra, Geometry)"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="Enter subject (e.g., Mathematics)"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Image Section */}
{/* <div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Question Image</label>

  {existingImage && !removeImage && (
    <div className="space-y-2">
      <img
        src={`${backendUrl}/uploads/questions/${existingImage}`}
        alt="question"
        className="max-h-48 rounded border border-gray-200"
      />
      <button
        type="button"
        onClick={() => setRemoveImage(true)}
        className="text-sm text-red-600 hover:underline"
      >
        Remove Image
      </button>
    </div>
  )}

  {!existingImage || removeImage ? (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => setNewImage(e.target.files[0])}
      className="block w-full text-sm text-gray-500
      file:mr-4 file:py-2 file:px-4
      file:rounded-md file:border-0
      file:text-sm file:font-semibold
      file:bg-blue-50 file:text-blue-700
      hover:file:bg-blue-100"
    />
  ) : null}
</div> */}


                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Question'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditQuestionPage;