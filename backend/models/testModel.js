import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },

  instructions: [{ type: String }], // List of instructions
  duration: { type: Number, required: true }, // Duration in minutes
  maxmarks: {type: Number, required: true},

  testDate: { type: Date, required: true }, // Date only
  startTime: { type: Date, required: true }, // Full timestamp
  endTime: { type: Date, required: true },   // Full timestamp

  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, {
  timestamps: true
});

// Use PascalCase for the model name
const TestModel = mongoose.model('Test', testSchema);

export default TestModel;
