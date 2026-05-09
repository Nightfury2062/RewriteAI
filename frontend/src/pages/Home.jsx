import { useState } from 'react';
import RewriteForm from '../components/RewriteForm';
import OutputPanel from '../components/OutputPanel';
import { streamRewriteContent } from '../services/api';
import './Home.css';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);

  const handleRewriteSubmit = async (formData) => {
    setLoading(true);
    setIsStreaming(true);
    setError(null);
    setResult(''); // Clear previous result instantly

    let firstChunkReceived = false;

    try {
      // Connect to the streaming API
      await streamRewriteContent(formData, (chunk) => {
        // Hide the loading spinner as soon as the first piece of text arrives
        if (!firstChunkReceived) {
          setLoading(false);
          firstChunkReceived = true;
        }
        // Progressively append incoming text chunks to the state
        setResult((prev) => prev + chunk);
      });
    } catch (err) {
      console.error('Error rewriting content:', err);
      setError(err.message || 'Failed to stream rewritten content. Please try again.');
    } finally {
      // Ensure UI states are cleanly resolved when the stream finishes or errors out
      setLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>RewriteAI</h1>
        <p>AI-powered content rewriting assistant</p>
      </div>
      
      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      <div className="home-content">
        <div className="panel-container">
          <RewriteForm onSubmit={handleRewriteSubmit} loading={loading || isStreaming} />
        </div>
        <div className="panel-container">
          <OutputPanel result={result} loading={loading} isStreaming={isStreaming} />
        </div>
      </div>
    </div>
  );
};

export default Home;
