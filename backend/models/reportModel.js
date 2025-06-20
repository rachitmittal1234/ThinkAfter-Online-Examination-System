import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
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

  selectedOption: {
    type: String,
    default: null
  },

  confidenceLevel: {
    type: String,
    enum: ['100% Sure', 'Partially Sure', 'Randomly Selected'],
    default: null
  },

  isMarkedForReview: {
    type: Boolean,
    default: false
  },

  isCorrect: {
    type: Boolean,
    default: false
  },

  timestamp: {
    type: Date,
    default: Date.now
  },

  positiveMarks: {
    type: Number,
    default: 1
  },

  negativeMarks: {
    type: Number,
    default: 0
  },

  subject: {
    type: String,
    default: ''
  },

  topics: {
    type: [String],
    default: []
  }

}, {
  timestamps: true
});

const ReportModel = mongoose.model('Report', reportSchema);

export default ReportModel;
