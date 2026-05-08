import { useState } from 'react';
import RewriteForm from '../components/RewriteForm';
import OutputPanel from '../components/OutputPanel';
import { rewriteContent } from '../services/api';
import './Home.css';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRewriteSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null); // Clear previous result on new submission

    try {
      const response = await rewriteContent(formData);
      
      // The backend processController returns { success: true, result: '...' }
      if (response && response.result) {
        setResult(response.result);
      } else {
        throw new Error('Unexpected response format from server.');
      }
    } catch (err) {
      console.error('Error rewriting content:', err);
      setError(err.message || 'Failed to rewrite content. Please try again.');
    } finally {
      setLoading(false);
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
          <RewriteForm onSubmit={handleRewriteSubmit} loading={loading} />
        </div>
        <div className="panel-container">
          <OutputPanel result={result} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Home;
