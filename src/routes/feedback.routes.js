const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  getFeedback,
  getUserFeedback,
  createFeedback,
} = require('../controllers/feedback.controller');

const router = express.Router();

router.get('/:interviewId', protect, getFeedback);
router.get('/user/:userId', protect, getUserFeedback);
router.post('/', protect, createFeedback);

module.exports = router;