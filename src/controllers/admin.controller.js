const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const { ErrorResponse } = require('../utils/errorHandler');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    // Get counts for different user roles
    const candidateCount = await User.countDocuments({ role: 'candidate' });
    const interviewerCount = await User.countDocuments({ role: 'interviewer' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    // Get counts for onboarding status
    const onboardedCount = await Profile.countDocuments({ isOnboarded: true });
    const notOnboardedCount = await Profile.countDocuments({ isOnboarded: false });

    // Get interview statistics would require Interview model counts
    // This is just a placeholder - you'd need to implement actual stats
    const scheduledInterviews = 0; // Placeholder
    const completedInterviews = 0; // Placeholder

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: candidateCount + interviewerCount + adminCount,
          candidates: candidateCount,
          interviewers: interviewerCount,
          admins: adminCount,
        },
        onboarding: {
          completed: onboardedCount,
          pending: notOnboardedCount,
        },
        interviews: {
          scheduled: scheduledInterviews,
          completed: completedInterviews,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create user (admin function)
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { email, password, fullName, role } = req.body;

    // Create user
    const user = await User.create({
      email,
      password,
      fullName,
      role,
    });

    // Create profile
    const profile = await Profile.create({
      user: user._id,
      skills: [],
    });

    res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user (admin function)
// @route   PUT /api/admin/users/:userId
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.userId);

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.userId}`, 404)
      );
    }

    // Update user
    user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
      runValidators: true,
    });

    // Find and return profile
    const profile = await Profile.findOne({ user: req.params.userId }).populate(
      'user',
      'fullName email role'
    );

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user (admin function)
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.userId}`, 404)
      );
    }

    // Delete user and associated profile
    await user.remove();
    await Profile.findOneAndRemove({ user: req.params.userId });

    // Note: In a real app, you'd also want to delete associated interviews, feedback, etc.

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};