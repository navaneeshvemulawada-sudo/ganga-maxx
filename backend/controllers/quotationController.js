const QuotationModel = require('../models/quotationModel');
const WebhookService = require('../services/webhookService');

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
        status: 'Generated'
      };

      // 5. Save quotation to MySQL database (triggers transaction & auto-id generation)
      const quote_id = await QuotationModel.create(quotationData);
      
      // Update object with generated quote_id
      quotationData.quote_id = quote_id;

      // 6. Trigger webhook asynchronously
      WebhookService.triggerQuotationCreated(quotationData).catch(err => {
        console.error('[Webhook Async Error] Error triggering n8n webhook:', err);
      });

      // 7. Send Response
      return res.status(201).json({
        success: true,
        message: 'Quotation created successfully',
        quote_id: quote_id
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
   * Retrieves all quotations
   */
  async listQuotations(req, res) {
    try {
      const db = require('../config/db');
      const [rows] = await db.query('SELECT * FROM quotations ORDER BY id DESC');
      // Map and format response to align with model schemas if needed
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
   * Retrieves a single quotation by ID or quote_id
   */
  async getQuotationById(req, res) {
    try {
      const db = require('../config/db');
      const { id } = req.params;
      
      let query = 'SELECT * FROM quotations WHERE quote_id = ? LIMIT 1';
      let params = [id];

      if (/^\d+$/.test(String(id))) {
        query = 'SELECT * FROM quotations WHERE id = ? LIMIT 1';
        params = [parseInt(id, 10)];
      }

      const [rows] = await db.query(query, params);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Quotation not found'
        });
      }

      return res.status(200).json(rows[0]);
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
      const db = require('../config/db');
      const { id, quote_id, status } = req.body;
      
      const targetId = id || quote_id;
      const targetStatus = status;

      if (!targetId || !targetStatus) {
        return res.status(400).json({
          success: false,
          error: 'Both id/quote_id and status are required'
        });
      }

      // Check if quotation exists safely without type coercion errors
      let checkQuery = 'SELECT * FROM quotations WHERE quote_id = ? LIMIT 1';
      let checkParams = [targetId];

      if (/^\d+$/.test(String(targetId))) {
        checkQuery = 'SELECT * FROM quotations WHERE id = ? LIMIT 1';
        checkParams = [parseInt(targetId, 10)];
      }

      const [checkRows] = await db.query(checkQuery, checkParams);

      if (checkRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Quotation not found'
        });
      }

      // Update quotation status in database safely
      let updateQuery = 'UPDATE quotations SET status = ? WHERE quote_id = ?';
      let updateParams = [targetStatus, targetId];

      if (/^\d+$/.test(String(targetId))) {
        updateQuery = 'UPDATE quotations SET status = ? WHERE id = ?';
        updateParams = [targetStatus, parseInt(targetId, 10)];
      }

      await db.query(updateQuery, updateParams);

      return res.status(200).json({
        success: true,
        message: `Quotation status updated successfully to ${targetStatus}`,
        quote_id: checkRows[0].quote_id,
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
