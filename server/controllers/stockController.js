const Stock = require('../models/Stock');

// Helper to fluctuate a single stock price slightly to simulate live market
const fluctuatePrice = async (stock) => {
  const now = new Date();
  
  // Only update if it hasn't been updated in the last 15 seconds to avoid excessive DB writes
  const lastUpdated = new Date(stock.updatedAt);
  if (now.getTime() - lastUpdated.getTime() < 15000) {
    return stock;
  }

  // Random change between -1.5% and +1.5%
  const changePct = (Math.random() * 3 - 1.5) / 100;
  const oldPrice = stock.price;
  const newPrice = parseFloat((oldPrice * (1 + changePct)).toFixed(2));
  
  if (newPrice <= 0.1) return stock; // prevent stock going to zero

  stock.price = newPrice;
  if (newPrice > stock.high52Week) stock.high52Week = newPrice;
  if (newPrice < stock.low52Week) stock.low52Week = newPrice;
  
  // Pre-save hook will automatically recalculate the stock.change based on previousClose
  // Also update the latest historical price if the date is different, or update today's last price
  if (stock.historicalPrices && stock.historicalPrices.length > 0) {
    const lastHist = stock.historicalPrices[stock.historicalPrices.length - 1];
    const todayStr = now.toDateString();
    const histDateStr = new Date(lastHist.date).toDateString();
    
    if (todayStr === histDateStr) {
      // Update today's price
      lastHist.price = newPrice;
    } else {
      // Append new day's price and remove oldest if history > 30 days
      stock.historicalPrices.push({ date: now, price: newPrice });
      if (stock.historicalPrices.length > 30) {
        stock.historicalPrices.shift();
      }
    }
  }

  await stock.save();
  return stock;
};

// @desc    Get all stocks (with search, filter, sort, paginate)
// @route   GET /api/stocks
// @access  Private
const getStocks = async (req, res) => {
  try {
    const { search, sector, sort, page = 1, limit = 12 } = req.query;

    const query = {};

    // Searching
    if (search) {
      query.$or = [
        { symbol: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtering by sector
    if (sector && sector !== 'All') {
      query.sector = sector;
    }

    // Sort setup
    let sortQuery = {};
    if (sort) {
      const parts = sort.split(':');
      sortQuery[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sortQuery['symbol'] = 1; // default sort
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Fetch stocks
    let stocks = await Stock.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    const total = await Stock.countDocuments(query);

    // Fluctuate prices on the fly for the returned page of stocks to simulate market activity
    const fluctuatePromises = stocks.map(stock => fluctuatePrice(stock));
    stocks = await Promise.all(fluctuatePromises);

    return res.json({
      success: true,
      count: stocks.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: stocks
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get a single stock by symbol
// @route   GET /api/stocks/:symbol
// @access  Private
const getStockBySymbol = async (req, res) => {
  try {
    let stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });

    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    // Fluctuate price on lookup
    stock = await fluctuatePrice(stock);

    return res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get top gainers
// @route   GET /api/stocks/market/gainers
// @access  Private
const getTopGainers = async (req, res) => {
  try {
    // Sort by change percentage descending
    const gainers = await Stock.find({ change: { $gt: 0 } })
      .sort({ change: -1 })
      .limit(5);

    return res.json({
      success: true,
      data: gainers
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get top losers
// @route   GET /api/stocks/market/losers
// @access  Private
const getTopLosers = async (req, res) => {
  try {
    // Sort by change percentage ascending
    const losers = await Stock.find({ change: { $lt: 0 } })
      .sort({ change: 1 })
      .limit(5);

    return res.json({
      success: true,
      data: losers
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get unique sectors
// @route   GET /api/stocks/market/sectors
// @access  Private
const getSectors = async (req, res) => {
  try {
    const sectors = await Stock.distinct('sector');
    return res.json({
      success: true,
      data: sectors
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getStocks,
  getStockBySymbol,
  getTopGainers,
  getTopLosers,
  getSectors
};
