const app = require('./app');
const db = require('./config/db');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Initializes the database structure by checking connectivity and creating the quotations table if it doesn't exist.
 */
async function initializeDatabase() {
  let connection;
  try {
    // Obtain connection from pool to verify configuration
    connection = await db.getConnection();
    console.log('[Database] Connection to MySQL pool established successfully.');

    // Table creation query
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS quotations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quote_id VARCHAR(50) NOT NULL UNIQUE,
        customer_name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        institution_type VARCHAR(100) NOT NULL,
        floors INT,
        staff_count INT,
        cleaning_frequency VARCHAR(100) NOT NULL,
        monthly_cost DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Generated',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    console.log('[Database] Checking/creating quotations table schema...');
    await connection.query(createTableQuery);
    console.log('[Database] Table "quotations" is verified and ready.');

  } catch (error) {
    console.error('[Database Error] Failed to initialize database connection or create tables:', error.message);
    console.error('[Database Error] Please ensure MySQL is running and that credentials in backend/.env are correct.');
    // Exit application if connection or migration fails
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Initialize database, then start listening on port
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] Express application server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
  });
});
