import { useState, useRef, useCallback } from 'react';
import RewriteForm from '../components/RewriteForm';
import OutputPanel from '../components/OutputPanel';
import SavedItemsPanel from '../components/SavedItemsPanel';
import { streamRewriteContent, saveRewriteItem } from '../services/api';
import './Home.css';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Keep a ref to the sidebar so we can trigger a refresh from outside
  const savedPanelRef = useRef(null);

  // Store the last submitted form data so we can attach it when saving
  const lastFormDataRef = useRef(null);

  // -----------------------------------------------------------------------
  // Streaming rewrite handler
  // -----------------------------------------------------------------------
  const handleRewriteSubmit = async (formData) => {
    setLoading(true);
    setIsStreaming(true);
    setError(null);
    setResult('');
    setSaveSuccess(false);
    lastFormDataRef.current = formData; // remember for save

    let firstChunkReceived = false;

    try {
      await streamRewriteContent(formData, (chunk) => {
        if (!firstChunkReceived) {
          setLoading(false);
          firstChunkReceived = true;
        }
        setResult((prev) => prev + chunk);
      });
    } catch (err) {
      console.error('Error rewriting content:', err);
      setError(err.message || 'Failed to stream rewritten content. Please try again.');
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  // -----------------------------------------------------------------------
  // Save handler — persist current result to DB and refresh sidebar
  // -----------------------------------------------------------------------
  const handleSave = async (rewrittenText) => {
    const formData = lastFormDataRef.current;
    if (!formData || !rewrittenText) return;

    setIsSaving(true);
    try {
      await saveRewriteItem({
        originalText: formData.text,
        rewrittenText,
        formality: formData.formality,
        tone: formData.tone,
        length: formData.length,
      });
      setSaveSuccess(true);
      // Refresh the saved panel list
      if (savedPanelRef.current) {
        savedPanelRef.current.reload();
      }
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setError(err.message || 'Failed to save the rewrite.');
    } finally {
      setIsSaving(false);
    }
  };

  // -----------------------------------------------------------------------
  // View a saved item — load it directly into the output panel
  // -----------------------------------------------------------------------
  const handleViewSavedItem = useCallback((item) => {
    setResult(item.rewrittenText);
    setLoading(false);
    setIsStreaming(false);
    setSaveSuccess(false);
    // Store the item's metadata so Save still works if needed
    lastFormDataRef.current = {
      text: item.originalText,
      formality: item.formality,
      tone: item.tone,
      length: item.length,
    };
  }, []);

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
        {/* Left column: form */}
        <div className="panel-container panel-form">
          <RewriteForm onSubmit={handleRewriteSubmit} loading={loading || isStreaming} />
        </div>

        {/* Center column: output */}
        <div className="panel-container panel-output">
          <OutputPanel
            result={result}
            loading={loading}
            isStreaming={isStreaming}
            onSave={handleSave}
            isSaving={isSaving}
            saveSuccess={saveSuccess}
          />
        </div>

        {/* Right column: saved sidebar */}
        <div className="panel-container panel-sidebar">
          <SavedItemsPanel
            ref={savedPanelRef}
            onViewItem={handleViewSavedItem}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
