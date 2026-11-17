const { generateToken } = require('../config/jwt');
const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const { ErrorResponse } = require('../utils/errorHandler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
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

    // Create token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Get profile
    const profile = await Profile.findOne({ user: user._id });

    // Create token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // In a real app, you would add the token to a blacklist here
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const profile = await Profile.findOne({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
};