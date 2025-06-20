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

    const image = req.file ? req.file.filename : null;

    let validTestIds = [];

    // If testIds are provided, validate them
    if (testIds && Array.isArray(testIds) && testIds.length > 0) {
      const foundTests = await TestModel.find({ _id: { $in: testIds } });

      if (foundTests.length > 0) {
        validTestIds = foundTests.map(t => t._id);

        // Create question
        const newQuestion = new Question({
          questionText,
          image,
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

        // Add question to tests
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

    // If no testIds, save question without test association
    const newQuestion = new Question({
      questionText,
      image,
      options,
      correctAnswer,
      positiveMarks,
      negativeMarks,
      topics,
      subject,
      difficulty,
      test_ids: [], // or skip this field if not required
    });

    const savedQuestion = await newQuestion.save();

    res.status(201).json({
      success:true,
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

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Handle image removal if requested
    if (req.body.removeImage === 'true' && question.image) {
      const imagePath = path.join('uploads/questions', question.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // delete image from disk
      }
      question.image = null; // remove reference
    }

    // Handle new image upload
    if (req.file) {
      // Delete old image if it exists
      if (question.image) {
        const oldImagePath = path.join('uploads/questions', question.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      question.image = req.file.filename;
    }

    // Update other fields
    question.questionText = updatedData.questionText;
    question.options = updatedData.options;
    question.correctAnswer = updatedData.correctAnswer;
    question.positiveMarks = updatedData.positiveMarks;
    question.negativeMarks = updatedData.negativeMarks;
    question.difficulty = updatedData.difficulty;
    question.topics = updatedData.topics;
    question.subject = updatedData.subject;

    const updatedQuestion = await question.save();

    res.status(200).json({ message: 'Question updated', updatedQuestion });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Error updating question' });
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
