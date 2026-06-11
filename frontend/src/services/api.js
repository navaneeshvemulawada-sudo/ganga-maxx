const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Standard HTTP Fetch Wrapper for Backend API communication.
 * Automatically injects the JWT token and handles JSON content types.
 *
 * @param {string} endpoint - The target API endpoint (e.g., '/api/customers').
 * @param {Object} options - Standard fetch options overrides.
 * @returns {Promise<any>} Response JSON data.
 */
export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Prepare default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Inject token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  // Convert body to JSON string if it is an object
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    // If unauthorized, clear storage and notify app context
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-failed'));
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP request failed with status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API client request failed:', error);
    throw error;
  }
}

export default {
  apiCall
};

