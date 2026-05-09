const { buildRewritePrompt } = require('../prompts/rewritePrompt');
const { generateRewriteStream } = require('../services/geminiService');

// Define allowed options for validation to prevent invalid or malicious inputs
const ALLOWED_FORMALITY = ['formal', 'semi-formal', 'conversational', 'informal'];
const ALLOWED_TONE = ['professional', 'friendly', 'serious', 'emotional', 'persuasive'];
const ALLOWED_LENGTH = ['one-line', 'concise', 'medium', 'in-depth'];

/**
 * Handles the POST request to stream rewritten content using Server-Sent Events (SSE).
 */
const streamRewriteResponse = async (req, res) => {
  // 1. Setup SSE Headers safely to preserve CORS headers from middleware
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Flush headers immediately so the browser knows the SSE connection is open
  if (res.flushHeaders) {
    res.flushHeaders();
  }

  try {
    const { text, formality, tone, length } = req.body;

    // 2. Validate Input
    if (!text || typeof text !== 'string' || text.trim() === '') {
      res.write(`data: ${JSON.stringify({ error: 'Text is required to process the rewrite.' })}\n\n`);
      return res.end();
    }

    if (text.length > 10000) {
      res.write(`data: ${JSON.stringify({ error: 'Provided text exceeds 10,000 characters.' })}\n\n`);
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

    // 3. Build Prompt
    const prompt = buildRewritePrompt({
      text: text.trim(),
      formality,
      tone,
      length
    });

    // 4. Start Gemini Stream
    const stream = generateRewriteStream(prompt);

    for await (const chunk of stream) {
      // Send SSE chunk
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    // 5. Signal Stream Completion
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Streaming controller error:', error);

    const userFriendlyMessage =
      error.message && error.message.includes('AI')
        ? error.message
        : 'An unexpected streaming error occurred. Please try again.';

    res.write(`data: ${JSON.stringify({ error: userFriendlyMessage })}\n\n`);
    res.end();
  }
};

module.exports = {
  streamRewriteResponse
};