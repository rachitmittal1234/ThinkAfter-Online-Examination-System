import express from 'express';
import { submitContactForm, getAllMessages,deleteContactMessage } from '../controllers/contactController.js';
import adminAuth from '../middleware/adminAuth.js';

const contactRouter = express.Router();

// Save contact message
contactRouter.post('/submit', submitContactForm);

// Optional: Get all messages (for admin panel)
contactRouter.get('/all',adminAuth, getAllMessages);

contactRouter.delete('/:id', adminAuth, deleteContactMessage);

export default contactRouter;
