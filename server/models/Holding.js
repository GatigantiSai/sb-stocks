const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema(
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
      required: true
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative']
    },
    averagePrice: {
      type: Number,
      required: true,
      min: [0, 'Average price cannot be negative']
    },
    totalCost: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound index to quickly look up a user's holding for a specific stock
holdingSchema.index({ user: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('Holding', holdingSchema);
