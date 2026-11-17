const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  getOnboarding,
  updateOnboarding,
  completeOnboarding,
} = require('../controllers/onboarding.controller');

const router = express.Router();

router.route('/:userId').get(protect, getOnboarding).put(protect, updateOnboarding);
router.post('/:userId/complete', protect, completeOnboarding);

module.exports = router;