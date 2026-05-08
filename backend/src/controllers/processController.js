const { buildRewritePrompt } = require('../prompts/rewritePrompt');
const { generateRewrite } = require('../services/geminiService');

// Define allowed options for validation to prevent invalid or malicious inputs
const ALLOWED_FORMALITY = ['formal', 'semi-formal', 'conversational', 'informal'];
const ALLOWED_TONE = ['professional', 'friendly', 'serious', 'emotional', 'persuasive'];
const ALLOWED_LENGTH = ['one-line', 'concise', 'medium', 'in-depth'];

/**
 * Handles the POST request to rewrite content.
 * Validates the input, builds the AI prompt, generates the rewrite, and returns it safely.
 */
const processRewriteRequest = async (req, res, next) => {
  try {
    const { text, formality, tone, length } = req.body;

    // 1. Validate Input
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Text is required to process the rewrite.'
      });
    }

    if (text.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Provided text exceeds the maximum allowed length of 10,000 characters.'
      });
    }

    if (!ALLOWED_FORMALITY.includes(formality)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid formality setting selected.'
      });
    }

    if (!ALLOWED_TONE.includes(tone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tone setting selected.'
      });
    }

    if (!ALLOWED_LENGTH.includes(length)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid length setting selected.'
      });
    }

    // 2. Build the AI Prompt
    const prompt = buildRewritePrompt({
      text: text.trim(),
      formality,
      tone,
      length
    });

    // 3. Generate Rewritten Text using Gemini service
    const generatedText = await generateRewrite(prompt);

    // 4. Return successful JSON response
    return res.status(200).json({
      success: true,
      result: generatedText
    });

  } catch (error) {
    // Log the error securely on the server console for debugging
    console.error('Controller Error in processRewriteRequest:', error);
    
    // We utilize the clean error message thrown by geminiService, or fallback to a safe generic message
    // to absolutely ensure no raw Gemini provider errors or stack traces are exposed.
    const userFriendlyMessage = error.message && error.message.includes('AI') 
      ? error.message 
      : 'An unexpected internal server error occurred while rewriting. Please try again.';

    return res.status(500).json({
      success: false,
      error: userFriendlyMessage
    });
  }
};

module.exports = {
  processRewriteRequest
};
