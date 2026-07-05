const User = require('../models/User');
const Stock = require('../models/Stock');
const Holding = require('../models/Holding');
const Portfolio = require('../models/Portfolio');

// Helper to update portfolio value history snapshot (once per day)
const updatePortfolioHistory = async (userId, currentTotalValue) => {
  try {
    const portfolio = await Portfolio.findOne({ user: userId });
    if (!portfolio) return;

    const now = new Date();
    const todayStr = now.toDateString();

    const history = portfolio.valueHistory;
    if (history.length > 0) {
      const lastSnapshot = history[history.length - 1];
      const lastSnapshotDateStr = new Date(lastSnapshot.date).toDateString();

      if (todayStr === lastSnapshotDateStr) {
        // Update today's value with the latest
        lastSnapshot.value = parseFloat(currentTotalValue.toFixed(2));
      } else {
        // Add new snapshot for today
        history.push({
          date: now,
          value: parseFloat(currentTotalValue.toFixed(2))
        });
        
        // Keep last 30 days
        if (history.length > 30) {
          history.shift();
        }
      }
    } else {
      history.push({
        date: now,
        value: parseFloat(currentTotalValue.toFixed(2))
      });
    }

    portfolio.valueHistory = history;
    await portfolio.save();
  } catch (error) {
    console.error('Error updating portfolio history:', error);
  }
};

// @desc    Get user portfolio summary
// @route   GET /api/portfolio
// @access  Private
const getPortfolioSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const holdings = await Holding.find({ user: user._id });
    
    let totalInvested = 0;
    let currentHoldingsValue = 0;
    let todaysGainLoss = 0;
    
    const holdingsWithCurrentData = [];

    for (let h of holdings) {
      const stock = await Stock.findOne({ symbol: h.symbol });
      
      const currentPrice = stock ? stock.price : h.averagePrice;
      const prevClose = stock ? stock.previousClose : h.averagePrice;
      
      const currentVal = parseFloat((h.quantity * currentPrice).toFixed(2));
      const costBasis = parseFloat((h.quantity * h.averagePrice).toFixed(2));
      
      const overallGainLoss = parseFloat((currentVal - costBasis).toFixed(2));
      const overallGainLossPct = costBasis > 0 ? parseFloat(((overallGainLoss / costBasis) * 100).toFixed(2)) : 0;
      
      const dayGainLoss = parseFloat(((currentPrice - prevClose) * h.quantity).toFixed(2));
      
      totalInvested += costBasis;
      currentHoldingsValue += currentVal;
      todaysGainLoss += dayGainLoss;

      holdingsWithCurrentData.push({
        _id: h._id,
        symbol: h.symbol,
        companyName: stock ? stock.companyName : h.symbol,
        quantity: h.quantity,
        averagePrice: h.averagePrice,
        currentPrice: currentPrice,
        totalCost: costBasis,
        currentValue: currentVal,
        profit: overallGainLoss >= 0 ? overallGainLoss : 0,
        loss: overallGainLoss < 0 ? Math.abs(overallGainLoss) : 0,
        gainLoss: overallGainLoss,
        gainLossPct: overallGainLossPct,
        todayGainLoss: dayGainLoss
      });
    }

    const totalPortfolioValue = parseFloat((user.balance + currentHoldingsValue).toFixed(2));
    const overallGainLoss = parseFloat((currentHoldingsValue - totalInvested).toFixed(2));
    const overallGainLossPct = totalInvested > 0 ? parseFloat(((overallGainLoss / totalInvested) * 100).toFixed(2)) : 0;

    // Trigger history update async
    await updatePortfolioHistory(user._id, totalPortfolioValue);

    // Fetch value history for charts
    const portfolio = await Portfolio.findOne({ user: user._id });
    const performanceHistory = portfolio ? portfolio.valueHistory : [];

    // Allocation pie chart data: stocks + cash
    const allocationData = holdingsWithCurrentData.map(h => ({
      name: h.symbol,
      value: h.currentValue
    }));
    
    if (user.balance > 0) {
      allocationData.push({
        name: 'CASH',
        value: user.balance
      });
    }

    // Sync updated portfolio value to the user model
    user.portfolioValue = totalPortfolioValue;
    await user.save();

    return res.json({
      success: true,
      data: {
        balance: user.balance,
        totalPortfolioValue,
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        currentHoldingsValue: parseFloat(currentHoldingsValue.toFixed(2)),
        todaysGainLoss: parseFloat(todaysGainLoss.toFixed(2)),
        overallGainLoss,
        overallGainLossPct,
        holdings: holdingsWithCurrentData,
        allocation: allocationData,
        history: performanceHistory
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getPortfolioSummary
};
