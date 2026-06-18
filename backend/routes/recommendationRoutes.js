const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Route mapping for generating AI recommendations
router.post('/', recommendationController.getRecommendations);

module.exports = router;
