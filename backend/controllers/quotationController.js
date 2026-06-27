const QuotationModel = require('../models/quotationModel');
const db = require('../config/database');

// Define pricing rules
const pricingRules = {
  hospital: {
    daily: 15000,
    weekly: 7000
  },
  school: {
    daily: 12000,
    weekly: 5000
  },
  office: {
    daily: 10000,
    weekly: 4000
  }
};

/**
 * Calculates monthly cost based on institution type and frequency
 * @param {string} institutionType - hospital, school, or office
 * @param {string} cleaningFrequency - daily or weekly
 * @returns {number|null} Calculated cost or null if invalid inputs
 */
function calculateMonthlyCost(institutionType, cleaningFrequency) {
  const type = institutionType.toLowerCase().trim();
  const freq = cleaningFrequency.toLowerCase().trim();

  if (pricingRules[type] && pricingRules[type][freq]) {
    return pricingRules[type][freq];
  }
  return null;
}

/**
 * Helper to extract user ID (sub) from JWT in Authorization header
 * @param {string} authHeader - The Authorization header value
 * @returns {number|null} User ID or null if not found/invalid
 */
function getUserIdFromAuthHeader(authHeader) {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  const token = parts[1];
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf-8'));
    if (payload && payload.sub && payload.exp > Math.floor(Date.now() / 1000)) {
      return parseInt(payload.sub, 10);
    }
  } catch (e) {
    console.warn('[JWT Auth Extraction Warning] Failed to parse auth token:', e.message);
  }
  return null;
}

