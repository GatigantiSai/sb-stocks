const express = require('express');
const router = express.Router();
const { getPortfolioSummary } = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPortfolioSummary);

module.exports = router;
