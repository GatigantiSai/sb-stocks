const mongoose = require('mongoose');

const historicalPriceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Please add a stock symbol'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    companyName: {
      type: String,
      required: [true, 'Please add a company name'],
      trim: true
    },
    sector: {
      type: String,
      default: 'Unknown'
    },
    industry: {
      type: String,
      default: 'Unknown'
    },
    price: {
      type: Number,
      required: [true, 'Please add a stock price'],
      min: [0, 'Price cannot be negative']
    },
    previousClose: {
      type: Number,
      default: 0
    },
    change: {
      type: Number,
      default: 0
    },
    marketCap: {
      type: Number,
      default: 0
    },
    exchange: {
      type: String,
      default: 'NASDAQ'
    },
    logo: {
      type: String,
      default: ''
    },
    volume: {
      type: Number,
      default: 0
    },
    high52Week: {
      type: Number,
      default: 0
    },
    low52Week: {
      type: Number,
      default: 0
    },
    historicalPrices: [historicalPriceSchema]
  },
  {
    timestamps: true
  }
);

// Pre-save hook to calculate change percentage
stockSchema.pre('save', function (next) {
  if (this.previousClose > 0) {
    this.change = parseFloat(((this.price - this.previousClose) / this.previousClose * 100).toFixed(2));
  } else {
    this.change = 0;
  }
  next();
});

module.exports = mongoose.model('Stock', stockSchema);
