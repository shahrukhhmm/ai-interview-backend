const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  skills: {
    type: [String],
    required: true,
  },
  experience: {
    type: String,
  },
  education: {
    type: String,
  },
  resumeUrl: {
    type: String,
  },
  isOnboarded: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one profile per user
ProfileSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Profile', ProfileSchema);