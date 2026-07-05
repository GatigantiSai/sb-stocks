const express = require('express');
const router = express.Router();
const {
  getStocks,
  getStockBySymbol,
  getTopGainers,
  getTopLosers,
  getSectors
} = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');

// All stock actions require an authenticated user
router.use(protect);

router.get('/', getStocks);
router.get('/market/gainers', getTopGainers);
router.get('/market/losers', getTopLosers);
router.get('/market/sectors', getSectors);
router.get('/:symbol', getStockBySymbol);

module.exports = router;
