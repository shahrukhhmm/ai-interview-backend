require('dotenv').config()
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profiles', require('./routes/profile.routes'));
app.use('/api/onboarding', require('./routes/onboarding.routes'));
app.use('/api/interviews', require('./routes/interview.routes'));
app.use('/api/feedback', require('./routes/feedback.routes'));
app.use('/api/files', require('./routes/file.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/ai', require('./routes/ai.routes'));



module.exports = app;