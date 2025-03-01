import mongoose from 'mongoose';

const accessLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  action: { 
    type: String, 
    enum: ['login', 'logout', 'session_terminated'],
    required: true 
  },
  deviceInfo: {
    userAgent: String,
    ip: String,
    device: String
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.models.AccessLog || mongoose.model('AccessLog', accessLogSchema);