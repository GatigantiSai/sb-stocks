const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: false
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      index: true
    },
    companyName: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['buy', 'sell'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.0001, 'Quantity must be positive']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price must be positive']
    },
    total: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
