const path = require('path');
const Profile = require('../models/profile.model');
const multer = require('multer');
const { ErrorResponse } = require('../utils/errorHandler');

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/resumes',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + req.params.userId + path.extname(file.originalname)
    );
  },
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('resume');

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /pdf|doc|docx/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: PDF or Word documents only!');
  }
}

// @desc    Upload resume
// @route   POST /api/files/resume/:userId
// @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    // Make sure user is uploading their own resume or is admin
    if (req.user.role !== 'admin' && req.params.userId !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to upload resume for user ${req.params.userId}`,
          401
        )
      );
    }

    upload(req, res, async (err) => {
      if (err) {
        return next(new ErrorResponse(err, 400));
      } else {
        if (req.file === undefined) {
          return next(new ErrorResponse('No file selected', 400));
        } else {
          // Update profile with resume URL
          const profile = await Profile.findOneAndUpdate(
            { user: req.params.userId },
            { resumeUrl: `/uploads/resumes/${req.file.filename}` },
            { new: true }
          );

          res.status(200).json({
            success: true,
            data: {
              resume_url: `/uploads/resumes/${req.file.filename}`,
              profile,
            },
          });
        }
      }
    });
  } catch (err) {
    next(err);
  }
};