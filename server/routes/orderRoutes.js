const express = require('express');
const router = express.Router();
const { buyStock, sellStock } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/buy', buyStock);
router.post('/sell', sellStock);

module.exports = router;
