const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Route mapping for customer CRUD
router.get('/', customerController.listCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
