const Feedback = require('../models/feedback.model');
const Interview = require('../models/interview.model');
const { ErrorResponse } = require('../utils/errorHandler');

// @desc    Get feedback for interview
// @route   GET /api/feedback/:interviewId
// @access  Private
exports.getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({
      interview: req.params.interviewId,
    })
      .populate('reviewer', 'fullName email')
      .populate('reviewee', 'fullName email');

    if (!feedback) {
      return next(
        new ErrorResponse(
          `Feedback not found for interview ${req.params.interviewId}`,
          404
        )
      );
    }

    // Make sure user is part of the interview or admin
    const interview = await Interview.findById(req.params.interviewId);
    if (
      req.user.role !== 'admin' &&
      interview.interviewer.toString() !== req.user.id &&
      interview.interviewee.toString() !== req.user.id
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to access this feedback`,
          401
        )
      );
    }

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all feedback for user
// @route   GET /api/feedback/user/:userId
// @access  Private
exports.getUserFeedback = async (req, res, next) => {
  try {
    // Make sure user is accessing their own feedback or is admin
    if (req.user.role !== 'admin' && req.params.userId !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to access feedback for user ${req.params.userId}`,
          401
        )
      );
    }

    const feedback = await Feedback.find({ reviewee: req.params.userId })
      .populate('reviewer', 'fullName email')
      .populate('interview', 'scheduledAt');

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Private
exports.createFeedback = async (req, res, next) => {
  try {
    // Add reviewer to req.body
    req.body.reviewer = req.user.id;

    // Check if interview exists
    const interview = await Interview.findById(req.body.interview_id);
    if (!interview) {
      return next(
        new ErrorResponse(`No interview found with id ${req.body.interview_id}`, 404)
      );
    }

    // Check if feedback already exists for this interview
    const existingFeedback = await Feedback.findOne({
      interview: req.body.interview_id,
    });
    if (existingFeedback) {
      return next(
        new ErrorResponse(
          `Feedback already exists for interview ${req.body.interview_id}`,
          400
        )
      );
    }

    // Make sure user is the interviewer
    if (interview.interviewer.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to create feedback for this interview`,
          401
        )
      );
    }

    // Set reviewee as the interviewee
    req.body.reviewee = interview.interviewee;

    const feedback = await Feedback.create({
      interview: req.body.interview_id,
      reviewer: req.user.id,
      reviewee: interview.interviewee,
      technicalScore: req.body.technical_score,
      softSkillsScore: req.body.soft_skills_score,
      comments: req.body.comments,
      strengths: req.body.strengths,
      areasForImprovement: req.body.areas_for_improvement,
    });

    // Update interview status to completed
    await Interview.findByIdAndUpdate(req.body.interview_id, {
      status: 'completed',
    });

    res.status(201).json({
      success: true,
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
};