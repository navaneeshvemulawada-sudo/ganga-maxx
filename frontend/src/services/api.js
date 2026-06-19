import api from './axiosService';

/**
 * Standard HTTP Fetch Wrapper for Backend API communication.
 * Delegates to the shared Axios instance for centralized handling.
 *
 * @param {string} endpoint - The target API endpoint (e.g., '/api/customers').
 * @param {Object} options - Standard options overrides.
 * @returns {Promise<any>} Response JSON data.
 */
export async function apiCall(endpoint, options = {}) {
  const config = {
    url: endpoint,
    method: options.method || 'GET',
    headers: options.headers || {},
    data: options.body || undefined,
  };

  try {
    const response = await api(config);
    return response.data;
  } catch (error) {
    console.error('API client request failed:', error);
    
    if (error.response) {
      // If unauthorized, clear storage and notify app context
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-failed'));
      }
      throw new Error(error.response.data?.error || error.response.data?.message || `HTTP request failed with status: ${error.response.status}`);
    }
    throw error;
  }
}

export default {
  apiCall
};
