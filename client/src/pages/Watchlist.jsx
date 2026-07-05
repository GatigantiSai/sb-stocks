import React from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { Eye, TrendingUp, TrendingDown, Trash2, ArrowRight } from 'lucide-react';

const Watchlist = () => {
  const { watchlist, watchlistLoading, removeFromWatchlist } = useMarket();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">My Watchlist</h1>
        <p className="text-gray-400 mt-1">Monitor stock movements and quick-access trading.</p>
      </div>

      {/* Main Table Card */}
      <div className="glass rounded-2xl shadow-xl overflow-hidden">
        {watchlistLoading && watchlist.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentBlue"></div>
            <div className="text-gray-400 text-sm">Loading watched assets...</div>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <span className="p-4 bg-gray-800 text-gray-500 rounded-full">
              <Eye size={32} />
            </span>
            <h3 className="font-bold text-lg text-white font-sans">Your Watchlist is Empty</h3>
            <p className="text-gray-500 max-w-sm text-sm">
              Keep an eye on stocks you care about by clicking the watchlist button on individual stock details!
            </p>
            <Link
              to="/stocks"
              className="mt-2 inline-flex items-center space-x-2 bg-accentBlue hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              <span>Explore Stock Listings</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-darkBorder/60">
              <thead className="bg-gray-900/40 text-left">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Company Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sector</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Price</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Change</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">52W Range</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/40">
                {watchlist.map((stock) => {
                  const isPositive = stock.change >= 0;
                  return (
                    <tr key={stock._id} className="hover:bg-gray-800/20 transition-all">
                      
                      {/* Symbol */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-extrabold text-white bg-gray-900/80 px-2.5 py-1.5 rounded-lg border border-darkBorder text-xs tracking-wider">
                          {stock.symbol}
                        </span>
                      </td>

                      {/* Company Name */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-200">
                        {stock.companyName}
                      </td>

                      {/* Sector */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                        {stock.sector}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-right text-white">
                        ${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Price Change */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`inline-flex items-center space-x-1 font-bold text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          <span>{isPositive ? '+' : ''}{stock.change.toFixed(2)}%</span>
                        </span>
                      </td>

                      {/* 52W High / Low */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 text-right">
                        <span className="font-medium text-red-400">${stock.low52Week?.toFixed(2)}</span>
                        <span className="mx-1.5">-</span>
                        <span className="font-medium text-emerald-400">${stock.high52Week?.toFixed(2)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            to={`/stocks/${stock.symbol}`}
                            className="px-3 py-1.5 bg-accentBlue/10 hover:bg-accentBlue/20 text-accentBlue rounded-lg text-xs font-bold transition-all"
                          >
                            Trade
                          </Link>
                          
                          <button
                            onClick={() => removeFromWatchlist(stock._id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/10 transition-all"
                            title="Remove from Watchlist"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Watchlist;
