const express = require('express');
const cors = require('cors');
const quotationRoutes = require('./routes/quotationRoutes');
const authRoutes = require('./routes/authRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON and form-urlencoded requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/quotation', quotationRoutes);
app.use('/api/recommend', recommendationRoutes);
app.use('/api/customers', customerRoutes);

// Base Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Ganga Maxx Node.js API backend is active'
  });
});

app.get('/health', async (req, res) => {
  try {
    const db = require('./config/database');
    await db.query('SELECT 1');
    res.json({
      status: 'online',
      database: 'connected'
    });
  } catch (error) {
    console.error('[Health Check Error] Database query failed:', error.message);
    res.status(500).json({
      status: 'online',
      database: 'disconnected'
    });
  }
});

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  // Catch invalid JSON syntax errors from express.json()
  if (err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body.',
      error: err.message
    });
  }

  console.error('[Unhandled Server Error]', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
