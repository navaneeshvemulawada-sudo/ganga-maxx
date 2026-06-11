import { apiCall } from './api';

/**
 * Customer management client services.
 */
export const customerService = {
  /**
   * Retrieve all customers from backend.
   *
   * @returns {Promise<Array>} List of customer objects.
   */
  async getAll() {
    return apiCall('/api/customers', {
      method: 'GET'
    });
  },

  /**
   * Retrieve a specific customer profile.
   *
   * @param {number|string} id - Customer ID.
   * @returns {Promise<Object>} Customer object.
   */
  async getById(id) {
    return apiCall(`/api/customers/${id}`, {
      method: 'GET'
    });
  },

  /**
   * Create a new customer profile.
   *
   * @param {Object} customerData - Customer fields (name, email, phone, company, address).
   * @returns {Promise<Object>} Created customer object.
   */
  async create(customerData) {
    return apiCall('/api/customers', {
      method: 'POST',
      body: customerData
    });
  },

  /**
   * Update an existing customer profile.
   *
   * @param {number|string} id - Customer ID.
   * @param {Object} customerData - Updated fields.
   * @returns {Promise<Object>} Updated customer object.
   */
  async update(id, customerData) {
    return apiCall(`/api/customers/${id}`, {
      method: 'PUT',
      body: customerData
    });
  },

  /**
   * Delete a customer profile.
   *
   * @param {number|string} id - Customer ID.
   * @returns {Promise<Object>} Confirmation response from backend.
   */
  async delete(id) {
    return apiCall(`/api/customers/${id}`, {
      method: 'DELETE'
    });
  }
};

export default customerService;
