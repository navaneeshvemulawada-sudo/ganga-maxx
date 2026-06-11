import { apiCall } from './api';

/**
 * Quotation management client services.
 */
export const quotationService = {
  /**
   * Retrieve all quotations from backend.
   *
   * @returns {Promise<Array>} List of quotation objects.
   */
  async getAll() {
    return apiCall('/api/quotations', {
      method: 'GET'
    });
  },

  /**
   * Retrieve a specific quotation.
   *
   * @param {number|string} id - Quotation ID.
   * @returns {Promise<Object>} Quotation object with lines list.
   */
  async getById(id) {
    return apiCall(`/api/quotations/${id}`, {
      method: 'GET'
    });
  },

  /**
   * Create a new quotation.
   *
   * @param {Object} quotationData - Quotation fields (customer_id, tax_rate, discount, valid_days, items).
   * @returns {Promise<Object>} Created quotation object.
   */
  async create(quotationData) {
    return apiCall('/api/quotations', {
      method: 'POST',
      body: quotationData
    });
  },

  /**
   * Update an existing quotation.
   *
   * @param {number|string} id - Quotation ID.
   * @param {Object} quotationData - Updated fields (status, items, tax_rate, discount).
   * @returns {Promise<Object>} Updated quotation object.
   */
  async update(id, quotationData) {
    return apiCall(`/api/quotations/${id}`, {
      method: 'PUT',
      body: quotationData
    });
  },

  /**
   * Delete a quotation.
   *
   * @param {number|string} id - Quotation ID.
   * @returns {Promise<Object>} Confirmation response from backend.
   */
  async delete(id) {
    return apiCall(`/api/quotations/${id}`, {
      method: 'DELETE'
    });
  }
};

export default quotationService;
