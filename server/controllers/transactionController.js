const Transaction = require('../models/Transaction');

// @desc    Get user transactions with search, filter, paginate
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { search, type, sort, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };

    // Searching by symbol or company name
    if (search) {
      query.$or = [
        { symbol: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtering by type (buy or sell)
    if (type && type !== 'All') {
      query.type = type;
    }

    // Sort setup (default newest first)
    let sortQuery = { timestamp: -1 };
    if (sort) {
      const parts = sort.split(':');
      sortQuery[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const transactions = await Transaction.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    const total = await Transaction.countDocuments(query);

    return res.json({
      success: true,
      count: transactions.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: transactions
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getTransactions
};
