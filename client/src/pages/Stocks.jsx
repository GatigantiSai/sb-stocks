import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useMarket } from '../context/MarketContext';
import { toast } from 'react-toastify';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Check } from 'lucide-react';

const Stocks = () => {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useMarket();

  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Query states
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All');
  const [sort, setSort] = useState('symbol:asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/stocks', {
        params: {
          search,
          sector,
          sort,
          page,
          limit: 12
        }
      });
      if (res.data.success) {
        setStocks(res.data.data);
        setTotalPages(res.data.pages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve stock list');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when parameters modify
  useEffect(() => {
    fetchStocks();
  }, [page, sector, sort]);

  // Set interval to poll current page stocks every 15 seconds (makes screen feel live!)
  useEffect(() => {
    const pollInterval = setInterval(() => {
      // Quiet poll without full-screen loading skeleton
      axios.get('/api/stocks', {
        params: { search, sector, sort, page, limit: 12 }
      }).then(res => {
        if (res.data.success) {
          setStocks(res.data.data);
        }
      }).catch(err => console.error(err));
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [page, sector, sort, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStocks();
  };

  const handleToggleWatchlist = (stock) => {
    const isWatched = watchlist.some(w => w._id === stock._id);
    if (isWatched) {
      removeFromWatchlist(stock._id);
    } else {
      addToWatchlist(stock._id);
    }
  };

  const isStockWatched = (stockId) => {
    return watchlist.some(w => w._id === stockId);
  };

  const sectorOptions = [
    'All',
    'Technology',
    'Financials',
    'Healthcare',
    'Consumer Discretionary',
    'Consumer Staples',
    'Energy',
    'Industrials',
    'Communication Services',
    'Real Estate',
    'Utilities'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Stock Markets</h1>
        <p className="text-gray-400 mt-1">Search, filter, and monitor live assets for paper trading.</p>
      </div>

      {/* Filter and search panel */}
      <div className="glass p-5 rounded-2xl shadow-xl flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="w-full lg:w-auto flex-1 max-w-lg">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-505 pointer-events-none text-gray-500">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticker symbol or company name... (Press Enter)"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-900/60 border border-darkBorder text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
            />
          </div>
        </form>

        {/* Action Selects */}
        <div className="w-full lg:w-auto flex flex-wrap gap-4 items-center justify-start lg:justify-end">
          
          {/* Sector filter */}
          <div className="flex items-center space-x-2">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-semibold uppercase">Sector:</span>
            <select
              value={sector}
              onChange={(e) => { setSector(e.target.value); setPage(1); }}
              className="px-3.5 py-2 rounded-xl bg-gray-900/60 border border-darkBorder text-xs text-white focus:outline-none focus:border-accentBlue"
            >
              {sectorOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Sort field */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-semibold uppercase">Sort By:</span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3.5 py-2 rounded-xl bg-gray-900/60 border border-darkBorder text-xs text-white focus:outline-none focus:border-accentBlue"
            >
              <option value="symbol:asc">Symbol (A-Z)</option>
              <option value="symbol:desc">Symbol (Z-A)</option>
              <option value="price:desc">Highest Price</option>
              <option value="price:asc">Lowest Price</option>
              <option value="change:desc">Top Gainers</option>
              <option value="change:asc">Top Losers</option>
              <option value="marketCap:desc">Market Cap</option>
            </select>
          </div>

        </div>

      </div>

      {/* Grid listing */}
      {loading && stocks.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass p-5 rounded-2xl animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-6 w-16 bg-gray-800 rounded"></div>
                <div className="h-6 w-8 bg-gray-800 rounded-full"></div>
              </div>
              <div className="h-4 w-32 bg-gray-800 rounded"></div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 w-20 bg-gray-800 rounded"></div>
                <div className="h-4 w-12 bg-gray-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : stocks.length === 0 ? (
        <div className="glass p-20 text-center rounded-2xl flex flex-col items-center justify-center space-y-4">
          <span className="text-4xl">🔍</span>
          <h3 className="font-bold text-lg text-white">No Stocks Found</h3>
          <p className="text-gray-500 max-w-sm text-sm">
            We couldn't find any stocks matching your filters. Try clearing your search query or choosing another sector!
          </p>
          <button
            onClick={() => { setSearch(''); setSector('All'); setSort('symbol:asc'); setPage(1); }}
            className="mt-2 bg-gray-800 hover:bg-gray-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all border border-darkBorder"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {stocks.map(stock => {
            const isWatched = isStockWatched(stock._id);
            const isPositive = stock.change >= 0;
            return (
              <div
                key={stock._id}
                className="glass p-5 rounded-2xl hover:border-gray-600 transition-all flex flex-col justify-between group relative shadow-md"
              >
                {/* Header detail */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-extrabold text-white bg-gray-900/60 px-2 py-1 rounded text-xs border border-darkBorder tracking-wide">
                      {stock.symbol}
                    </span>
                    <span className="text-[10px] text-gray-500 ml-1.5 uppercase font-bold tracking-wider">{stock.exchange}</span>
                  </div>
                  
                  {/* Watchlist toggle button */}
                  <button
                    onClick={() => handleToggleWatchlist(stock)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isWatched
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                        : 'bg-gray-800/40 border-darkBorder text-gray-500 hover:text-white hover:border-gray-600'
                    }`}
                    title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    {isWatched ? <Check size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Company & Sector info */}
                <div className="mb-4">
                  <h3 className="font-bold text-gray-200 group-hover:text-white transition-colors truncate text-sm" title={stock.companyName}>
                    {stock.companyName}
                  </h3>
                  <p className="text-[11px] text-gray-500">{stock.sector}</p>
                </div>

                {/* Pricing values */}
                <div className="flex items-end justify-between pt-2 border-t border-darkBorder/40">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Price</div>
                    <div className="text-base font-extrabold text-white">
                      ${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <Link
                  to={`/stocks/${stock.symbol}`}
                  className="mt-4 w-full bg-gray-900/60 hover:bg-accentBlue hover:text-white border border-darkBorder hover:border-accentBlue text-gray-300 font-bold py-2 rounded-xl text-xs text-center transition-all block"
                >
                  View Details
                </Link>

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-gray-900/10 px-4 py-4 rounded-xl border border-darkBorder/60 text-sm">
          <div className="text-gray-400 text-xs">
            Showing <span className="font-semibold text-white">{stocks.length}</span> of{' '}
            <span className="font-semibold text-white">{totalCount}</span> stocks
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-gray-300 border border-darkBorder transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-gray-400 text-xs">
              Page <span className="font-semibold text-white">{page}</span> of {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-gray-300 border border-darkBorder transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Stocks;
