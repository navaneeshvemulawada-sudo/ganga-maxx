import { apiCall } from './api';

/**
 * Customer management client services calling Express backend API routes.
 */
export const customerService = {
  /**
   * Retrieve all customers from backend.
   *
   * @returns {Promise<Array>} List of customer objects.
   */
  async getAll() {
    const data = await apiCall('/api/customers');
    
    return data.map(d => ({
      ...d,
      name: d.institution_name,
      company: d.contact_person,
      facility_type: d.institution_type,
      floors: d.number_of_floors,
      staff: d.staff_count
    }));
  },

  /**
   * Retrieve a specific customer profile.
   *
   * @param {number|string} id - Customer ID.
   * @returns {Promise<Object>} Customer object.
   */
  async getById(id) {
    const data = await apiCall(`/api/customers/${id}`);
    
    return {
      ...data,
      name: data.institution_name,
      company: data.contact_person,
      facility_type: data.institution_type,
      floors: data.number_of_floors,
      staff: data.staff_count
    };
  },

  /**
   * Create a new customer profile.
   *
   * @param {Object} customerData - Customer fields.
   * @returns {Promise<Object>} Created customer object.
   */
  async create(customerData) {
    const payload = {
      name: customerData.name || customerData.institution_name || 'N/A',
      facility_type: customerData.facility_type || customerData.institution_type || 'Corporate Office',
      company: customerData.company || customerData.contactName || customerData.contact_person || 'N/A',
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      floors: parseInt(customerData.floors || customerData.number_of_floors, 10) || 1,
      staff: parseInt(customerData.staff || customerData.staff_count, 10) || 0,
      cleaning_frequency: customerData.cleaning_frequency
    };

    const data = await apiCall('/api/customers', {
      method: 'POST',
      body: payload
    });
    
    return {
      ...data,
      name: data.institution_name,
      company: data.contact_person,
      facility_type: data.institution_type,
      floors: data.number_of_floors,
      staff: data.staff_count
    };
  },

  /**
   * Update an existing customer profile.
   *
   * @param {number|string} id - Customer ID.
   * @param {Object} customerData - Updated fields.
   * @returns {Promise<Object>} Updated customer object.
   */
  async update(id, customerData) {
    const payload = {
      name: customerData.name,
      facility_type: customerData.facility_type,
      company: customerData.company || customerData.contact_person,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      floors: parseInt(customerData.floors || customerData.number_of_floors, 10) || undefined,
      staff: parseInt(customerData.staff || customerData.staff_count, 10) || undefined,
      cleaning_frequency: customerData.cleaning_frequency
    };

    // Clean undefined values
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    const data = await apiCall(`/api/customers/${id}`, {
      method: 'PUT',
      body: payload
    });
    
    return {
      ...data,
      name: data.institution_name,
      company: data.contact_person,
      facility_type: data.institution_type,
      floors: data.number_of_floors,
      staff: data.staff_count
    };
  },

  /**
   * Delete a customer profile.
   *
   * @param {number|string} id - Customer ID.
   * @returns {Promise<Object>} Confirmation response.
   */
  async delete(id) {
    await apiCall(`/api/customers/${id}`, {
      method: 'DELETE'
    });
    return { message: 'Customer deleted successfully' };
  }
};

export default customerService;
