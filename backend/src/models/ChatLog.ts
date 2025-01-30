//models/ChatLog.ts
import mongoose from 'mongoose';

const chatLogSchema = new mongoose.Schema({
  user_id: {
    // We'll store a reference to the User model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  session_id: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('ChatLog', chatLogSchema);
