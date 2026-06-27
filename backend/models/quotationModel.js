const db = require('../config/database');

/**
 * Validate numeric fields to prevent NaN or invalid types from reaching PostgreSQL.
 */
function validateNumeric(value, fieldName, nullable = true) {
  if (value === undefined || value === null || value === '') {
    if (nullable) return null;
    throw new Error(`Invalid numeric value for ${fieldName}: value is required and cannot be empty`);
  }
  const parsed = parseFloat(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric value for ${fieldName}: got NaN`);
  }
  return parsed;
}

const QuotationModel = {
  /**
   * Generates the next quotation number (e.g. QTN-2026-1001, QTN-2026-1002, ...)
   * Assumes it's being executed within an active transaction with a client.
   * 
   * @param {Object} client - pg pool client
   */
  async generateNextQuotationNumber(client) {
    const currentYear = new Date().getFullYear();
    const prefix = `QTN-${currentYear}-`;
    
    // Select the latest quotation_number for this year and lock it to prevent concurrent duplicates
    const { rows } = await client.query(
      'SELECT quotation_number FROM quotations WHERE quotation_number LIKE $1 ORDER BY id DESC LIMIT 1 FOR UPDATE',
      [`${prefix}%`]
    );

    if (rows.length === 0) {
      return `${prefix}1001`;
    }

    const lastQuotationNumber = rows[0].quotation_number;
    const suffixStr = lastQuotationNumber.slice(prefix.length);
    const lastNum = parseInt(suffixStr, 10);
    
    if (isNaN(lastNum)) {
      return `${prefix}1001`;
    }

    const nextNum = lastNum + 1;
    return `${prefix}${nextNum}`;
  },

  /**
   * Creates a new customer and quotation record using a database transaction
   * 
   * @param {Object} data - Quotation and Customer schema data combined
   */
  async create(data) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Validate input numeric fields before proceeding
      const floorsVal = validateNumeric(data.floors, 'floors');
      const staffCountVal = validateNumeric(data.staff_count, 'staff_count');
      const generatedByVal = validateNumeric(data.generated_by, 'generated_by');
      const monthlyCostVal = validateNumeric(data.monthly_cost, 'monthly_cost', false);
      const totalCostVal = validateNumeric(
        data.total_cost !== undefined && data.total_cost !== null ? data.total_cost : data.monthly_cost,
        'total_cost',
        false
      );

      // 1. Find or create customer record
      let customerId = null;
      
      if (data.email) {
        const { rows: customerRows } = await client.query(
          'SELECT id FROM customers WHERE email = $1 LIMIT 1',
          [data.email.trim()]
        );
        if (customerRows.length > 0) {
          customerId = customerRows[0].id;
        }
      }

      if (!customerId && data.company_name) {
        const { rows: customerRows } = await client.query(
          'SELECT id FROM customers WHERE institution_name = $1 LIMIT 1',
          [data.company_name.trim()]
        );
        if (customerRows.length > 0) {
          customerId = customerRows[0].id;
        }
      }

      if (!customerId) {
        // Create new customer
        const insertCustomerQuery = `
          INSERT INTO customers (
            institution_name, 
            institution_type, 
            contact_person, 
            email, 
            phone, 
            number_of_floors, 
            staff_count, 
            cleaning_frequency, 
            created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `;
        const customerValues = [
          (data.company_name && data.company_name.trim()) || (data.customer_name && data.customer_name.trim()) || 'Unnamed Institution',
          data.institution_type || 'Other',
          data.customer_name ? data.customer_name.trim() : null,
          data.email ? data.email.trim() : null,
          data.phone ? data.phone.trim() : null,
          floorsVal,
          staffCountVal,
          data.cleaning_frequency || null,
          generatedByVal
        ];
        
        // Log SQL query and payload before execution
        console.log('[SQL Execution Log] Inserting into customers table:', {
          query: insertCustomerQuery,
          values: customerValues
        });

        try {
          const { rows: insertRows } = await client.query(insertCustomerQuery, customerValues);
          customerId = insertRows[0].id;
        } catch (err) {
          console.error('[DB Customer Insert Error] Failed to create customer record:', {
            query: insertCustomerQuery,
            params: customerValues,
            message: err.message,
            detail: err.detail || null,
            table: err.table || null,
            column: err.column || null,
            constraint: err.constraint || null
          });
          throw err;
        }
      }

      // 2. Generate sequential quotation_number
      const quotation_number = await this.generateNextQuotationNumber(client);
      
      // 3. Insert quotation into quotations table
      const insertQuotationQuery = `
        INSERT INTO quotations (
          quotation_number, 
          customer_id, 
          generated_by, 
          monthly_cost, 
          total_cost, 
          status, 
          ai_summary
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      
      const quotationValues = [
        quotation_number,
        customerId,
        generatedByVal,
        monthlyCostVal,
        totalCostVal,
        data.status || 'Generated',
        data.ai_summary || null
      ];

      // Log SQL query and payload before execution
      console.log('[SQL Execution Log] Inserting into quotations table:', {
        query: insertQuotationQuery,
        values: quotationValues
      });

      let newQuotationId;
      try {
        const { rows: insertQuoteRows } = await client.query(insertQuotationQuery, quotationValues);
        newQuotationId = insertQuoteRows[0].id;
      } catch (err) {
        console.error('[DB Quotation Insert Error] Failed to create quotation record:', {
          query: insertQuotationQuery,
          params: quotationValues,
          message: err.message,
          detail: err.detail || null,
          table: err.table || null,
          column: err.column || null,
          constraint: err.constraint || null
        });
        throw err;
      }

      // 4. Insert quotation items in transaction
      if (Array.isArray(data.items) && data.items.length > 0) {
        for (const item of data.items) {
          let productId = item.product_id;
          if (!productId && item.product_name) {
            const { rows: productRows } = await client.query(
              'SELECT id FROM products WHERE product_name = $1 LIMIT 1',
              [item.product_name.trim()]
            );
            if (productRows.length > 0) {
              productId = productRows[0].id;
            }
          }

          // Validate item numeric inputs
          const qtyVal = validateNumeric(item.quantity, 'item quantity', false);
          const priceVal = validateNumeric(item.unit_price, 'item unit_price', false);
          const totalVal = qtyVal * priceVal;

          const insertItemQuery = `
            INSERT INTO quotation_items (
              quotation_id,
              product_id,
              quantity,
              unit_price,
              total_price
            ) VALUES ($1, $2, $3, $4, $5)
          `;
          const itemValues = [
            newQuotationId,
            productId || null,
            qtyVal,
            priceVal,
            totalVal
          ];

          // Log SQL query and payload before execution
          console.log('[SQL Execution Log] Inserting into quotation_items table:', {
            query: insertItemQuery,
            values: itemValues
          });

          try {
            await client.query(insertItemQuery, itemValues);
          } catch (itemErr) {
            console.error('[DB Quotation Item Insert Error] Failed to create quotation item record:', {
              query: insertItemQuery,
              params: itemValues,
              message: itemErr.message
            });
            throw itemErr;
          }
        }
      }

      await client.query('COMMIT');
      
      return { id: newQuotationId, quotation_number };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[Database Transaction Error] Quotation creation failed:', {
        message: error.message,
        detail: error.detail || null,
        table: error.table || null,
        column: error.column || null,
        constraint: error.constraint || null
      });
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = QuotationModel;
