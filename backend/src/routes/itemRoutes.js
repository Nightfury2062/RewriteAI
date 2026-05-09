const express = require('express');
const router = express.Router();

// Import the specific controller methods for handling items
const { 
  getRewriteItems, 
  saveRewriteItem, 
  deleteRewriteItem 
} = require('../controllers/itemController');

// GET /api/items - Fetch all saved rewrites
router.get('/', getRewriteItems);

// POST /api/items - Save a new rewrite to the database
router.post('/', saveRewriteItem);

// DELETE /api/items/:id - Delete a specific rewrite by its unique ID
router.delete('/:id', deleteRewriteItem);

module.exports = router;
