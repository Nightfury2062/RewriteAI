const express = require('express');
const router = express.Router();

// Import the streaming controller
const { streamRewriteResponse } = require('../controllers/streamController');

/**
 * @route POST /api/stream
 * @description Streams the generated AI rewrite progressively using Server-Sent Events (SSE)
 * @access Public
 */
router.post('/', streamRewriteResponse);

module.exports = router;
