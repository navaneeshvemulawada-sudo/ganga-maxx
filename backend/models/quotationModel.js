const db = require('../config/db');

const QuotationModel = {
  /**
   * Generates the next quote ID (e.g. QT001, QT002, ...)
   * Assumes it's being executed within an active transaction with a connection.
   */
  async generateNextQuoteId(connection) {
    // Select the latest quote_id and lock the row to prevent concurrent duplicate generation
    const [rows] = await connection.query(
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
   */
  async create(data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Automatically generate sequential quote_id inside transaction
      const quote_id = await this.generateNextQuoteId(connection);
      
      const query = `
        INSERT INTO quotations (
          quote_id, customer_name, company_name, email, phone, 
          institution_type, floors, staff_count, cleaning_frequency, 
          monthly_cost, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

      await connection.query(query, values);
      await connection.commit();
      
      return quote_id;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = QuotationModel;
