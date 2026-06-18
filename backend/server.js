const app = require('./app');
const db = require('./config/database');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Validates connectivity to the PostgreSQL database on startup.
 * Terminating the process if database is unreachable.
 */
async function validateDatabaseConnection() {
  try {
    console.log('[Database] Connecting to PostgreSQL database...');
    // Execute lightweight SELECT 1 query to confirm pg client pool connection is live
    await db.query('SELECT 1');
    console.log('[Database] Connection to PostgreSQL established successfully.');
  } catch (error) {
    console.error('[Database Error] Failed to connect to PostgreSQL database:', error.message);
    console.error('[Database Error] Verify that the DATABASE_URL environment variable is correct and database is active.');
    // Exit application if database startup check fails
    process.exit(1);
  }
}

// Perform database validation check, then start listening on port
validateDatabaseConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] Express application server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
  });
});
