import { apiCall } from './api';

function mapFacilityType(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('health') || t.includes('hosp')) return 'Hospital';
  if (t.includes('educ') || t.includes('school')) return 'School';
  return 'Office';
}

function mapCleaningFrequency(freq) {
  const f = (freq || '').toLowerCase();
  if (f.includes('daily') || f.includes('hourly')) return 'Daily';
  return 'Weekly';
}

/**
 * Quotation management client services using the Express backend.
 */
export const quotationService = {
  /**
   * Retrieve all quotations from backend API.
   *
   * @returns {Promise<Array>} List of quotation objects.
   */
  async getAll() {
    const data = await apiCall('/api/quotations');
    return data.map(q => ({
      ...q,
      customer_name: q.company_name || q.customer_name || 'N/A',
      customer_facility_type: q.institution_type || 'N/A'
    }));
  },

  /**
   * Retrieve a specific quotation by ID.
   *
   * @param {number|string} id - Quotation ID or number.
   * @returns {Promise<Object>} Quotation object with lines list.
   */
  async getById(id) {
    const data = await apiCall(`/api/quotations/${id}`);
    return {
      ...data,
      customer_name: data.company_name || data.customer_name || 'N/A',
      customer_facility_type: data.institution_type || 'N/A',
      notes: data.ai_summary || '',
      items: (data.items || []).map(item => ({
        id: item.id,
        product_name: item.product_name || `Product #${item.product_id}`,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }))
    };
  },

  /**
   * Create a new quotation.
   *
   * @param {Object} quotationData - Quotation fields (customer_id, tax_rate, discount, items, notes).
   * @returns {Promise<Object>} Created quotation object.
   */
  async create(quotationData) {
    const { customer_id, items = [] } = quotationData;

    // 1. Fetch customer details from backend if customer_id is provided
    let customerDetails = {};
    if (customer_id) {
      try {
        const customer = await apiCall(`/api/customers/${customer_id}`);
        if (customer) {
          customerDetails = {
            customer_name: customer.contact_person,
            company_name: customer.institution_name,
            email: customer.email,
            phone: customer.phone,
            institution_type: customer.institution_type,
            floors: customer.number_of_floors,
            staff_count: customer.staff_count,
            cleaning_frequency: customer.cleaning_frequency
          };
        }
      } catch (err) {
        console.error('Error fetching customer details for quote payload:', err);
      }
    }

    const customer_name = quotationData.customer_name || customerDetails.customer_name || 'Unnamed Contact';
    const company_name = quotationData.company_name || customerDetails.company_name || 'Unnamed Institution';
    const email = quotationData.email || customerDetails.email || `customer-${Date.now()}@cleanbundle.ai`;
    const phone = quotationData.phone || customerDetails.phone || '';
    const institution_type = quotationData.institution_type || customerDetails.institution_type || 'Office';
    const floors = quotationData.floors !== undefined ? quotationData.floors : (customerDetails.floors !== undefined ? customerDetails.floors : 1);
    const staff_count = quotationData.staff_count !== undefined ? quotationData.staff_count : (customerDetails.staff_count !== undefined ? customerDetails.staff_count : 0);
    const cleaning_frequency = quotationData.cleaning_frequency || customerDetails.cleaning_frequency || 'Daily';

    // 2. Call backend API to create customer, generate quotation_number, quotation, and items in one transaction
    const response = await apiCall('/api/quotations', {
      method: 'POST',
      body: {
        customer_name,
        company_name,
        email,
        phone,
        institution_type: mapFacilityType(institution_type),
        floors: parseInt(floors, 10) || 1,
        staff_count: parseInt(staff_count, 10) || 0,
        cleaning_frequency: mapCleaningFrequency(cleaning_frequency),
        items: items
      }
    });

    return {
      id: response.id,
      quotation_number: response.quotation_number,
      ...response,
      items
    };
  },

  /**
   * Update an existing quotation.
   *
   * @param {number|string} id - Quotation ID.
   * @param {Object} quotationData - Updated fields.
   * @returns {Promise<Object>} Updated quotation.
   */
  async update(id, quotationData) {
    if (quotationData.status && Object.keys(quotationData).length === 1) {
      const response = await apiCall('/api/quotations/process', {
        method: 'POST',
        body: {
          id: id,
          status: quotationData.status
        }
      });
      return response;
    }

    // Call backend API for all updates (including status and notes/ai_summary)
    const response = await apiCall(`/api/quotations/${id}`, {
      method: 'PUT',
      body: {
        notes: quotationData.notes,
        status: quotationData.status
      }
    });
    return response;
  },

  /**
   * Delete a quotation.
   *
   * @param {number|string} id - Quotation ID.
   * @returns {Promise<Object>} Confirmation response.
   */
  async delete(id) {
    await apiCall(`/api/quotations/${id}`, {
      method: 'DELETE'
    });
    return { message: 'Quotation deleted successfully' };
  }
};

export default quotationService;
