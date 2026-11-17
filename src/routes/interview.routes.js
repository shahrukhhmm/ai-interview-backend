const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  getInterviews,
  getInterview,
  createInterview,
  updateInterview,
  updateInterviewTranscript,
} = require('../controllers/interview.controller');

const router = express.Router();

router
  .route('/')
  .get(protect, getInterviews)
  .post(protect, createInterview);
router
  .route('/:id')
  .get(protect, getInterview)
  .put(protect, updateInterview);
router.put('/:id/transcript', protect, updateInterviewTranscript);

module.exports = router;