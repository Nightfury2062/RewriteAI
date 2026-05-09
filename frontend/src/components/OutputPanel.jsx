import { useState } from 'react';
import './OutputPanel.css';

const OutputPanel = ({ result, loading, isStreaming }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Only copy if result exists
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="output-panel">
      <div className="output-header">
        <h2>Rewritten Content</h2>
        {result && !loading && (
          <button 
            className="copy-button" 
            onClick={handleCopy}
            title="Copy to clipboard"
            disabled={isStreaming} // Prevent copying partial text while actively streaming
          >
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
        )}
      </div>

      <div className="output-content">
        {loading ? (
          <div className="loading-state">
            <span className="spinner"></span>
            <p>Rewriting your content...</p>
          </div>
        ) : result ? (
          <div className="result-text">
            {result}
            {isStreaming && <span className="typing-cursor">|</span>}
          </div>
        ) : (
          <div className="empty-state">
            <p>Your rewritten text will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
