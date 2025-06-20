import express from 'express';
import { submitTestResponses, getUserTestReport, getUserTestStatusReport } from '../controllers/reportController.js';
import ReportModel from '../models/reportModel.js';
import { getUserOverallStats } from '../controllers/reportController.js';

const reportRouter = express.Router();

// GET reports attempted by user
reportRouter.get('/attempted/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const reports = await ReportModel.find({ user: userId })
      .populate('test', 'title description duration')
      .lean();

    const uniqueTestMap = new Map();
    for (const report of reports) {
      const test = report.test;
      if (test && !uniqueTestMap.has(test._id.toString())) {
        uniqueTestMap.set(test._id.toString(), test);
      }
    }

    const uniqueTests = Array.from(uniqueTestMap.values());

    res.json({ success: true, reports: uniqueTests });

  } catch (err) {
    console.error('Error fetching attempted tests:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch attempted tests' });
  }
});




// ✅ Updated paths to avoid conflict
reportRouter.get('/status/:userId', getUserTestStatusReport);
reportRouter.get('/report/:userId/:testId', getUserTestReport);
reportRouter.post('/submit', submitTestResponses);
reportRouter.get('/overall/:userId', getUserOverallStats);

export default reportRouter;
