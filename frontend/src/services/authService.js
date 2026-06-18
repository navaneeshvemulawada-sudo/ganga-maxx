import { apiCall } from './api';

/**
 * Authentication client services.
 */
export const authService = {
  /**
   * Register a new user profile.
   *
   * @param {string} fullName - User full name.
   * @param {string} email - Chosen email.
   * @param {string} password - User password.
   * @param {string} [role='client'] - Access level/role.
   * @returns {Promise<any>} Response json from backend.
   */
  async register(fullName, email, password, role = 'client') {
    return apiCall('/api/auth/register', {
      method: 'POST',
      body: { full_name: fullName, email, password, role }
    });
  },

  /**
   * Log in user and persist credentials in localStorage.
   *
   * @param {string} email - User email.
   * @param {string} password - Password.
   * @returns {Promise<any>} User details and authentication JWT token.
   */
  async login(email, password) {
    const data = await apiCall('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  /**
   * Clean stored credentials from localStorage and dispatch logout event.
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-logout'));
  },

  /**
   * Retrieve active local user profile.
   *
   * @returns {Object|null} User model or null.
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Determine if user is logged in locally.
   *
   * @returns {boolean} True if JWT token is stored.
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

export default authService;
