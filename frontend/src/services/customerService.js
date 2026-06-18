import { supabase } from '../supabaseClient';

/**
 * Customer management client services using Supabase database.
 */
export const customerService = {
  /**
   * Retrieve all customers from Supabase.
   *
   * @returns {Promise<Array>} List of customer objects.
   */
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('id', { ascending: false });
    if (error) throw error;
    
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
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    
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
    // Look up logged in user id from public.users mapping
    let createdBy = null;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', u.email)
          .single();
        if (userData) {
          createdBy = userData.id;
        }
      } catch (e) {
        console.error('Error fetching created_by user for customer:', e);
      }
    }

    const payload = {
      institution_name: customerData.name || customerData.institution_name || 'N/A',
      institution_type: customerData.facility_type || customerData.institution_type || 'Corporate Office',
      contact_person: customerData.company || customerData.contactName || customerData.contact_person || 'N/A',
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      number_of_floors: parseInt(customerData.floors || customerData.number_of_floors, 10) || 1,
      staff_count: parseInt(customerData.staff || customerData.staff_count, 10) || 0,
      cleaning_frequency: customerData.cleaning_frequency,
      created_by: createdBy
    };

    const { data, error } = await supabase
      .from('customers')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    
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
      institution_name: customerData.name,
      institution_type: customerData.facility_type,
      contact_person: customerData.company || customerData.contact_person,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      number_of_floors: parseInt(customerData.floors || customerData.number_of_floors, 10) || undefined,
      staff_count: parseInt(customerData.staff || customerData.staff_count, 10) || undefined,
      cleaning_frequency: customerData.cleaning_frequency
    };

    // Clean undefined values
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    const { data, error } = await supabase
      .from('customers')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    
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
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Customer deleted successfully' };
  }
};

export default customerService;
