import ReportModel from '../models/reportModel.js';
import Question from '../models/questionModel.js';
import mongoose from 'mongoose';
import Test from '../models/testModel.js';
import PostAnalysisModel from '../models/postAnalysisModel.js';
import User from '../models/userModel.js';

// Save or update all question responses for a test
// solving unattempted 
export const submitTestResponses = async (req, res) => {
  try {
    const { userId, testId, responses } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: 'Invalid userId or testId' });
    }

    if (!userId || !testId || !Array.isArray(responses)) {
      return res.status(400).json({ success: false, message: 'Invalid input data' });
    }

    const alreadySubmitted = await ReportModel.exists({ user: userId, test: testId });
    if (alreadySubmitted) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this test.',
      });
    }

    const bulkOps = [];

    for (const resp of responses) {
      const { questionId, selectedOption, confidenceLevel, isMarkedForReview } = resp;

      const question = await Question.findById(questionId);
      if (!question) continue;

      const isCorrect = selectedOption === question.correctAnswer;
      const positiveMarks = question.positiveMarks ?? 1;
      const negativeMarks = question.negativeMarks ?? 0;

      bulkOps.push({
        updateOne: {
          filter: { user: userId, test: testId, question: questionId },
          update: {
            $set: {
              user: userId,
              test: testId,
              question: questionId,
              selectedOption: selectedOption ?? null,
              confidenceLevel: confidenceLevel ?? null,
              isMarkedForReview: isMarkedForReview ?? false,
              positiveMarks,
              negativeMarks,
              isCorrect,
              subject: question.subject || '',
              topics: question.topics || [],
              timestamp: new Date()
            }
          },
          upsert: true
        }
      });
    }

    // If no valid questions were attempted, still mark test as submitted (log dummy record or just return success)
    if (bulkOps.length > 0) {
      await ReportModel.bulkWrite(bulkOps);
    }

    return res.status(200).json({
      success: true,
      message: bulkOps.length > 0
        ? 'Test responses submitted successfully'
        : 'Test marked as submitted without attempts',
      data: {
        testId,
        userId,
        submittedQuestions: bulkOps.length
      }
    });

  } catch (error) {
    console.error('Error submitting test responses:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while submitting responses',
      error: error.message
    });
  }
};

// (Optional) Get all responses by a student for a test
export const getUserTestReport = async (req, res) => {
    try {
        const { userId, testId } = req.params;

        const report = await ReportModel.find({ user: userId, test: testId })
            .populate('question', 'questionText correctAnswer options subject topics');

        res.status(200).json({ success: true, report });

    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ success: false, message: 'Server error fetching report' });
    }
};

export const getUserTestStatusReport = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const joiningDate = new Date(user.joiningDate);
    const tests = await Test.find({});
    const userReports = await ReportModel.find({ user: userId });

    const attemptedTestIds = new Set(userReports.map(r => r.test.toString()));

    // Get current time in IST
    const nowUTC = new Date();
    const nowIST = new Date(nowUTC.getTime() + (5.5 * 60 * 60 * 1000));

    const result = {
      attempted: [],
      missed: [],
      upcoming: [],
      active: []
    };

    for (const test of tests) {
      const testDate = new Date(test.testDate);
      if (testDate < joiningDate) {
        // ❌ Skip tests before the user's joining date
        continue;
      }

      const startDateTime = new Date(test.startTime);
      const endDateTime = new Date(test.endTime);

      startDateTime.setFullYear(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());
      endDateTime.setFullYear(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());

      const startIST = new Date(startDateTime.getTime() + (5.5 * 60 * 60 * 1000));
      const endIST = new Date(endDateTime.getTime() + (5.5 * 60 * 60 * 1000));

      const isAttempted = attemptedTestIds.has(test._id.toString());
      const isActive = nowIST >= startIST && nowIST <= endIST;
      const isUpcoming = nowIST < startIST;
      const isMissed = !isAttempted && nowIST > endIST;

      if (isAttempted) {
        result.attempted.push(test);
      } else if (isActive) {
        result.active.push(test);
      } else if (isUpcoming) {
        result.upcoming.push(test);
      } else if (isMissed) {
        result.missed.push(test);
      }
    }

    res.status(200).json({ success: true, result });

  } catch (error) {
    console.error('Error in user test status report:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};





export const getUserOverallStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const reports = await ReportModel.find({ user: userId });
    const analysis = await PostAnalysisModel.find({ user: userId });
    const testIds = [...new Set(reports.map(r => r.test.toString()))];

    let totalTests = testIds.length;
    let totalAttempted = 0, totalCorrect = 0, totalIncorrect = 0, totalUnattempted = 0;
    let totalScore = 0;
    let testScores = {};

    // Fetch all test details once
    const allTests = await Test.find({ _id: { $in: testIds } });

    for (const testId of testIds) {
      const test = allTests.find(t => t._id.toString() === testId);
      if (!test) continue;

      const testReports = reports.filter(r => r.test.toString() === testId);
      let attempted = 0, correct = 0, incorrect = 0, posMarks = 0, negMarks = 0;

      for (const r of testReports) {
        if (r.selectedOption != null) {
          attempted++;
          if (r.isCorrect) {
            correct++;
            posMarks += r.positiveMarks;
          } else {
            incorrect++;
            negMarks += r.negativeMarks;
          }
        }
      }

      const net = posMarks - negMarks;
      const maxmarks = test.maxmarks ?? 0;
      const rawPercentage = maxmarks > 0 ? (net / maxmarks) * 100 : 0;
      const percentage = rawPercentage < 0 ? 0 : rawPercentage.toFixed(2);

      const istDate = new Date(test.testDate.getTime() + (5.5 * 60 * 60 * 1000));
      const formattedDate = istDate.toISOString().split('T')[0];

      totalScore += net;
      totalAttempted += attempted;
      totalCorrect += correct;
      totalIncorrect += incorrect;

      testScores[testId] = {
        score: net,
        title: test.title,
        testDate: formattedDate,
        maxmarks,
        percentage
      };
    }

    totalUnattempted += analysis.filter(a => !a.isAttempted).length;

    const avgScore = totalTests ? (totalScore / totalTests).toFixed(2) : '0.00';
    const avgAccuracy = totalAttempted ? ((totalCorrect / totalAttempted) * 100).toFixed(2) : '0.00';

    const highest = Object.entries(testScores).reduce(
      (a, b) => a[1].score > b[1].score ? a : b,
      [null, { score: -Infinity }]
    );
    const lowest = Object.entries(testScores).reduce(
      (a, b) => a[1].score < b[1].score ? a : b,
      [null, { score: Infinity }]
    );

    res.status(200).json({
      success: true,
      data: {
        totalTests,
        totalAttempted,
        totalCorrect,
        totalIncorrect,
        totalUnattempted,
        avgScore,
        avgAccuracy,
        highestScoringTest: highest,
        lowestScoringTest: lowest,
        performanceGraph: testScores
      }
    });

  } catch (err) {
    console.error('Error getting overall stats:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

