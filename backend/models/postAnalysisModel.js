import mongoose from 'mongoose';

const postAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },

  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },

  isAttempted: {
    type: Boolean,
    default: false
  },

  selectedOption: {
    type: String,
    default: null
  },

  isCorrect: {
    type: Boolean,
    default: null
  },

  errorType: {
    type: String,
    enum: [
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
    ],
    default: null
  },

  notes: {
    type: String,
    default: ''
  }

}, {
  timestamps: true
});

const PostAnalysisModel = mongoose.model('PostAnalysis', postAnalysisSchema);

export default PostAnalysisModel;
