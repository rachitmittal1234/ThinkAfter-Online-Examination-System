import Question from '../models/questionModel.js';
import TestModel from '../models/testModel.js';
import fs from 'fs';
import path from 'path';

// Add a new question using MongoDB test IDs
export const addQuestion = async (req, res) => {
  try {
    const {
      questionText,
      options,
      correctAnswer,
      positiveMarks,
      negativeMarks,
      topics,
      subject,
      difficulty,
      testIds, // optional
    } = req.body;

    let validTestIds = [];

    // Validate testIds if provided
    if (testIds && Array.isArray(testIds) && testIds.length > 0) {
      const foundTests = await TestModel.find({ _id: { $in: testIds } });

      if (foundTests.length > 0) {
        validTestIds = foundTests.map(t => t._id);

        // Create and save question with test association
        const newQuestion = new Question({
          questionText,
          options,
          correctAnswer,
          positiveMarks,
          negativeMarks,
          topics,
          subject,
          difficulty,
          test_ids: validTestIds,
        });

        const savedQuestion = await newQuestion.save();

        // Push question reference to each test
        for (const test of foundTests) {
          test.questions.push(savedQuestion._id);
          await test.save();
        }

        return res.status(201).json({
          message: 'Question added and associated with tests',
          question: savedQuestion,
        });
      }
    }

    // Save question without test association
    const newQuestion = new Question({
      questionText,
      options,
      correctAnswer,
      positiveMarks,
      negativeMarks,
      topics,
      subject,
      difficulty,
      test_ids: [],
    });

    const savedQuestion = await newQuestion.save();

    res.status(201).json({
      success: true,
      message: 'Question added without test association',
      question: savedQuestion,
    });

  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ message: 'Server error while adding question' });
  }
};



// Get all questions
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions' });
  }
};

// Get single question by ID
export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching question' });
  }
};

// Update question
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Validate options length
    if (updatedData.options && updatedData.options.length < 3) {
      return res.status(400).json({ message: 'At least three options are required' });
    }

    // Validate correct answer is in options
    if (updatedData.options && updatedData.correctAnswer && 
        !updatedData.options.includes(updatedData.correctAnswer)) {
      return res.status(400).json({ message: 'Correct answer must be one of the options' });
    }

    const question = await Question.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ message: 'Question updated', updatedQuestion: question });
  } catch (error) {
    console.error('Error updating question:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    
    res.status(500).json({ message: 'Error updating question', error: error.message });
  }
};


// Delete question
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove question reference from all associated tests
    await TestModel.updateMany(
      { questions: id },
      { $pull: { questions: id } }
    );

    const deleted = await Question.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting question' });
  }
};
