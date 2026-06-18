const db = require('../config/database');

const QuotationModel = {
  /**
   * Generates the next quote ID (e.g. QT001, QT002, ...)
   * Assumes it's being executed within an active transaction with a client.
   * 
   * @param {Object} client - pg pool client
   */
  async generateNextQuoteId(client) {
    // Select the latest quote_id and lock the row to prevent concurrent duplicate generation
    const { rows } = await client.query(
      'SELECT quote_id FROM quotations ORDER BY id DESC LIMIT 1 FOR UPDATE'
    );

    if (rows.length === 0) {
      return 'QT001';
    }

    const lastQuoteId = rows[0].quote_id;
    const match = lastQuoteId.match(/^QT(\d+)$/);
    
    if (!match) {
      return 'QT001';
    }

    const lastNum = parseInt(match[1], 10);
    const nextNum = lastNum + 1;
    const paddedNum = String(nextNum).padStart(3, '0');
    return `QT${paddedNum}`;
  },

  /**
   * Creates a new quotation record using a database transaction
   * 
   * @param {Object} data - Quotation schema data
   */
  async create(data) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Automatically generate sequential quote_id inside transaction
      const quote_id = await this.generateNextQuoteId(client);
      
      const query = `
        INSERT INTO quotations (
          quote_id, customer_name, company_name, email, phone, 
          institution_type, floors, staff_count, cleaning_frequency, 
          monthly_cost, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      
      const values = [
        quote_id,
        data.customer_name,
        data.company_name || null,
        data.email,
        data.phone || null,
        data.institution_type,
        data.floors !== undefined ? data.floors : null,
        data.staff_count !== undefined ? data.staff_count : null,
        data.cleaning_frequency,
        data.monthly_cost,
        data.status || 'Generated'
      ];

      await client.query(query, values);
      await client.query('COMMIT');
      
      return quote_id;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = QuotationModel;
