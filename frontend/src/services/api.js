import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Sends content to the backend to be rewritten.
 * @param {Object} data - The payload containing text, formality, tone, length, etc.
 * @returns {Promise<Object>} The response data from the backend.
 */
export const rewriteContent = async (data) => {
  try {
    const response = await apiClient.post('/api/process', data);
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.error || 'Server error occurred during processing.');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('Network error. Unable to reach the server.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Request failed: ${error.message}`);
    }
  }
};

/**
 * Streams content from the backend using Server-Sent Events (SSE).
 * 
 * @param {Object} data - The payload containing text, formality, tone, length, etc.
 * @param {Function} onChunk - Callback function executed whenever a new text chunk arrives.
 */
export const streamRewriteContent = async (data, onChunk) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/process/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok. Server might be down.');
    }

    // Access the response stream reader
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      // Read chunks from the stream progressively
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      // Decode the raw bytes into text
      buffer += decoder.decode(value, { stream: true });
      
      // SSE chunks are separated by double newlines
      const parts = buffer.split('\n\n');

      // The last part might be an incomplete chunk, so we keep it in the buffer
      buffer = parts.pop();

      // Process each complete chunk
      for (const part of parts) {
        if (part.startsWith('data: ')) {
          // Extract the JSON string payload
          const jsonStr = part.slice(6);
          
          let parsedData;
          try {
            parsedData = JSON.parse(jsonStr);
          } catch (e) {
            continue;
          }

          // Handle backend errors sent through the stream safely
          if (parsedData.error) {
            throw new Error(parsedData.error);
          }
          
          // Handle clean stream completion
          if (parsedData.done) {
            break;
          }
          
          // Pass the live generated text chunk to the UI callback
          if (parsedData.chunk) {
            onChunk(parsedData.chunk);
          }
        }
      }
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to stream the response.');
  }
};
