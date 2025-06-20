import PostAnalysisModel from '../models/postAnalysisModel.js';

// Save or update a single question's post analysis
export const saveOrUpdateAnalysis = async (req, res) => {
  try {
    const { userId, testId, questionId, isAttempted, selectedOption, isCorrect, errorType, notes } = req.body;

    if (!userId || !testId || !questionId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const updated = await PostAnalysisModel.findOneAndUpdate(
      { user: userId, test: testId, question: questionId },
      {
        user: userId,
        test: testId,
        question: questionId,
        isAttempted,
        selectedOption,
        isCorrect,
        errorType,
        notes
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: 'Analysis saved', data: updated });
  } catch (error) {
    console.error('Error saving post analysis:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all analysis entries for a given user and test
export const getAnalysisByTestAndUser = async (req, res) => {
  try {
    const { userId, testId } = req.params;

    const data = await PostAnalysisModel.find({ user: userId, test: testId })
      .populate('question', 'questionText options correctAnswer subject topics image difficulty');

    res.status(200).json({ success: true, analysis: data });
  } catch (error) {
    console.error('Error fetching post analysis:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
