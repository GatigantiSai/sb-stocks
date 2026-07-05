const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getWatchlist)
  .post(addToWatchlist);

router.route('/:stockId')
  .delete(removeFromWatchlist);

module.exports = router;
