const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/users', authController.listUsers);
router.put('/users/:id/approve', authController.approveUser);

module.exports = router;
