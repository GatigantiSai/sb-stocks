import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Search, Calendar, RefreshCw, ShoppingCart, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Query states
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [sort, setSort] = useState('timestamp:desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/transactions', {
        params: {
          search,
          type,
          sort,
          page,
          limit: 10
        }
      });
      if (res.data.success) {
        setTransactions(res.data.data);
        setTotalPages(res.data.pages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page, type, sort change. For search, we can trigger on enter or via a button
  useEffect(() => {
    fetchHistory();
  }, [page, type, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // reset to first page
    fetchHistory();
  };

  const handleClearFilters = () => {
    setSearch('');
    setType('All');
    setSort('timestamp:desc');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Transaction History</h1>
          <p className="text-gray-400 mt-1">Review all your stock purchases and sales.</p>
        </div>
        <button
          onClick={fetchHistory}
          className="self-start sm:self-auto p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all border border-darkBorder flex items-center space-x-1.5 text-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Query Filter Section */}
      <div className="glass p-5 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search form */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-auto flex-1 max-w-md">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stock symbol or name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/60 border border-darkBorder text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
            />
          </div>
        </form>

        {/* Filters dropdowns */}
        <div className="w-full md:w-auto flex flex-wrap gap-3 items-center justify-start md:justify-end">
          
          {/* Order Type */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-gray-400 font-semibold uppercase">Type:</span>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl bg-gray-900/60 border border-darkBorder text-xs text-white focus:outline-none focus:border-accentBlue"
            >
              <option value="All">All Operations</option>
              <option value="buy">BUY Only</option>
              <option value="sell">SELL Only</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-gray-400 font-semibold uppercase">Sort:</span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl bg-gray-900/60 border border-darkBorder text-xs text-white focus:outline-none focus:border-accentBlue"
            >
              <option value="timestamp:desc">Newest First</option>
              <option value="timestamp:asc">Oldest First</option>
              <option value="total:desc">Largest Total</option>
              <option value="total:asc">Smallest Total</option>
              <option value="quantity:desc">Highest Shares</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(search || type !== 'All' || sort !== 'timestamp:desc') && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs rounded-xl transition-all"
            >
              Reset
            </button>
          )}

        </div>

      </div>

      {/* Transaction Table */}
      <div className="glass rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentBlue"></div>
            <div className="text-gray-400 text-sm">Retrieving trading ledger...</div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <span className="p-4 bg-gray-800 text-gray-500 rounded-full">
              <Calendar size={32} />
            </span>
            <h3 className="font-bold text-lg text-white">No Transactions Found</h3>
            <p className="text-gray-500 max-w-sm text-sm">
              You haven't made any paper trades yet. Search for a stock and make your first trade!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-darkBorder/60">
              <thead className="bg-gray-900/40 text-left">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Operation</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Quantity</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Share Price</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Total Cost/Rev</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/40">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-800/20 transition-all">
                    
                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(tx.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    {/* Stock Symbol and Company */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white bg-gray-850 px-2 py-1 rounded text-xs border border-darkBorder">
                          {tx.symbol}
                        </span>
                        <span className="text-sm font-medium text-gray-300 truncate max-w-xs">{tx.companyName}</span>
                      </div>
                    </td>

                    {/* Operation (BUY/SELL) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        tx.type === 'buy'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        <ShoppingCart size={12} />
                        <span className="uppercase">{tx.type}</span>
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-300 text-right">
                      {tx.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-300 text-right">
                      ${tx.price.toFixed(2)}
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-white">
                      ${tx.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-gray-900/30 px-6 py-4 border-t border-darkBorder/60 flex items-center justify-between text-sm">
            <div className="text-gray-400">
              Showing <span className="font-semibold text-white">{transactions.length}</span> of{' '}
              <span className="font-semibold text-white">{totalCount}</span> entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="p-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-gray-300 border border-darkBorder transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-gray-400 text-xs">
                Page <span className="font-semibold text-white">{page}</span> of {totalPages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-gray-300 border border-darkBorder transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default History;
