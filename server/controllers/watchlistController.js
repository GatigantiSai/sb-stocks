const Watchlist = require('../models/Watchlist');
const Stock = require('../models/Stock');

// @desc    Get user watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    let watchlist = await Watchlist.findOne({ user: req.user._id }).populate('stocks');
    
    if (!watchlist) {
      watchlist = await Watchlist.create({ user: req.user._id, stocks: [] });
    }

    return res.json({
      success: true,
      data: watchlist.stocks
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add stock to watchlist
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = async (req, res) => {
  try {
    const { stockId } = req.body;

    if (!stockId) {
      return res.status(400).json({ success: false, message: 'Stock ID is required' });
    }

    const stock = await Stock.findById(stockId);
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    let watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) {
      watchlist = await Watchlist.create({ user: req.user._id, stocks: [] });
    }

    // Check if stock already in watchlist
    if (watchlist.stocks.includes(stockId)) {
      return res.status(400).json({ success: false, message: 'Stock already in watchlist' });
    }

    watchlist.stocks.push(stockId);
    await watchlist.save();

    // Populate and return watchlist
    const updatedWatchlist = await Watchlist.findOne({ user: req.user._id }).populate('stocks');

    return res.json({
      success: true,
      message: `${stock.symbol} added to watchlist`,
      data: updatedWatchlist.stocks
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Remove stock from watchlist
// @route   DELETE /api/watchlist/:stockId
// @access  Private
const removeFromWatchlist = async (req, res) => {
  try {
    const { stockId } = req.params;

    let watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) {
      return res.status(444).json({ success: false, message: 'Watchlist not found' });
    }

    // Remove from array
    watchlist.stocks = watchlist.stocks.filter(
      (id) => id.toString() !== stockId
    );

    await watchlist.save();

    // Populate and return watchlist
    const updatedWatchlist = await Watchlist.findOne({ user: req.user._id }).populate('stocks');

    return res.json({
      success: true,
      message: 'Stock removed from watchlist',
      data: updatedWatchlist.stocks
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
};
