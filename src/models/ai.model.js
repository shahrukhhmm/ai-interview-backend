const mongoose = require('mongoose');
const { Schema } = mongoose;

const AIAnalysisSchema = new Schema({
  // Reference to the interview being analyzed
  interview: {
    type: Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
    index: true
  },
  
  // Raw transcript text
  transcript: {
    type: String,
    required: true
  },
  
  // Metadata about the analysis
  metadata: {
    analysisDate: {
      type: Date,
      default: Date.now
    },
    processingTime: { // in seconds
      type: Number,
      required: true
    },
    aiModel: {
      type: String,
      required: true,
      enum: ['gemini-pro', 'gemini-ultra', 'custom-model-v1'],
      default: 'gemini-pro'
    },
    apiVersion: {
      type: String,
      default: 'v1'
    }
  },
  
  // Sentiment analysis results
  sentimentAnalysis: {
    overallSentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      required: true
    },
    sentimentScores: {
      positive: {
        type: Number,
        min: 0,
        max: 1,
        required: true
      },
      neutral: {
        type: Number,
        min: 0,
        max: 1,
        required: true
      },
      negative: {
        type: Number,
        min: 0,
        max: 1,
        required: true
      }
    },
    sentimentBySegment: [{
      text: String,
      startTime: Number, // in seconds
      endTime: Number,   // in seconds
      sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'negative']
      },
      confidence: Number
    }]
  },
  
  // Content analysis
  contentAnalysis: {
    keywords: [{
      text: String,
      relevance: {
        type: Number,
        min: 0,
        max: 1
      },
      frequency: Number,
      context: [String] // example sentences where keyword appears
    }],
    topics: [{
      name: String,
      relevance: Number,
      keywords: [String]
    }],
    entities: [{
      type: {
        type: String,
        enum: ['person', 'organization', 'location', 'technology', 'concept']
      },
      name: String,
      relevance: Number
    }]
  },
  
  // Skills assessment
  skillAssessment: [{
    skill: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['technical', 'soft', 'domain']
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    evidence: [{
      text: String,
      relevance: Number
    }],
    verbatimExamples: [String]
  }],
  
  // Communication analysis
  communicationAnalysis: {
    clarityScore: {
      type: Number,
      min: 0,
      max: 5
    },
    fluencyScore: {
      type: Number,
      min: 0,
      max: 5
    },
    pacing: {
      wordsPerMinute: Number,
      assessment: {
        type: String,
        enum: ['too-fast', 'fast', 'optimal', 'slow', 'too-slow']
      }
    },
    fillerWords: [{
      word: String,
      count: Number
    }]
  },
  
  // Question/response analysis
  responseAnalysis: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    qualityAssessment: {
      completeness: {
        type: Number,
        min: 0,
        max: 1
      },
      accuracy: {
        type: Number,
        min: 0,
        max: 1
      },
      relevance: {
        type: Number,
        min: 0,
        max: 1
      },
      structure: {
        type: Number,
        min: 0,
        max: 1
      }
    },
    feedback: String,
    suggestedImprovements: [String]
  }],
  
  // Behavioral analysis
  behavioralAnalysis: {
    confidenceIndicators: [{
      type: String,
      enum: ['voice-tone', 'word-choice', 'response-time', 'body-language'],
      confidenceLevel: Number
    }],
    engagementScore: Number,
    stressIndicators: [String]
  },
  
  // Improvement suggestions
  improvementSuggestions: [{
    area: {
      type: String,
      required: true
    },
    suggestion: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      required: true
    },
    reasoning: String,
    resources: [{
      type: String,
      enum: ['article', 'video', 'course', 'book', 'exercise']
    }]
  }],
  
  // Summary and overall assessment
  summary: {
    strengths: [String],
    weaknesses: [String],
    overallScore: {
      type: Number,
      min: 0,
      max: 5
    },
    recommendation: {
      type: String,
      enum: ['strong-hire', 'hire', 'borderline', 'no-hire', 'strong-no-hire']
    },
    narrative: String
  },
  
  // Additional flags and metadata
  flags: [{
    type: String,
    enum: ['incomplete-info', 'contradictions', 'overconfidence', 'underconfidence']
  }],
  
  // System fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
AIAnalysisSchema.index({ interview: 1 });
AIAnalysisSchema.index({ 'metadata.analysisDate': -1 });
AIAnalysisSchema.index({ 'skillAssessment.skill': 1 });
AIAnalysisSchema.index({ 'contentAnalysis.keywords.text': 1 });

// Middleware to update the updatedAt field
AIAnalysisSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods for the model
AIAnalysisSchema.statics.findByInterviewId = function(interviewId) {
  return this.findOne({ interview: interviewId })
    .populate('interview');
};

AIAnalysisSchema.statics.findBySkill = function(skill) {
  return this.find({ 'skillAssessment.skill': skill });
};

// Instance methods
AIAnalysisSchema.methods.getTopSkills = function(limit = 3) {
  return this.skillAssessment
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
};

AIAnalysisSchema.methods.getCriticalImprovements = function() {
  return this.improvementSuggestions
    .filter(s => s.priority === 'critical' || s.priority === 'high');
};

const AIAnalysis = mongoose.model('AIAnalysis', AIAnalysisSchema);

module.exports = AIAnalysis;