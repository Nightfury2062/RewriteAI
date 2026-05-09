const RewriteItem = require('../models/RewriteItem');

/**
 * Controller to save a new rewritten item to the database.
 */
const saveRewriteItem = async (req, res) => {
  try {
    const { originalText, rewrittenText, formality, tone, length } = req.body;

    // 1. Basic validation to ensure all required fields are present
    if (!originalText || !rewrittenText || !formality || !tone || !length) {
      return res.status(400).json({ 
        error: 'All fields (originalText, rewrittenText, formality, tone, length) are required to save the rewrite.' 
      });
    }

    // 2. Save the new record securely to the SQLite database
    const newItem = await RewriteItem.create({
      originalText,
      rewrittenText,
      formality,
      tone,
      length
    });

    // 3. Return the saved item, including its new auto-generated ID and timestamps
    return res.status(201).json(newItem);

  } catch (error) {
    // Log raw error on the server for debugging
    console.error('Error saving rewrite item:', error);
    // Never expose stack traces to the client
    return res.status(500).json({ error: 'Failed to save the rewritten item to the database.' });
  }
};

/**
 * Controller to fetch all saved rewritten items from the database.
 */
const getRewriteItems = async (req, res) => {
  try {
    // Fetch all items using Sequelize, sorted by creation date (newest first)
    const items = await RewriteItem.findAll({
      order: [['createdAt', 'DESC']]
    });

    // Return the clean JSON array
    return res.status(200).json(items);

  } catch (error) {
    console.error('Error fetching rewrite items:', error);
    return res.status(500).json({ error: 'Failed to retrieve saved rewrites.' });
  }
};

/**
 * Controller to safely delete a specific rewritten item by its ID.
 */
const deleteRewriteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the exact item first to verify it exists
    const item = await RewriteItem.findByPk(id);

    // 2. Handle missing items safely
    if (!item) {
      return res.status(404).json({ error: 'Item not found. It may have already been deleted.' });
    }

    // 3. Execute the deletion
    await item.destroy();

    // 4. Return a success confirmation
    return res.status(200).json({ message: 'Item deleted successfully.' });

  } catch (error) {
    console.error('Error deleting rewrite item:', error);
    return res.status(500).json({ error: 'Failed to delete the item.' });
  }
};

module.exports = {
  saveRewriteItem,
  getRewriteItems,
  deleteRewriteItem
};
