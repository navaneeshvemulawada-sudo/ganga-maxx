const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');

// Route mapping for creating a quotation
router.post('/create', quotationController.createQuotation);
router.post('/', quotationController.createQuotation);

// Route mapping for listing quotations
router.get('/list', quotationController.listQuotations);
router.get('/', quotationController.listQuotations);



// Route mapping for retrieving a specific quotation by ID or quote_id
router.get('/:id', quotationController.getQuotationById);

// Route mapping for updating quotation details
router.put('/:id', quotationController.updateQuotation);

// Route mapping for deleting a quotation
router.delete('/:id', quotationController.deleteQuotation);

// Route mapping for processing a quotation
router.post('/process', quotationController.processQuotation);

module.exports = router;
