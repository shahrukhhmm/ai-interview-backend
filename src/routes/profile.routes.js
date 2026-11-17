const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  getProfiles,
  getProfile,
  updateProfile,
} = require('../controllers/profile.controller');

const router = express.Router();

router.route('/').get(protect, getProfiles);
router.route('/:userId').get(protect, getProfile).put(protect, updateProfile);

module.exports = router;