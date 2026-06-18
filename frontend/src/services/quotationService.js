import { supabase } from '../supabaseClient';

/**
 * Quotation management client services using Supabase database.
 */
export const quotationService = {
  /**
   * Retrieve all quotations from Supabase.
   *
   * @returns {Promise<Array>} List of quotation objects.
   */
  async getAll() {
    const { data, error } = await supabase
      .from('quotations')
      .select('*, customer:customers(institution_name, institution_type)')
      .order('id', { ascending: false });
    if (error) throw error;
    
    return data.map(q => ({
      ...q,
      customer_name: q.customer?.institution_name || 'N/A',
      customer_facility_type: q.customer?.institution_type || 'N/A'
    }));
  },

  /**
   * Retrieve a specific quotation by ID.
   *
   * @param {number|string} id - Quotation ID.
   * @returns {Promise<Object>} Quotation object with lines list.
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('quotations')
      .select('*, customer:customers(*), items:quotation_items(*, product:products(*))')
      .eq('id', id)
      .single();
    if (error) throw error;
    
    return {
      ...data,
      customer_name: data.customer?.institution_name || 'N/A',
      customer_facility_type: data.customer?.institution_type || 'N/A',
      notes: data.ai_summary || '',
      items: (data.items || []).map(item => ({
        id: item.id,
        product_name: item.product?.product_name || item.product_name || `Product #${item.product_id}`,
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
    const { customer_id, tax_rate = 18.0, discount = 0.0, items = [], status = 'Draft', notes = '' } = quotationData;

    // 1. Calculate monthly_cost (subtotal of items) and total_cost (with tax and discount)
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = subtotal * (tax_rate / 100);
    const totalCost = subtotal + taxAmount - discount;

    const quotationNumber = `QTN-2026-${Math.floor(Math.random() * 90000) + 10000}`;

    // 2. Fetch logged in user id from public.users mapping or default to null
    let generatedBy = null;
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
          generatedBy = userData.id;
        }
      } catch (e) {
        console.error('Error fetching generated_by user:', e);
      }
    }

    // 3. Insert into quotations
    const { data: quote, error: quoteError } = await supabase
      .from('quotations')
      .insert([{
        quotation_number: quotationNumber,
        customer_id: customer_id,
        generated_by: generatedBy,
        monthly_cost: subtotal,
        total_cost: totalCost,
        status: status,
        ai_summary: notes
      }])
      .select()
      .single();

    if (quoteError) throw quoteError;

    // 4. Look up product IDs from product names
    const productNames = items.map(item => item.product_name);
    const { data: products } = await supabase
      .from('products')
      .select('id, product_name')
      .in('product_name', productNames);

    const productMap = {};
    if (products) {
      products.forEach(p => {
        productMap[p.product_name] = p.id;
      });
    }

    // 5. Insert quotation items
    const itemsPayload = items.map(item => ({
      quotation_id: quote.id,
      product_id: productMap[item.product_name] || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(itemsPayload);

    if (itemsError) throw itemsError;

    return {
      ...quote,
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
    const { status, tax_rate = 18.0, discount = 0.0, items = [], notes } = quotationData;

    const updatePayload = {};
    if (status) updatePayload.status = status;
    if (notes !== undefined) updatePayload.ai_summary = notes;

    if (items.length > 0) {
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const taxAmount = subtotal * (tax_rate / 100);
      updatePayload.monthly_cost = subtotal;
      updatePayload.total_cost = subtotal + taxAmount - discount;
    }

    const { data: quote, error: quoteError } = await supabase
      .from('quotations')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (quoteError) throw quoteError;

    if (items.length > 0) {
      // Delete existing items
      const { error: deleteError } = await supabase
        .from('quotation_items')
        .delete()
        .eq('quotation_id', id);
        
      if (deleteError) throw deleteError;

      // Look up product IDs from product names
      const productNames = items.map(item => item.product_name);
      const { data: products } = await supabase
        .from('products')
        .select('id, product_name')
        .in('product_name', productNames);

      const productMap = {};
      if (products) {
        products.forEach(p => {
          productMap[p.product_name] = p.id;
        });
      }

      // Insert new items
      const itemsPayload = items.map(item => ({
        quotation_id: id,
        product_id: productMap[item.product_name] || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(itemsPayload);

      if (itemsError) throw itemsError;
    }

    return quote;
  },

  /**
   * Delete a quotation.
   *
   * @param {number|string} id - Quotation ID.
   * @returns {Promise<Object>} Confirmation response.
   */
  async delete(id) {
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Quotation deleted successfully' };
  }
};

export default quotationService;
