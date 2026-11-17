const Profile = require('../models/profile.model');
const User = require('../models/user.model');
const { ErrorResponse } = require('../utils/errorHandler');

// @desc    Get all profiles
// @route   GET /api/profiles
// @access  Private
exports.getProfiles = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Filter by role if provided
    if (reqQuery.role) {
      const users = await User.find({ role: reqQuery.role }).select('_id');
      query = Profile.find({ user: { $in: users } }).populate({
        path: 'user',
        select: 'fullName email role',
      });
      delete reqQuery.role;
    } else {
      query = Profile.find().populate({
        path: 'user',
        select: 'fullName email role',
      });
    }

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Profile.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const profiles = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: profiles.length,
      pagination,
      data: profiles,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single profile
// @route   GET /api/profiles/:userId
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate({
      path: 'user',
      select: 'fullName email role',
    });

    if (!profile) {
      return next(
        new ErrorResponse(`Profile not found with user id of ${req.params.userId}`, 404)
      );
    }

    // Make sure user is profile owner or admin
    if (
      req.user.role !== 'admin' &&
      profile.user._id.toString() !== req.user.id
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to access this profile`,
          401
        )
      );
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile
// @route   PUT /api/profiles/:userId
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.params.userId });

    if (!profile) {
      return next(
        new ErrorResponse(`Profile not found with user id of ${req.params.userId}`, 404)
      );
    }

    // Make sure user is profile owner or admin
    if (
      req.user.role !== 'admin' &&
      profile.user.toString() !== req.user.id
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this profile`,
          401
        )
      );
    }

    profile = await Profile.findOneAndUpdate(
      { user: req.params.userId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: 'user',
      select: 'fullName email role',
    });

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};