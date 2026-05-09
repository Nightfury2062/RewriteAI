import { useState, useEffect } from 'react';
import './ThinkingAnimation.css';

const AI_STATUS_MESSAGES = [
  "Analyzing sentence structure...",
  "Detecting writing intent...",
  "Refining tone and clarity...",
  "Generating professional phrasing...",
  "Improving readability...",
  "Reconstructing sentence flow...",
  "Enhancing emotional depth...",
  "Optimizing communication style...",
  "Adapting language sophistication...",
  "Polishing grammar and fluency..."
];

const ThinkingAnimation = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeoutId;

    const currentMessage = AI_STATUS_MESSAGES[messageIndex];
    
    if (isDeleting) {
      if (displayedText.length === 0) {
        setIsDeleting(false);
        setMessageIndex((prev) => (prev + 1) % AI_STATUS_MESSAGES.length);
      } else {
        timeoutId = setTimeout(() => {
          setDisplayedText((prev) => prev.slice(0, -1));
        }, 15);
      }
    } else {
      if (displayedText.length === currentMessage.length) {
        timeoutId = setTimeout(() => {
          setIsDeleting(true);
        }, 1500); 
      } else {
        timeoutId = setTimeout(() => {
          setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
        }, 30); 
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayedText, isDeleting, messageIndex]);

  return (
    <div className="thinking-animation-container">
      <div className="thinking-icon-wrapper">
        <span className="thinking-icon">✨</span>
      </div>
      <div className="thinking-text-wrapper">
        <span className="thinking-text">{displayedText}</span>
        <span className="thinking-cursor"></span>
      </div>
    </div>
  );
};

export default ThinkingAnimation;
