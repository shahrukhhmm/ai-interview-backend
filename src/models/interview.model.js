const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  interviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  interviewee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 60,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  meetingLink: {
    type: String,
  },
  transcript: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Interview', InterviewSchema);