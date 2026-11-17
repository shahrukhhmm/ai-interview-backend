const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getStats,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/admin.controller');

const router = express.Router();

// Admin routes - protect and authorize('admin')
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.route('/users').post(createUser);
router.route('/users/:userId').put(updateUser).delete(deleteUser);

module.exports = router;