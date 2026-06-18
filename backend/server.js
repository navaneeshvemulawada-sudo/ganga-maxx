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

    // Create users table
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(80) NOT NULL UNIQUE,
        email VARCHAR(120) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' NOT NULL,
        is_approved TINYINT(1) DEFAULT 1 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    console.log('[Database] Checking/creating users table schema...');
    await connection.query(createUsersTableQuery);
    console.log('[Database] Table "users" is verified and ready.');

    // Check if we need to seed users
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('[Database] Seeding default users...');
      const crypto = require('crypto');
      function hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return `${salt}:${hash}`;
      }
      
      const usersToSeed = [
        { username: 'client', email: 'client@cleanbundle.ai', role: 'client', password: 'Demo@1234' },
        { username: 'operations', email: 'operations@cleanbundle.ai', role: 'operations', password: 'Demo@1234' },
        { username: 'supervisor', email: 'supervisor@cleanbundle.ai', role: 'supervisor', password: 'Demo@1234' },
        { username: 'distributor', email: 'distributor@cleanbundle.ai', role: 'distributor', password: 'Demo@1234' },
        { username: 'admin', email: 'demo@cleanbundle.ai', role: 'admin', password: 'Demo@1234' }
      ];
      
      for (const u of usersToSeed) {
        const passHash = hashPassword(u.password);
        await connection.query(
          'INSERT INTO users (username, email, password_hash, role, is_approved) VALUES (?, ?, ?, ?, 1)',
          [u.username, u.email, passHash, u.role]
        );
      }
      console.log('[Database] Default users seeded successfully.');
    }

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
