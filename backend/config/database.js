const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[Database Error] DATABASE_URL environment variable is missing.');
  process.exit(1);
}

// Automatically configure SSL for production/remote environments (such as Render/Supabase)
const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
  max: 10, // Connection pool limit
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

// Log pool client errors gracefully
pool.on('error', (err) => {
  console.error('[Database Pool Error] Unexpected error on idle client:', err.message);
});

const db = {
  /**
   * Helper query method to execute parameterized SQL statements.
   * Returns pg query result object ({ rows, rowCount, fields }).
   * 
   * @param {string} text - SQL Query statement
   * @param {Array} params - Parameter values
   */
  async query(text, params) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Database Query] Executed in ${duration}ms`);
      }
      return res;
    } catch (error) {
      console.error('[Database Query Error] Failed to execute query:', error.message);
      throw error;
    }
  },
  
  // Expose the pool directly for client acquisitions (useful for transactions)
  pool
};

module.exports = db;
