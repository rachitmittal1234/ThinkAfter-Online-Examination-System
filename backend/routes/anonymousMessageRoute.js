import express from 'express';
import { submitAnonymousMessage, getAllAnonymousMessages,deleteAnonymousMessage } from '../controllers/anonymousMessageController.js';
import adminAuth from '../middleware/adminAuth.js';

const anonymousMessageRouter = express.Router();

anonymousMessageRouter.post('/submit', submitAnonymousMessage);
anonymousMessageRouter.get('/all', getAllAnonymousMessages); // Optional: for admin
anonymousMessageRouter.delete('/delete/:messageId', adminAuth, deleteAnonymousMessage);

export default anonymousMessageRouter;
