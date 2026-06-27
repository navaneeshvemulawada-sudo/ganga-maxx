const db = require('../config/database');

/**
 * Helper to extract user ID from JWT in Authorization header
 */
function getUserIdFromAuthHeader(authHeader) {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
  const token = parts[1];
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf-8'));
    if (payload && payload.sub && payload.exp > Math.floor(Date.now() / 1000)) {
      return parseInt(payload.sub, 10);
    }
  } catch (e) {
    console.warn('[JWT Extraction Warning] Failed to parse auth token:', e.message);
  }
  return null;
}

const customerController = {
  /**
   * Retrieves all customers
   */
  async listCustomers(req, res) {
    try {
      const queryText = 'SELECT * FROM customers ORDER BY id DESC';
      const { rows } = await db.query(queryText);
      return res.status(200).json(rows);
    } catch (error) {
      console.error('[Customer Controller Error] listCustomers failed:', {
        message: error.message,
        detail: error.detail || null,
        table: error.table || null
      });
      return res.status(500).json({
        success: false,
        message: 'An error occurred while listing customers.',
        error: error.message
      });
    }
  },

  /**
   * Retrieves a single customer by ID
   */
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const queryText = 'SELECT * FROM customers WHERE id = $1 LIMIT 1';
      const { rows } = await db.query(queryText, [parseInt(id, 10)]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      return res.status(200).json(rows[0]);
    } catch (error) {
      console.error('[Customer Controller Error] getCustomerById failed:', {
        message: error.message,
        detail: error.detail || null,
        table: error.table || null
      });
      return res.status(500).json({
        success: false,
        message: 'An error occurred while retrieving the customer.',
        error: error.message
      });
    }
  },

  /**
   * Creates a new customer profile
   */
  async createCustomer(req, res) {
    try {
      const {
        name,
        facility_type,
        company,
        email,
        phone,
        address,
        floors,
        staff,
        area,
        health_score,
        tags,
        compliance,
        cleaning_frequency,
        num_washrooms,
        daily_visitors,
        preferred_schedule,
        current_supplier,
        monthly_budget
      } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error: Institution/Company Name is required'
        });
      }

      const created_by = getUserIdFromAuthHeader(req.headers.authorization);

      const insertQuery = `
        INSERT INTO customers (
          institution_name,
          institution_type,
          contact_person,
          email,
          phone,
          address,
          number_of_floors,
          staff_count,
          cleaning_frequency,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const values = [
        name.trim(),
        facility_type || 'Other',
        company ? company.trim() : null,
        email ? email.trim() : null,
        phone ? phone.trim() : null,
        address ? address.trim() : null,
        floors !== undefined && floors !== null ? parseInt(floors, 10) : null,
        staff !== undefined && staff !== null ? parseInt(staff, 10) : null,
        cleaning_frequency || null,
        created_by
      ];

      const { rows } = await db.query(insertQuery, values);
      return res.status(201).json(rows[0]);

    } catch (error) {
      console.error('[Customer Controller Error] createCustomer failed:', {
        message: error.message,
        detail: error.detail || null,
        table: error.table || null,
        constraint: error.constraint || null
      });
      return res.status(500).json({
        success: false,
        message: 'An error occurred while creating the customer.',
        error: error.message
      });
    }
  },

  /**
   * Updates an existing customer profile
   */
  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        facility_type,
        company,
        email,
        phone,
        address,
        floors,
        staff,
        cleaning_frequency
      } = req.body;

      // Build dynamic update query to prevent overwriting other fields with null
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        fields.push(`institution_name = $${paramCount++}`);
        values.push(name);
      }
      if (facility_type !== undefined) {
        fields.push(`institution_type = $${paramCount++}`);
        values.push(facility_type);
      }
      if (company !== undefined) {
        fields.push(`contact_person = $${paramCount++}`);
        values.push(company);
      }
      if (email !== undefined) {
        fields.push(`email = $${paramCount++}`);
        values.push(email);
      }
      if (phone !== undefined) {
        fields.push(`phone = $${paramCount++}`);
        values.push(phone);
      }
      if (address !== undefined) {
        fields.push(`address = $${paramCount++}`);
        values.push(address);
      }
      if (floors !== undefined) {
        fields.push(`number_of_floors = $${paramCount++}`);
        values.push(floors !== null ? parseInt(floors, 10) : null);
      }
      if (staff !== undefined) {
        fields.push(`staff_count = $${paramCount++}`);
        values.push(staff !== null ? parseInt(staff, 10) : null);
      }
      if (cleaning_frequency !== undefined) {
        fields.push(`cleaning_frequency = $${paramCount++}`);
        values.push(cleaning_frequency);
      }

      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error: No fields provided to update'
        });
      }

      values.push(parseInt(id, 10));
      const queryText = `
        UPDATE customers
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const { rows } = await db.query(queryText, values);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      return res.status(200).json(rows[0]);

    } catch (error) {
      console.error('[Customer Controller Error] updateCustomer failed:', {
        message: error.message,
        detail: error.detail || null,
        table: error.table || null
      });
      return res.status(500).json({
        success: false,
        message: 'An error occurred while updating the customer.',
        error: error.message
      });
    }
  },

  /**
   * Deletes a customer profile
   */
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      const queryText = 'DELETE FROM customers WHERE id = $1 RETURNING id';
      const { rows } = await db.query(queryText, [parseInt(id, 10)]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Customer deleted successfully'
      });

    } catch (error) {
      console.error('[Customer Controller Error] deleteCustomer failed:', {
        message: error.message,
        detail: error.detail || null,
        table: error.table || null
      });
      return res.status(500).json({
        success: false,
        message: 'An error occurred while deleting the customer.',
        error: error.message
      });
    }
  }
};

module.exports = customerController;
