import express from 'express';
import {
  addQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController.js';
import adminAuth from '../middleware/adminAuth.js';
import mongoose from 'mongoose';

// import upload from "../middleware/multer.js";
import TestModel from '../models/testModel.js';
import Question from '../models/questionModel.js'

import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

const questionRouter = express.Router();

// Create a new question with optional image and test title mapping
questionRouter.post('/', adminAuth, addQuestion);


// Get all questions
questionRouter.get('/', getAllQuestions);

// Get questions by testId
questionRouter.get('/by-test/:testId', async (req, res) => {
  try {
    const { testId } = req.params;

    const questions = await Question.find({ test_ids: testId });

    res.status(200).json({ success: true, questions });
  } catch (error) {
    console.error("Error fetching questions by testId:", error);
    res.status(500).json({ success: false, message: 'Error fetching questions by testId' });
  }
});


// Get a question by ID
questionRouter.get('/:id', getQuestionById);

// Update a question (with optional image and test title update)
questionRouter.put('/:id',adminAuth,  updateQuestion);

// Delete a question
questionRouter.delete('/:id',adminAuth, deleteQuestion);



questionRouter.get('/pdf/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    const questions = await Question.find({ test_ids: testId });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ success: false, message: 'No questions found for this test.' });
    }

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      info: {
        Title: `Test ${testId} Questions - ThinkAfter`,
        Author: 'ThinkAfter'
      },
      bufferPages: true
    });

    const filename = `ThinkAfter_Test_${testId}_Questions.pdf`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');
    
    doc.on('error', (err) => {
      console.error('PDF stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Failed to generate PDF' });
      }
    });

    doc.pipe(res);

    // ========== STYLISH HEADER ========== //
    // Gradient background
    const headerGradient = doc.linearGradient(0, 0, doc.page.width, 0);
    headerGradient.stop(0, '#2563EB')  // Vibrant blue
                 .stop(1, '#1E40AF'); // Deep blue

    doc.rect(0, 0, doc.page.width, 120)
       .fill(headerGradient);

    // Main title with shadow effect
    doc.fillColor('white')
       .font('Helvetica-Bold')
       .fontSize(28)
       .text('ThinkAfter', 50, 45);

    // Tagline with subtle opacity
    doc.fillColor('white')
       .opacity(0.9)
       .font('Helvetica-Oblique')
       .fontSize(12)
       .text('The test ends. The learning begins.', 50, 80)
       .opacity(1);

    // Ribbon with test info
    doc.rect(0, 120, doc.page.width, 30)
       .fill('#EFF6FF');  // Light blue background

    doc.fillColor('#1E40AF')
       .font('Helvetica-Bold')
       .fontSize(10)
       .text(` `, 50, 127, { continued: true })
       .font('Helvetica')
       .text(`Generated On: ${new Date().toLocaleDateString()} | `, { continued: true })
       .text(`Total Questions: ${questions.length}`, { continued: false });

    // ========== MAIN CONTENT ========== //
    doc.moveDown(3);

    // Section title with underline
    doc.fillColor('#1E3A8A')
       .font('Helvetica-Bold')
       .fontSize(20)
       .text('Exam Questions & Solutions', { 
         align: 'center',
         underline: true,
         underlineColor: '#3B82F6',
         underlineThickness: 2
       })
       .moveDown(1.5);

    // ========== QUESTIONS STYLING ========== //
questions.forEach((q, index) => {
  if (index > 0 && doc.y > doc.page.height - 100) {
    doc.addPage();
    doc.fillColor('#1E40AF')
       .fontSize(10)
       .text(`ThinkAfter - Test ${testId} (Continued)`, 50, 30)
       .moveDown(2);
  }

  // Question Header
  doc.roundedRect(40, doc.y, doc.page.width - 80, 25, 3)
     .fill('#F8FAFC')
     .fillColor('#1E40AF')
     .font('Helvetica-Bold')
     .fontSize(14)
     .text(`Question ${index + 1}`, 50, doc.y + 5)
     .moveDown(1.5);

  // Question Text
  doc.fillColor('#111827')
     .font('Helvetica')
     .fontSize(12)
     .text(q.questionText, {
       indent: 10,
       paragraphGap: 5,
       align: 'justify'
     })
     .moveDown(1);

  // ⬇️ Add this block to insert the image
  // if (q.image) {
  //   const imagePath = path.join('uploads', 'questions', q.image);
  //   if (fs.existsSync(imagePath)) {
  //     try {
  //       doc.image(imagePath, {
  //         fit: [450, 250],
  //         align: 'center',
  //         valign: 'center'
  //       }).moveDown(1);
  //     } catch (err) {
  //       console.warn(`Could not include image ${q.image}:`, err.message);
  //     }
  //   }
  // }

  // Options + Correct Answer
  q.options.forEach((opt, i) => {
    const label = String.fromCharCode(65 + i);
    const isCorrect = opt === q.correctAnswer;

    doc.circle(50, doc.y + 5, 3)
       .fill(isCorrect ? '#10B981' : '#3B82F6')
       .fillColor(isCorrect ? '#10B981' : '#374151')
       .fontSize(11)
       .text(`${label}.`, 60, doc.y, { continued: true })
       .text(` ${opt}`, { continued: isCorrect });

    if (isCorrect) {
      doc.fillColor('#10B981')
         .font('Helvetica-Bold')
         .text(' (Correct Answer)', { characterSpacing: 0.3 });
    }
    doc.moveDown(1.2);
  });

  // Decorative separator
  doc.moveDown(0.8)
     .strokeColor('#E5E7EB')
     .lineWidth(1)
     .dash(5, { space: 2 })
     .moveTo(50, doc.y)
     .lineTo(doc.page.width - 50, doc.y)
     .stroke()
     .undash()
     .moveDown(1.5);
});

    // ========== ELEGANT FOOTER ========== //
    const footerY = doc.page.height - 40;
    
    // Footer background
    doc.rect(0, footerY, doc.page.width, 40)
       .fill('#1E3A8A');

    // Footer content
    doc.fillColor('white')
       .fontSize(10)
       .text('The best exam preparation platform', 0, footerY + 10, {
         align: 'center'
       })
       .text('© ThinkAfter | www.thinkafter.com', 0, footerY + 25, {
         align: 'center',
         characterSpacing: 0.5
       });

    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to generate PDF' });
    }
  }
});







export default questionRouter;
