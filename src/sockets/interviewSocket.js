const WebSocket = require('ws');
const { processRealTime } = require('../service/aiService');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');

    // Extract token from query parameters
    const token = req.url.split('token=')[1];
    
    if (!token) {
      ws.close(1008, 'Authentication token required');
      return;
    }

    // Verify token and get user (you'll need to implement this)
    const user = verifyToken(token); // Implement this function
    
    if (!user) {
      ws.close(1008, 'Invalid authentication');
      return;
    }

    ws.user = user;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        // Validate interview access if interviewId is provided
        if (data.interviewId) {
          const interview = await Interview.findById(data.interviewId);
          if (
            ws.user.role !== 'admin' &&
            interview.interviewer._id.toString() !== ws.user.id &&
            interview.interviewee._id.toString() !== ws.user.id
          ) {
            throw new Error('Not authorized for this interview');
          }
        }

        // Process with Gemini
        const result = await processRealTime(data.chunk);
        
        // Send back processed data
        ws.send(JSON.stringify({
          type: 'analysis_update',
          data: result
        }));
      } catch (err) {
        console.error('WebSocket processing error:', err);
        ws.send(JSON.stringify({
          type: 'error',
          message: err.message || 'Processing error'
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return wss;
};

module.exports = setupWebSocket;