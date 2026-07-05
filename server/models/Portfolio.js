const mongoose = require('mongoose');

const valueHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  value: {
    type: Number,
    required: true
  }
}, { _id: false });

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    valueHistory: [valueHistorySchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
