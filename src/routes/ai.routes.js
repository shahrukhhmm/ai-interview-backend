const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  analyzeInterview,
  getInterviewAnalysis,
  generateFeedbackReport,
  processRealTime,
} = require('../controllers/ai.controller');

// @desc    Analyze an interview transcript
// @route   POST /api/ai/analyze/:interviewId
// @access  Private (Interviewer or Admin)
router.post('/analyze/:interviewId', protect, analyzeInterview);

// @desc    Get AI analysis for an interview
// @route   GET /api/ai/analysis/:interviewId
// @access  Private (Interviewer, Interviewee, or Admin)
router.get('/analysis/:interviewId', protect, getInterviewAnalysis);

// @desc    Generate a feedback report from analysis
// @route   POST /api/ai/feedback/:analysisId
// @access  Private (Interviewer or Admin)
router.post('/feedback/:analysisId', protect, generateFeedbackReport);

// @desc    Process real-time interview audio/text chunks
// @route   POST /api/ai/realtime
// @access  Private (Interviewer or Interviewee)
router.post('/realtime', protect, processRealTime);

module.exports = router;