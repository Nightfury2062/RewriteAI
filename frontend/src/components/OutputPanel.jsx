import { useState, useEffect } from 'react';
import ThinkingAnimation from './ThinkingAnimation';
import './OutputPanel.css';

const OutputPanel = ({ result, loading, isStreaming }) => {
  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  // Progressive Word-by-Word Reveal Effect
  useEffect(() => {
    // If we're loading, reset the text completely
    if (loading) {
      setDisplayedText('');
      return;
    }

    // If result hasn't grown past displayedText, do nothing
    if (displayedText.length >= result.length) {
      return;
    }

    let timeoutId;

    const revealNextWord = () => {
      const remaining = result.slice(displayedText.length);
      
      // Match the next word and its trailing whitespace
      // ^(\S+\s*|\s+) ensures we get exactly one word + spaces, or just spaces if consecutive
      const match = remaining.match(/^(\S+\s*|\s+)/);
      
      let nextChunk = '';
      if (match) {
        nextChunk = match[0];
      } else {
        nextChunk = remaining; // Fallback edge case
      }

      setDisplayedText(prev => prev + nextChunk);
    };

    // Use a small timeout to allow UI paint between words
    // 20ms provides a fast but highly readable, organic flow
    timeoutId = setTimeout(revealNextWord, 20); 

    return () => clearTimeout(timeoutId);
  }, [result, displayedText, loading]);

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

  // Determine if we are still actively revealing text visually
  // True if backend is still streaming OR if our visual queue is still catching up
  const isRevealing = isStreaming || displayedText.length < result.length;

  return (
    <div className="output-panel">
      <div className="output-header">
        <h2>Rewritten Content</h2>
        {result && !loading && (
          <button 
            className="copy-button" 
            onClick={handleCopy}
            title="Copy to clipboard"
            disabled={isRevealing} // Prevent copying partial text while actively streaming/revealing
          >
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
        )}
      </div>

      <div className="output-content">
        {loading ? (
          <ThinkingAnimation />
        ) : result ? (
          <div className="result-text">
            {displayedText}
            {isRevealing && <span className="typing-cursor"></span>}
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
