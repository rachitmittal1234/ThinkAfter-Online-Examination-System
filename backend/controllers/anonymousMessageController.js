import AnonymousMessageModel from '../models/anonymousMessageModel.js';

// Save a new anonymous message
export const submitAnonymousMessage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const message = new AnonymousMessageModel({ text });
    await message.save();

    res.status(201).json({ success: true, message: 'Anonymous message submitted successfully' });
  } catch (error) {
    console.error('Error submitting anonymous message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all anonymous messages (for admin or review)
export const getAllAnonymousMessages = async (req, res) => {
  try {
    const messages = await AnonymousMessageModel.find().sort({ date: 1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching anonymous messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a specific anonymous message by ID
export const deleteAnonymousMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const deleted = await AnonymousMessageModel.findByIdAndDelete(messageId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({ success: true, message: 'Anonymous message deleted successfully' });
  } catch (error) {
    console.error('Error deleting anonymous message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

