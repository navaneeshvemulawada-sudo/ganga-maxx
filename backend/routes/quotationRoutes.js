const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');

// Route mapping for creating a quotation
router.post('/create', quotationController.createQuotation);

module.exports = router;
