import ContactModel from '../models/contactModel.js';

// Save contact message
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const newMessage = new ContactModel({ name, email, message });
    await newMessage.save();

    res.status(201).json({ success: true, message: 'Message submitted successfully' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// (Optional) Get all messages
export const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

// Delete a contact message by ID
export const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ContactModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ success: false, message: 'Server error while deleting message' });
  }
};


