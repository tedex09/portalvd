import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  token: { 
    type: String, 
    required: true 
  },
  deviceInfo: {
    userAgent: String,
    ip: String,
    device: String
  },
  lastActivity: { 
    type: Date, 
    default: Date.now 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

// Index for quick lookups and automatic expiration
sessionSchema.index({ lastActivity: 1 }, { 
  expireAfterSeconds: 24 * 60 * 60 // 24 hours 
});

export default mongoose.models.Session || mongoose.model('Session', sessionSchema);