const mongoose = require('mongoose');

const OnboardingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  step1Completed: {
    type: Boolean,
    default: false,
  },
  step2Completed: {
    type: Boolean,
    default: false,
  },
  step3Completed: {
    type: Boolean,
    default: false,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one onboarding record per user
OnboardingSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Onboarding', OnboardingSchema);