const quotationController = {
  /**
   * Handles creating a new quotation
   */
  async createQuotation(req, res) {
    try {
      const {
        customer_name,
        company_name,
        email,
        phone,
        institution_type,
        floors,
        staff_count,
        cleaning_frequency
      } = req.body;

      const errors = [];

      // 1. Validation checks
      if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
        errors.push('customer_name is required and must be a valid string');
      }

      if (!email || typeof email !== 'string' || !email.trim()) {
        errors.push('email is required');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          errors.push('valid email format is required');
        }
      }

      if (!institution_type || typeof institution_type !== 'string' || !institution_type.trim()) {
        errors.push('institution_type is required');
      } else {
        const normalizedType = institution_type.trim().toLowerCase();
        if (!['hospital', 'school', 'office'].includes(normalizedType)) {
          errors.push('institution_type must be one of: Hospital, School, Office');
        }
      }

      if (!cleaning_frequency || typeof cleaning_frequency !== 'string' || !cleaning_frequency.trim()) {
        errors.push('cleaning_frequency is required');
      } else {
        const normalizedFreq = cleaning_frequency.trim().toLowerCase();
        if (!['daily', 'weekly'].includes(normalizedFreq)) {
          errors.push('cleaning_frequency must be one of: Daily, Weekly');
        }
      }

      // If validation fails, return 400 Bad Request
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors: errors
        });
      }

      // 2. Normalize casing for database storage
      const normType = institution_type.trim().toLowerCase();
      const normFreq = cleaning_frequency.trim().toLowerCase();

      const formattedInstitutionType = normType.charAt(0).toUpperCase() + normType.slice(1);
      const formattedCleaningFrequency = normFreq.charAt(0).toUpperCase() + normFreq.slice(1);

      // 3. Calculate Monthly Cost
      const monthly_cost = calculateMonthlyCost(normType, normFreq);
      if (monthly_cost === null) {
        return res.status(400).json({
          success: false,
          message: 'Unable to calculate cost based on provided parameters.'
        });
      }

      // Extract generated_by from auth token if present
      const generated_by = getUserIdFromAuthHeader(req.headers.authorization);

      // 4. Prepare data for model insertion
      const quotationData = {
        customer_name: customer_name.trim(),
        company_name: company_name ? company_name.trim() : null,
        email: email.trim(),
        phone: phone ? phone.trim() : null,
        institution_type: formattedInstitutionType,
        floors: floors !== undefined && floors !== null ? parseInt(floors, 10) : null,
        staff_count: staff_count !== undefined && staff_count !== null ? parseInt(staff_count, 10) : null,
        cleaning_frequency: formattedCleaningFrequency,
        monthly_cost: monthly_cost,
        status: 'Generated',
        generated_by: generated_by
      };

      // 5. Save quotation to PostgreSQL database (triggers transaction & auto-id/customer generation)
      const { id, quotation_number } = await QuotationModel.create(quotationData);
      
      // Update object with generated keys for webhook trigger
      quotationData.id = id;
      quotationData.quotation_number = quotation_number;
      quotationData.quote_id = quotation_number; // fallback for webhook / compatibility



      // 7. Send Response
      return res.status(201).json({
        success: true,
        message: 'Quotation created successfully',
        id: id,
        quotation_number: quotation_number,
        quote_id: quotation_number // fallback for backward compatibility
      });

    } catch (error) {
      console.error('[Controller Error] Error in createQuotation:', error);
      return res.status(500).json({
        success: false,
        message: 'An internal server error occurred',
        error: error.message
      });
    }
  },

  /**
   * Retrieves all quotations with customer information joined
   */
  async listQuotations(req, res) {
    try {
      const queryText = `
        SELECT 
          q.id,
          q.quotation_number,
          q.quotation_number AS quote_id,
          q.customer_id,
          q.generated_by,
          q.monthly_cost,
          q.total_cost,
          q.status,
          q.ai_summary,
          q.created_at,
          q.updated_at,
          c.contact_person AS customer_name,
          c.institution_name AS company_name,
          c.email,
          c.phone,
          c.institution_type,
          c.number_of_floors AS floors,
          c.staff_count,
          c.cleaning_frequency
        FROM quotations q
        LEFT JOIN customers c ON q.customer_id = c.id
        ORDER BY q.id DESC
      `;
      const { rows } = await db.query(queryText);
      return res.status(200).json(rows);
    } catch (error) {
      console.error('[Controller Error] Error in listQuotations:', error);
      return res.status(500).json({
        success: false,
        message: 'An internal server error occurred',
        error: error.message
      });
    }
  },

  /**
   * Retrieves a single quotation by ID or quotation_number, with customer and items info
   */
  async getQuotationById(req, res) {
    try {
      const { id } = req.params;
      
      let queryText = `
        SELECT 
          q.id,
          q.quotation_number,
          q.quotation_number AS quote_id,
          q.customer_id,
          q.generated_by,
          q.monthly_cost,
          q.total_cost,
          q.status,
          q.ai_summary,
          q.created_at,
          q.updated_at,
          c.contact_person AS customer_name,
          c.institution_name AS company_name,
          c.email,
          c.phone,
          c.institution_type,
          c.number_of_floors AS floors,
          c.staff_count,
          c.cleaning_frequency
        FROM quotations q
        LEFT JOIN customers c ON q.customer_id = c.id
        WHERE q.quotation_number = $1
        LIMIT 1
      `;
      let params = [id];

      // Check if the id parameter is a numeric database primary key
      if (/^\d+$/.test(String(id))) {
        queryText = `
          SELECT 
            q.id,
            q.quotation_number,
            q.quotation_number AS quote_id,
            q.customer_id,
            q.generated_by,
            q.monthly_cost,
            q.total_cost,
            q.status,
            q.ai_summary,
            q.created_at,
            q.updated_at,
            c.contact_person AS customer_name,
            c.institution_name AS company_name,
            c.email,
            c.phone,
            c.institution_type,
            c.number_of_floors AS floors,
            c.staff_count,
            c.cleaning_frequency
          FROM quotations q
          LEFT JOIN customers c ON q.customer_id = c.id
          WHERE q.id = $1
          LIMIT 1
        `;
        params = [parseInt(id, 10)];
      }

      const { rows } = await db.query(queryText, params);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Quotation not found'
        });
      }

      const quotation = rows[0];

      // Query associated quotation_items
      const itemsQuery = `
        SELECT 
          qi.id,
          qi.quotation_id,
          qi.product_id,
          qi.quantity,
          qi.unit_price,
          qi.total_price,
          p.product_name,
          p.sku
        FROM quotation_items qi
        LEFT JOIN products p ON qi.product_id = p.id
        WHERE qi.quotation_id = $1
      `;
      const { rows: itemRows } = await db.query(itemsQuery, [quotation.id]);
      quotation.items = itemRows;

      return res.status(200).json(quotation);
    } catch (error) {
      console.error('[Controller Error] Error in getQuotationById:', error);
      return res.status(500).json({
        success: false,
        message: 'An internal server error occurred',
        error: error.message
      });
    }
  },



  /**
   * Processes a quotation status (updates status)
   */
  async processQuotation(req, res) {
    try {
      const { id, quote_id, quotation_number, status } = req.body;
      
      const targetId = id || quotation_number || quote_id;
      const targetStatus = status;

      if (!targetId || !targetStatus) {
        return res.status(400).json({
          success: false,
          error: 'Both id/quotation_number/quote_id and status are required'
        });
      }

      // Check if quotation exists
      let checkQuery = 'SELECT * FROM quotations WHERE quotation_number = $1 LIMIT 1';
      let checkParams = [targetId];

      if (/^\d+$/.test(String(targetId))) {
        checkQuery = 'SELECT * FROM quotations WHERE id = $1 LIMIT 1';
        checkParams = [parseInt(targetId, 10)];
      }

      const { rows: checkRows } = await db.query(checkQuery, checkParams);

      if (checkRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Quotation not found'
        });
      }

      const quotation = checkRows[0];

      // Update quotation status in database
      let updateQuery = 'UPDATE quotations SET status = $1 WHERE quotation_number = $2';
      let updateParams = [targetStatus, quotation.quotation_number];

      await db.query(updateQuery, updateParams);

      return res.status(200).json({
        success: true,
        message: `Quotation status updated successfully to ${targetStatus}`,
        quotation_number: quotation.quotation_number,
        quote_id: quotation.quotation_number, // fallback for compatibility
        status: targetStatus
      });
    } catch (error) {
      console.error('[Controller Error] Error in processQuotation:', error);
      return res.status(500).json({
        success: false,
        message: 'An internal server error occurred',
        error: error.message
      });
    }
  }
};

module.exports = quotationController;
