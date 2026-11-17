const { GoogleGenerativeAI } = require('@google/generative-ai');
const ErrorResponse = require('../utils/errorResponse');
const AIAnalysis = require('../models/AIAnalysis');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-pro",
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 2048
  }
});

// System prompt templates
const PROMPT_TEMPLATES = {
  fullAnalysis: `
  You are an expert interview analysis system. Analyze the provided interview transcript and generate a comprehensive evaluation.

  Analysis Requirements:
  1. Sentiment Analysis:
     - Overall sentiment (positive/neutral/negative)
     - Sentiment scores (0-1 scale)
     - Sentiment by key segments

  2. Content Analysis:
     - Extract key keywords with relevance scores
     - Identify main topics
     - Recognize important entities

  3. Skill Assessment:
     - Identify demonstrated skills with confidence levels
     - Provide evidence for each skill
     - Categorize as technical/soft/domain skills

  4. Communication Evaluation:
     - Assess clarity and fluency
     - Analyze speech pacing
     - Identify filler words

  5. Response Analysis:
     - Evaluate each Q&A pair
     - Assess completeness, accuracy, relevance
     - Provide specific feedback

  6. Behavioral Insights:
     - Confidence indicators
     - Engagement level
     - Stress markers

  7. Improvement Suggestions:
     - Prioritized areas for improvement
     - Specific suggestions
     - Recommended resources

  8. Summary:
     - Key strengths
     - Main weaknesses
     - Overall score (0-5)
     - Hiring recommendation
     - Narrative summary

  Return your analysis in JSON format matching this structure exactly:
  {
    "sentimentAnalysis": { /* ... */ },
    "contentAnalysis": { /* ... */ },
    "skillAssessment": [ /* ... */ ],
    "communicationAnalysis": { /* ... */ },
    "responseAnalysis": [ /* ... */ ],
    "behavioralAnalysis": { /* ... */ },
    "improvementSuggestions": [ /* ... */ ],
    "summary": { /* ... */ },
    "flags": [ /* ... */ ]
  }

  Interview Transcript:
  {transcript}
  `,

  realTimeAnalysis: `
  Analyze this live interview segment in real-time. Provide:
  - Current sentiment
  - Key keywords detected
  - Any notable skills mentioned
  - Communication quality indicators
  - Flags for any issues

  Return in JSON format:
  {
    "sentiment": string,
    "keywords": [ { "text": string, "relevance": number } ],
    "skills": [ { "skill": string, "confidence": number } ],
    "communication": {
      "clarity": number,
      "pacing": string,
      "fillerWords": [string]
    },
    "flags": [string]
  }

  Current Segment:
  {chunk}
  `
};

// Full interview analysis
const analyzeInterview = async (interviewId, transcript) => {
  try {
    const startTime = Date.now();
    
    const prompt = PROMPT_TEMPLATES.fullAnalysis.replace('{transcript}', transcript);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);
    const analysis = JSON.parse(jsonString);

    // Add processing metadata
    analysis.metadata = {
      processingTime: (Date.now() - startTime) / 1000,
      aiModel: 'gemini-pro',
      apiVersion: 'v1'
    };

    // Save to database
    const aiAnalysis = new AIAnalysis({
      interview: interviewId,
      transcript,
      ...analysis
    });

    await aiAnalysis.save();

    return aiAnalysis;
  } catch (err) {
    console.error('Gemini API Error:', err);
    throw new ErrorResponse('Failed to analyze interview transcript', 500);
  }
};

// Real-time processing
const processRealTime = async (chunk) => {
  try {
    const prompt = PROMPT_TEMPLATES.realTimeAnalysis.replace('{chunk}', chunk);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);
    
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('Real-time processing error:', err);
    throw new ErrorResponse('Real-time processing failed', 500);
  }
};

// Generate feedback report
const generateFeedbackReport = async (analysisId) => {
  try {
    const analysis = await AIAnalysis.findById(analysisId);
    if (!analysis) {
      throw new ErrorResponse('Analysis not found', 404);
    }

    const prompt = `
    Generate a comprehensive feedback report based on this analysis:
    ${JSON.stringify(analysis.toObject())}

    Structure the report with:
    1. Overall Assessment
    2. Strengths
    3. Areas for Improvement
    4. Detailed Skill Evaluation
    5. Communication Feedback
    6. Behavioral Observations
    7. Development Plan

    Return as markdown with headings and bullet points.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error('Feedback generation error:', err);
    throw new ErrorResponse('Failed to generate feedback report', 500);
  }
};

module.exports = {
  analyzeInterview,
  processRealTime,
  generateFeedbackReport
};