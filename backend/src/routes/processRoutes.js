const express = require('express');
const router = express.Router();
const { processRewriteRequest } = require('../controllers/processController');

// POST / route
router.post('/', processRewriteRequest);

module.exports = router;
