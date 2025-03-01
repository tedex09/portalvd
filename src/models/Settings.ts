import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  requestLimitPerDay: { type: Number, default: 10 },
  requestLimitPerWeek: { type: Number, default: 50 },
  whatsappEnabled: { type: Boolean, default: false },
  twilioAccountSid: { type: String },
  twilioAuthToken: { type: String },
  twilioPhoneNumber: { type: String },
  primaryColor: { 
    type: String, 
    default: '#B91D3A' 
  },
  platformEnabled: { 
    type: Boolean, 
    default: true 
  },
  disabledMessage: { 
    type: String,
    default: 'Platform is currently under maintenance. Please try again later.'
  },
  registrationEnabled: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  strict: false // Allows for dynamic settings
});

// Ensure only one settings document exists
settingsSchema.pre('save', async function(next) {
  const Settings = mongoose.model('Settings');
  if (this.isNew) {
    const count = await Settings.countDocuments();
    if (count > 0) {
      next(new Error('Only one settings document can exist'));
    }
  }
  next();
});

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);