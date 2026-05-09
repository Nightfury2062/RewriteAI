import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { fetchRewriteItems, deleteRewriteItem } from '../services/api';
import SavedItemCard from './SavedItemCard';
import './SavedItemsPanel.css';

/**
 * Sidebar panel that displays all saved rewrites.
 * Allows viewing and deleting items.
 *
 * @param {Function} onViewItem - Called with the full item object when the user clicks a card to view it.
 */
const SavedItemsPanel = forwardRef(({ onViewItem }, ref) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Load all saved items from the database
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRewriteItems();
      setItems(data);
    } catch (err) {
      setError('Failed to load saved rewrites.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Allow parent components to trigger a reload via a ref
  useImperativeHandle(ref, () => ({
    reload: loadItems,
  }));

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Handle deleting a single item
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteRewriteItem(id);
      // Remove the deleted item from state immediately without a full reload
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError('Failed to delete the item. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside className="saved-panel">
      <div className="saved-panel-header">
        <h2>Saved Rewrites</h2>
        <button
          className="refresh-btn"
          onClick={loadItems}
          title="Refresh list"
          disabled={loading}
        >
          ↻
        </button>
      </div>

      <div className="saved-panel-body">
        {loading && (
          <div className="saved-status">
            <span className="saved-spinner"></span>
            <p>Loading saved rewrites...</p>
          </div>
        )}

        {!loading && error && (
          <div className="saved-error">
            <p>{error}</p>
            <button className="retry-btn" onClick={loadItems}>Retry</button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="saved-empty">
            <span className="saved-empty-icon">📂</span>
            <p>No saved rewrites yet.</p>
            <p className="saved-empty-hint">Save a rewritten result to see it here.</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="saved-list">
            {items.map((item) => (
              <SavedItemCard
                key={item.id}
                item={item}
                onView={() => onViewItem(item)}
                onDelete={handleDelete}
                isDeleting={deletingId === item.id}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
});

export default SavedItemsPanel;
