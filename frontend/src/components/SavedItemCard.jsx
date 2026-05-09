import './SavedItemCard.css';

/**
 * Displays a single saved rewrite as a compact, clickable card.
 *
 * @param {Object}   item       - The saved rewrite item from the database.
 * @param {Function} onView     - Called when the user clicks to open the item.
 * @param {Function} onDelete   - Called when the user clicks the delete button.
 * @param {boolean}  isDeleting - True while the delete request is in flight.
 */
const SavedItemCard = ({ item, onView, onDelete, isDeleting }) => {
  // Build a short preview (first 100 chars) of the rewritten text
  const preview =
    item.rewrittenText.length > 100
      ? item.rewrittenText.slice(0, 100).trim() + '...'
      : item.rewrittenText;

  // Format the timestamp into a readable date/time string
  const formattedDate = new Date(item.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="saved-card" onClick={onView} role="button" tabIndex={0}>
      <div className="saved-card-preview">{preview}</div>

      <div className="saved-card-meta">
        <div className="saved-card-tags">
          <span className="saved-tag">{item.formality}</span>
          <span className="saved-tag">{item.tone}</span>
          <span className="saved-tag">{item.length}</span>
        </div>

        <div className="saved-card-actions">
          <span className="saved-card-date">{formattedDate}</span>
          <button
            className="delete-btn"
            title="Delete this saved rewrite"
            disabled={isDeleting}
            onClick={(e) => {
              // Stop click from bubbling up to the card's onView handler
              e.stopPropagation();
              onDelete(item.id);
            }}
          >
            {isDeleting ? '...' : '✕'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedItemCard;
