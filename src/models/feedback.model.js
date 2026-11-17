const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  interview: {
    type: mongoose.Schema.ObjectId,
    ref: 'Interview',
    required: true,
  },
  reviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  technicalScore: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  softSkillsScore: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comments: {
    type: String,
    required: true,
  },
  strengths: {
    type: [String],
  },
  areasForImprovement: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Feedback', FeedbackSchema);