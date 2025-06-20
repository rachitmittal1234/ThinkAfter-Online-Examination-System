import express from 'express';
import {
  saveOrUpdateAnalysis,
  getAnalysisByTestAndUser
} from '../controllers/postAnalysisController.js';

const postAnalysisRouter = express.Router();

// Save or update analysis for a question
postAnalysisRouter.post('/save', saveOrUpdateAnalysis);

// Get analysis for a specific test and user
postAnalysisRouter.get('/:userId/:testId', getAnalysisByTestAndUser);

export default postAnalysisRouter;
