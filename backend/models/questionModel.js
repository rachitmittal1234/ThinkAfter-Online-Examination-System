import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },

  

  options: {
    type: [String],
    validate: {
      validator: arr => arr.length >= 3,
      message: 'At least three options are required'
    }
  },

  correctAnswer: {
    type: String,
    required: true
  },

  positiveMarks: {
    type: Number,
    default: 1
  },

  negativeMarks: {
    type: Number,
    default: 0
  },

  topics: [{
    type: String
  }],

  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },

  isAttempted: {
    type: Boolean,
    default: false
  },
  subject: {
    type: String,
    required: true // ✅ Subject is now required
  },

  test_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  }],

  confidenceLevels: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    level: {
      type: String,
      enum: ['100% Sure', 'Partially Sure', 'Randomly Selected']
    }
  }]
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
