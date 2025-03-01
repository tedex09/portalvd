import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['add', 'update', 'fix'], required: true },
  mediaTitle: { type: String, required: true},
  mediaPoster: String,
  mediaId: { type: Number, required: true },
  mediaType: { type: String, enum: ['movie', 'tv'], required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'rejected'],
    default: 'pending'
  },
  description: String,
  notifyWhatsapp: { type: Boolean, default: false },
  counter: { type: Number, default: 1 },
  rejectionReason: { type: String, default: '' },
  whatsapp: String,
}, { timestamps: true });

// Index for finding duplicate requests
requestSchema.index({ mediaId: 1, mediaType: 1, type: 1 });

export default mongoose.models.Request || mongoose.model('Request', requestSchema);