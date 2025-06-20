// ✅ 1. UPDATE USER MODEL (add joiningDate)
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['student'],
    default: 'student'
  },

  mobile: {
    type: String,
    default: ''
  },

  joiningDate: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);

export default UserModel;