const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    stocks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Watchlist', watchlistSchema);
