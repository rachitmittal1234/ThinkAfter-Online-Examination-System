import mongoose from 'mongoose';

const anonymousMessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const AnonymousMessageModel = mongoose.model('AnonymousMessage', anonymousMessageSchema);
export default AnonymousMessageModel;
