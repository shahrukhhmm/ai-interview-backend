const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { uploadResume } = require('../controllers/file.controller');

const router = express.Router();

router.post('/resume/:userId', protect, uploadResume);

module.exports = router;