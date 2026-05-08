import { useState } from 'react';
import './RewriteForm.css';

const RewriteForm = ({ onSubmit, loading }) => {
  const [text, setText] = useState('');
  const [formality, setFormality] = useState('formal');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    onSubmit({
      text,
      formality,
      tone,
      length
    });
  };

  return (
    <form className="rewrite-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="content-text">Content to Rewrite</label>
        <textarea
          id="content-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the text you want to rewrite here..."
          rows={6}
          disabled={loading}
        />
        <div className="char-count">
          {text.length} character{text.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="controls-group">
        <div className="form-group">
          <label htmlFor="formality">Formality</label>
          <select 
            id="formality" 
            value={formality} 
            onChange={(e) => setFormality(e.target.value)}
            disabled={loading}
          >
            <option value="formal">Formal</option>
            <option value="semi-formal">Semi-formal</option>
            <option value="conversational">Conversational</option>
            <option value="informal">Informal</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tone">Tone</label>
          <select 
            id="tone" 
            value={tone} 
            onChange={(e) => setTone(e.target.value)}
            disabled={loading}
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="serious">Serious</option>
            <option value="emotional">Emotional</option>
            <option value="persuasive">Persuasive</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="length">Length</label>
          <select 
            id="length" 
            value={length} 
            onChange={(e) => setLength(e.target.value)}
            disabled={loading}
          >
            <option value="one-line">One-line</option>
            <option value="concise">Concise</option>
            <option value="medium">Medium</option>
            <option value="in-depth">In-depth</option>
          </select>
        </div>
      </div>

      <button 
        type="submit" 
        className="submit-button" 
        disabled={loading || !text.trim()}
      >
        {loading ? 'Rewriting...' : 'Rewrite Content'}
      </button>
    </form>
  );
};

export default RewriteForm;
