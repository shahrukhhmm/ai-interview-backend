const ErrorResponse = require('../utils/errorHandler');
const Interview = require('../models/interview.model');
const AIAnalysis = require('../models/ai.model');
const { 
  analyzeInterview, 
  processRealTime,
  generateFeedbackReport
} = require('../services/aiService');

// @desc    Analyze full interview transcript
// @route   POST /api/ai/analyze/:interviewId
// @access  Private
exports.analyzeInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.interviewId)
      .populate('interviewer', 'fullName')
      .populate('interviewee', 'fullName');

    if (!interview) {
      return next(new ErrorResponse('Interview not found', 404));
    }

    // Verify access
    if (
      req.user.role !== 'admin' &&
      interview.interviewer._id.toString() !== req.user.id &&
      interview.interviewee._id.toString() !== req.user.id
    ) {
      return next(new ErrorResponse('Not authorized', 401));
    }

    if (!interview.transcript) {
      return next(new ErrorResponse('No transcript available', 400));
    }

    const analysis = await analyzeInterview(interview._id, interview.transcript);

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get analysis for interview
// @route   GET /api/ai/analysis/:interviewId
// @access  Private
exports.getInterviewAnalysis = async (req, res, next) => {
  try {
    const analysis = await AIAnalysis.findOne({ interview: req.params.interviewId })
      .populate('interview');

    if (!analysis) {
      return next(new ErrorResponse('Analysis not found', 404));
    }

    // Verify access
    const interview = analysis.interview;
    if (
      req.user.role !== 'admin' &&
      interview.interviewer._id.toString() !== req.user.id &&
      interview.interviewee._id.toString() !== req.user.id
    ) {
      return next(new ErrorResponse('Not authorized', 401));
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate feedback report
// @route   POST /api/ai/feedback/:analysisId
// @access  Private
exports.generateFeedbackReport = async (req, res, next) => {
  try {
    const report = await generateFeedbackReport(req.params.analysisId);
    res.status(200).json({
      success: true,
      data: {
        report,
        format: 'markdown'
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Process real-time interview chunk
// @route   POST /api/ai/realtime
// @access  Private
exports.processRealTime = async (req, res, next) => {
  try {
    const { chunk, interviewId } = req.body;
    
    if (!chunk || typeof chunk !== 'string') {
      return next(new ErrorResponse('Invalid chunk data', 400));
    }

    // Verify interview access if provided
    if (interviewId) {
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return next(new ErrorResponse('Interview not found', 404));
      }
      if (
        req.user.role !== 'admin' &&
        interview.interviewer._id.toString() !== req.user.id &&
        interview.interviewee._id.toString() !== req.user.id
      ) {
        return next(new ErrorResponse('Not authorized', 401));
      }
    }

    const result = await processRealTime(chunk);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};