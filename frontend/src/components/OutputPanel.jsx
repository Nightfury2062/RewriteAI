import { useState, useEffect } from 'react';
import './OutputPanel.css';

const OutputPanel = ({ result, loading }) => {
  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Effect to handle the typewriter animation
  useEffect(() => {
    // If loading or no result, reset everything
    if (loading || !result) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    // When a new result arrives, start typing
    setDisplayedText('');
    setIsTyping(true);
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex <= result.length) {
        // Using substring guarantees we never drop or duplicate characters due to React state batching
        setDisplayedText(result.substring(0, currentIndex));
        currentIndex++;
      } else {
        // Animation finished
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 15); // 15ms makes it feel fast and AI-like

    // Cleanup interval if the component unmounts or result changes mid-typing
    return () => clearInterval(typingInterval);
  }, [result, loading]);

  const handleCopy = async () => {
    // Only copy if the full result is available
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
            disabled={isTyping} // Prevent copying partial text while animating
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
            {displayedText}
            {isTyping && <span className="typing-cursor">|</span>}
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
