import express from 'express';
import {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest
} from '../controllers/testController.js';
import adminAuth from '../middleware/adminAuth.js';
import TestModel from '../models/testModel.js';

const testRouter = express.Router();



testRouter.get('/tests/:testId/questions', adminAuth, async (req, res) => {
  const { testId } = req.params;
  try {
    const test = await TestModel.findById(testId).populate('questions');
    if (!test) return res.status(404).json({ success: false, message: "Test not found" });
    res.json({ success: true, questions: test.questions });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching questions" });
  }
});

// Create a new test
testRouter.post('/tests',adminAuth, createTest);

// Get all tests
testRouter.get('/tests/list', getAllTests);

// Get a single test by ID
testRouter.get('/tests/:id', getTestById);

// Update a test by ID
testRouter.put('/tests/:id',adminAuth, updateTest);

// Delete a test by ID
testRouter.delete('/tests/:id',adminAuth, deleteTest);

export default testRouter;
