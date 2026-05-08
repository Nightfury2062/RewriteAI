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
