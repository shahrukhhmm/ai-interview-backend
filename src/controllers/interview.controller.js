const Interview = require('../models/interview.model');
const User = require('../models/user.model');
const { ErrorResponse } = require('../utils/errorHandler');

// @desc    Get all interviews
// @route   GET /api/interviews
// @access  Private
exports.getInterviews = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'upcoming'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // For interviewer or interviewee
    if (req.query.interviewerId || req.query.intervieweeId) {
      if (req.query.interviewerId) {
        reqQuery.interviewer = req.query.interviewerId;
        delete reqQuery.interviewerId;
      }
      if (req.query.intervieweeId) {
        reqQuery.interviewee = req.query.intervieweeId;
        delete reqQuery.intervieweeId;
      }
    }

    // For upcoming interviews
    if (req.query.upcoming === 'true') {
      reqQuery.scheduledAt = { $gte: new Date() };
      reqQuery.status = 'scheduled';
    }

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    query = Interview.find(JSON.parse(queryStr))
      .populate('interviewer', 'fullName email')
      .populate('interviewee', 'fullName email');

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
      query = query.sort('scheduledAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Interview.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const interviews = await query;

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
      count: interviews.length,
      pagination,
      data: interviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single interview
// @route   GET /api/interviews/:id
// @access  Private
exports.getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('interviewer', 'fullName email')
      .populate('interviewee', 'fullName email');

    if (!interview) {
      return next(
        new ErrorResponse(`Interview not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is part of the interview or admin
    if (
      req.user.role !== 'admin' &&
      interview.interviewer._id.toString() !== req.user.id &&
      interview.interviewee._id.toString() !== req.user.id
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to access this interview`,
          401
        )
      );
    }

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new interview
// @route   POST /api/interviews
// @access  Private
exports.createInterview = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.interviewer = req.user.id;

    // Check if interviewee exists
    const interviewee = await User.findById(req.body.interviewee);
    if (!interviewee) {
      return next(
        new ErrorResponse(`No user found with id ${req.body.interviewee}`, 404)
      );
    }

    const interview = await Interview.create(req.body);

    res.status(201).json({
      success: true,
      data: interview,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update interview
// @route   PUT /api/interviews/:id
// @access  Private
exports.updateInterview = async (req, res, next) => {
  try {
    let interview = await Interview.findById(req.params.id);

    if (!interview) {
      return next(
        new ErrorResponse(`Interview not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is interviewer or admin
    if (
      req.user.role !== 'admin' &&
      interview.interviewer.toString() !== req.user.id
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this interview`,
          401
        )
      );
    }

    interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update interview transcript
// @route   PUT /api/interviews/:id/transcript
// @access  Private
exports.updateInterviewTranscript = async (req, res, next) => {
  try {
    let interview = await Interview.findById(req.params.id);

    if (!interview) {
      return next(
        new ErrorResponse(`Interview not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is part of the interview or admin
    if (
      req.user.role !== 'admin' &&
      interview.interviewer._id.toString() !== req.user.id &&
      interview.interviewee._id.toString() !== req.user.id
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this interview transcript`,
          401
        )
      );
    }

    interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { transcript: req.body.transcript },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (err) {
    next(err);
  }
};