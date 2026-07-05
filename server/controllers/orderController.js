const User = require('../models/User');
const Stock = require('../models/Stock');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');

// @desc    Buy a stock
// @route   POST /api/orders/buy
// @access  Private
const buyStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const qty = parseFloat(quantity);

    if (!symbol || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid symbol or quantity' });
    }

    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const price = stock.price;
    const totalCost = parseFloat((price * qty).toFixed(2));

    // Check if user has enough balance
    if (user.balance < totalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Required: $${totalCost.toLocaleString()}, Available: $${user.balance.toLocaleString()}`
      });
    }

    // Deduct from balance
    user.balance = parseFloat((user.balance - totalCost).toFixed(2));

    // Find if user already holds this stock
    let holding = await Holding.findOne({ user: user._id, symbol: stock.symbol });

    if (holding) {
      // Calculate new average purchase price (Weighted Average Cost)
      const newQty = holding.quantity + qty;
      const newTotalCost = holding.totalCost + totalCost;
      const newAvgPrice = parseFloat((newTotalCost / newQty).toFixed(2));

      holding.quantity = newQty;
      holding.averagePrice = newAvgPrice;
      holding.totalCost = parseFloat(newTotalCost.toFixed(2));
      await holding.save();
    } else {
      // Create new holding
      holding = await Holding.create({
        user: user._id,
        stock: stock._id,
        symbol: stock.symbol,
        quantity: qty,
        averagePrice: price,
        totalCost: totalCost
      });
    }

    // Create transaction log
    const transaction = await Transaction.create({
      user: user._id,
      stock: stock._id,
      symbol: stock.symbol,
      companyName: stock.companyName,
      type: 'buy',
      quantity: qty,
      price: price,
      total: totalCost
    });

    // Update user's portfolio value: balance + value of all holdings
    const allHoldings = await Holding.find({ user: user._id });
    let holdingsValue = 0;
    for (let h of allHoldings) {
      // Fetch latest price from stock schema (dynamic calculation)
      const hStock = await Stock.findOne({ symbol: h.symbol });
      holdingsValue += h.quantity * (hStock ? hStock.price : h.averagePrice);
    }
    user.portfolioValue = parseFloat((user.balance + holdingsValue).toFixed(2));
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Successfully purchased ${qty} shares of ${stock.symbol}`,
      data: {
        balance: user.balance,
        portfolioValue: user.portfolioValue,
        holding,
        transaction
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Sell a stock
// @route   POST /api/orders/sell
// @access  Private
const sellStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const qty = parseFloat(quantity);

    if (!symbol || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid symbol or quantity' });
    }

    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find the user's holding
    const holding = await Holding.findOne({ user: user._id, symbol: stock.symbol });
    if (!holding || holding.quantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient shares. Owned: ${holding ? holding.quantity : 0}, Attempted to sell: ${qty}`
      });
    }

    const price = stock.price;
    const totalRevenue = parseFloat((price * qty).toFixed(2));

    // Update holding
    if (holding.quantity === qty) {
      // Sold all shares, remove holding
      await Holding.deleteOne({ _id: holding._id });
    } else {
      // Decrease quantity
      holding.quantity = holding.quantity - qty;
      holding.totalCost = parseFloat((holding.quantity * holding.averagePrice).toFixed(2));
      await holding.save();
    }

    // Add revenue to balance
    user.balance = parseFloat((user.balance + totalRevenue).toFixed(2));

    // Create transaction log
    const transaction = await Transaction.create({
      user: user._id,
      stock: stock._id,
      symbol: stock.symbol,
      companyName: stock.companyName,
      type: 'sell',
      quantity: qty,
      price: price,
      total: totalRevenue
    });

    // Recalculate portfolio value
    const allHoldings = await Holding.find({ user: user._id });
    let holdingsValue = 0;
    for (let h of allHoldings) {
      const hStock = await Stock.findOne({ symbol: h.symbol });
      holdingsValue += h.quantity * (hStock ? hStock.price : h.averagePrice);
    }
    user.portfolioValue = parseFloat((user.balance + holdingsValue).toFixed(2));
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Successfully sold ${qty} shares of ${stock.symbol}`,
      data: {
        balance: user.balance,
        portfolioValue: user.portfolioValue,
        holding: holding.quantity === qty ? null : holding,
        transaction
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  buyStock,
  sellStock
};
