const { buildRewritePrompt } = require('../prompts/rewritePrompt');
const { generateRewriteStream } = require('../services/geminiService');

// Define allowed options for validation to prevent invalid or malicious inputs
const ALLOWED_FORMALITY = ['formal', 'semi-formal', 'conversational', 'informal'];
const ALLOWED_TONE = ['professional', 'friendly', 'serious', 'emotional', 'persuasive'];
const ALLOWED_LENGTH = ['one-line', 'concise', 'medium', 'in-depth'];

/**
 * Handles the POST request to stream rewritten content using Server-Sent Events (SSE).
 * Validates the input, builds the AI prompt, and progressively pipes chunks to the client.
 */
const streamRewriteResponse = async (req, res) => {
  // 1. Setup necessary SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Track client connection state to halt processing if they disconnect mid-stream
  let isClientConnected = true;
  req.on('close', () => {
    isClientConnected = false;
  });

  try {
    const { text, formality, tone, length } = req.body;

    // 2. Validate Input
    // We send validation errors securely as SSE data events, then cleanly close the stream
    if (!text || typeof text !== 'string' || text.trim() === '') {
      res.write(`data: ${JSON.stringify({ error: 'Text is required to process the rewrite.' })}\n\n`);
      return res.end();
    }

    if (text.length > 10000) {
      res.write(`data: ${JSON.stringify({ error: 'Provided text exceeds the maximum allowed length of 10,000 characters.' })}\n\n`);
      return res.end();
    }

    if (!ALLOWED_FORMALITY.includes(formality)) {
      res.write(`data: ${JSON.stringify({ error: 'Invalid formality setting selected.' })}\n\n`);
      return res.end();
    }

    if (!ALLOWED_TONE.includes(tone)) {
      res.write(`data: ${JSON.stringify({ error: 'Invalid tone setting selected.' })}\n\n`);
      return res.end();
    }

    if (!ALLOWED_LENGTH.includes(length)) {
      res.write(`data: ${JSON.stringify({ error: 'Invalid length setting selected.' })}\n\n`);
      return res.end();
    }

    // 3. Build the AI Prompt
    const prompt = buildRewritePrompt({
      text: text.trim(),
      formality,
      tone,
      length
    });

    // 4. Stream Gemini Response progressively to frontend
    const stream = generateRewriteStream(prompt);

    for await (const chunk of stream) {
      if (!isClientConnected) {
        // Abort iteration immediately if the client closed their browser/connection
        break;
      }
      
      // Send chunk in valid SSE format. We JSON-stringify the object to ensure
      // any newlines or special characters inside the text chunk don't break the SSE protocol.
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    // 5. Signal the clean end of the stream
    if (isClientConnected) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }

  } catch (error) {
    // Log the raw error securely on the server console
    console.error('Controller Error in streamRewriteResponse:', error);

    if (isClientConnected) {
      // Stream a safe, generic error event down to the frontend
      const userFriendlyMessage = error.message && error.message.includes('AI') 
        ? error.message 
        : 'An unexpected internal server error occurred while streaming. Please try again.';

      res.write(`data: ${JSON.stringify({ error: userFriendlyMessage })}\n\n`);
      res.end();
    }
  }
};

module.exports = {
  streamRewriteResponse
};
