const Onboarding = require('../models/onboarding.model');
const Profile = require('../models/profile.model');
const { ErrorResponse } = require('../utils/errorHandler');

// @desc    Get onboarding data
// @route   GET /api/onboarding/:userId
// @access  Private
exports.getOnboarding = async (req, res, next) => {
  try {
    const onboarding = await Onboarding.findOne({ user: req.params.userId });

    if (!onboarding) {
      return next(
        new ErrorResponse(
          `Onboarding data not found for user ${req.params.userId}`,
          404
        )
      );
    }

    // Make sure user is onboarding owner or admin
    if (
      req.user.role !== 'admin' &&
      onboarding.user.toString() !== req.user.id
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to access this onboarding data`,
          401
        )
      );
    }

    res.status(200).json({
      success: true,
      data: onboarding,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update onboarding data
// @route   PUT /api/onboarding/:userId
// @access  Private
exports.updateOnboarding = async (req, res, next) => {
  try {
    let onboarding = await Onboarding.findOne({ user: req.params.userId });

    if (!onboarding) {
      return next(
        new ErrorResponse(
          `Onboarding data not found for user ${req.params.userId}`,
          404
        )
      );
    }

    // Make sure user is onboarding owner or admin
    if (
      req.user.role !== 'admin' &&
      onboarding.user.toString() !== req.user.id
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this onboarding data`,
          401
        )
      );
    }

    onboarding = await Onboarding.findOneAndUpdate(
      { user: req.params.userId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: onboarding,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Complete onboarding
// @route   POST /api/onboarding/:userId/complete
// @access  Private
exports.completeOnboarding = async (req, res, next) => {
  try {
    let onboarding = await Onboarding.findOne({ user: req.params.userId });

    if (!onboarding) {
      return next(
        new ErrorResponse(
          `Onboarding data not found for user ${req.params.userId}`,
          404
        )
      );
    }

    // Make sure user is onboarding owner or admin
    if (
      req.user.role !== 'admin' &&
      onboarding.user.toString() !== req.user.id
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to complete this onboarding`,
          401
        )
      );
    }

    // Update onboarding as completed
    onboarding = await Onboarding.findOneAndUpdate(
      { user: req.params.userId },
      { completed: true },
      {
        new: true,
        runValidators: true,
      }
    );

    // Update profile as onboarded
    const profile = await Profile.findOneAndUpdate(
      { user: req.params.userId },
      { isOnboarded: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};