const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Holding = require('../models/Holding');
const Watchlist = require('../models/Watchlist');
const Portfolio = require('../models/Portfolio');

// @desc    Get system-wide analytics & stats
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Sum of all user balances + holdings value
    const aggregateUsers = await User.aggregate([
      {
        $group: {
          _id: null,
          totalBalances: { $sum: '$balance' },
          totalPortfolios: { $sum: '$portfolioValue' }
        }
      }
    ]);

    const totalBalances = aggregateUsers[0] ? aggregateUsers[0].totalBalances : 0;
    const totalPortfolios = aggregateUsers[0] ? aggregateUsers[0].totalPortfolios : 0;

    const totalTransactions = await Transaction.countDocuments({});
    
    // Aggregate volume/values of transactions
    const transactionStats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalValueTraded: { $sum: '$total' },
          buyCount: { $sum: { $cond: [{ $eq: ['$type', 'buy'] }, 1, 0] } },
          sellCount: { $sum: { $cond: [{ $eq: ['$type', 'sell'] }, 1, 0] } }
        }
      }
    ]);

    const totalValueTraded = transactionStats[0] ? transactionStats[0].totalValueTraded : 0;
    const totalBuys = transactionStats[0] ? transactionStats[0].buyCount : 0;
    const totalSells = transactionStats[0] ? transactionStats[0].sellCount : 0;

    // Recent trades across all users
    const recentTrades = await Transaction.find({})
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .limit(10);

    // Distribution of users by status
    const activeUsers = await User.countDocuments({ status: 'active', role: 'user' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended', role: 'user' });

    // Sector breakdown
    const sectorStats = await Stock.aggregate([
      {
        $group: {
          _id: '$sector',
          count: { $sum: 1 }
        }
      }
    ]);

    return res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          active: activeUsers,
          suspended: suspendedUsers
        },
        financials: {
          totalBalances: parseFloat(totalBalances.toFixed(2)),
          totalPortfolios: parseFloat(totalPortfolios.toFixed(2)),
          totalValueTraded: parseFloat(totalValueTraded.toFixed(2))
        },
        trades: {
          total: totalTransactions,
          buys: totalBuys,
          sells: totalSells,
          recent: recentTrades
        },
        sectors: sectorStats
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all users (for management)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = { _id: { $ne: req.user._id } }; // Exclude current admin

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    return res.json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: users
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Toggle user suspension (suspend / unsuspend)
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
const toggleUserSuspension = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend an administrator account' });
    }

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();

    return res.json({
      success: true,
      message: `User account has been ${user.status === 'active' ? 'activated' : 'suspended'}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete an administrator account' });
    }

    // Clean up user's related data
    await Holding.deleteMany({ user: user._id });
    await Transaction.deleteMany({ user: user._id });
    await Watchlist.deleteOne({ user: user._id });
    await Portfolio.deleteOne({ user: user._id });
    
    // Delete user
    await User.deleteOne({ _id: user._id });

    return res.json({ success: true, message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add a stock
// @route   POST /api/admin/stocks
// @access  Private/Admin
const createStock = async (req, res) => {
  try {
    const {
      symbol,
      companyName,
      sector,
      industry,
      price,
      previousClose,
      marketCap,
      exchange,
      volume,
      high52Week,
      low52Week
    } = req.body;

    if (!symbol || !companyName || !price) {
      return res.status(400).json({ success: false, message: 'Symbol, Company Name, and Price are required' });
    }

    const exists = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: `Stock with symbol ${symbol.toUpperCase()} already exists` });
    }

    // Generate historical prices (30 days of random walk from starting price)
    const history = [];
    let current = parseFloat(price);
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const walk = (Math.random() * 4 - 2) / 100;
      current = parseFloat((current * (1 + walk)).toFixed(2));
      history.push({ date: d, price: current });
    }

    const stock = await Stock.create({
      symbol: symbol.toUpperCase(),
      companyName,
      sector: sector || 'Other',
      industry: industry || 'Other',
      price: parseFloat(price),
      previousClose: parseFloat(previousClose) || parseFloat(price),
      marketCap: parseFloat(marketCap) || 0,
      exchange: exchange || 'NASDAQ',
      volume: parseFloat(volume) || 0,
      high52Week: parseFloat(high52Week) || parseFloat(price) * 1.2,
      low52Week: parseFloat(low52Week) || parseFloat(price) * 0.8,
      historicalPrices: history,
      logo: `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=80&fit=crop&q=60`
    });

    return res.status(201).json({
      success: true,
      message: 'Stock created successfully',
      data: stock
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Edit a stock
// @route   PUT /api/admin/stocks/:id
// @access  Private/Admin
const updateStock = async (req, res) => {
  try {
    const {
      companyName,
      sector,
      industry,
      price,
      previousClose,
      marketCap,
      exchange,
      volume,
      high52Week,
      low52Week
    } = req.body;

    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    stock.companyName = companyName || stock.companyName;
    stock.sector = sector || stock.sector;
    stock.industry = industry || stock.industry;
    stock.exchange = exchange || stock.exchange;
    
    if (price !== undefined) stock.price = parseFloat(price);
    if (previousClose !== undefined) stock.previousClose = parseFloat(previousClose);
    if (marketCap !== undefined) stock.marketCap = parseFloat(marketCap);
    if (volume !== undefined) stock.volume = parseFloat(volume);
    if (high52Week !== undefined) stock.high52Week = parseFloat(high52Week);
    if (low52Week !== undefined) stock.low52Week = parseFloat(low52Week);

    // If price changes, update today's historical price
    if (price !== undefined && stock.historicalPrices.length > 0) {
      stock.historicalPrices[stock.historicalPrices.length - 1].price = parseFloat(price);
    }

    await stock.save();

    return res.json({
      success: true,
      message: 'Stock updated successfully',
      data: stock
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a stock
// @route   DELETE /api/admin/stocks/:id
// @access  Private/Admin
const deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    // Delete stock
    await Stock.deleteOne({ _id: stock._id });

    return res.json({ success: true, message: 'Stock deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getSystemStats,
  getAllUsers,
  toggleUserSuspension,
  deleteUser,
  createStock,
  updateStock,
  deleteStock
};
