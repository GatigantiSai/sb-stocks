import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Coins, 
  ArrowLeftRight, 
  BarChart4, 
  ChevronLeft,
  Loader2 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StockDetails = () => {
  const { symbol } = useParams();
  const { user, refreshUser } = useAuth();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useMarket();

  const [stock, setStock] = useState(null);
  const [holding, setHolding] = useState(null);
  const [loading, setLoading] = useState(true);

  // Order ticket state
  const [tradeType, setTradeType] = useState('buy'); // 'buy' or 'sell'
  const [quantity, setQuantity] = useState('');
  const [submittingTrade, setSubmittingTrade] = useState(false);

  const fetchStockAndHoldingData = async () => {
    setLoading(true);
    try {
      const sRes = await axios.get(`/api/stocks/${symbol}`);
      if (sRes.data.success) {
        setStock(sRes.data.data);
      }

      // Check if user owns this stock
      const pRes = await axios.get('/api/portfolio');
      if (pRes.data.success) {
        const matchingHolding = pRes.data.data.holdings.find(h => h.symbol === symbol.toUpperCase());
        setHolding(matchingHolding || null);
      }
      
      await refreshUser();
    } catch (err) {
      console.error(err);
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockAndHoldingData();
  }, [symbol]);

  // Quick quiet refresh to simulate active ticking while looking at details
  useEffect(() => {
    const quietInterval = setInterval(() => {
      axios.get(`/api/stocks/${symbol}`)
        .then(res => {
          if (res.data.success) {
            setStock(res.data.data);
          }
        })
        .catch(err => console.error(err));
        
      axios.get('/api/portfolio')
        .then(res => {
          if (res.data.success) {
            const matchingHolding = res.data.data.holdings.find(h => h.symbol === symbol.toUpperCase());
            setHolding(matchingHolding || null);
          }
        })
        .catch(err => console.error(err));
    }, 10000);

    return () => clearInterval(quietInterval);
  }, [symbol]);

  const handleToggleWatchlist = () => {
    const isWatched = watchlist.some(w => w.symbol === symbol.toUpperCase());
    if (isWatched) {
      const watchedItem = watchlist.find(w => w.symbol === symbol.toUpperCase());
      removeFromWatchlist(watchedItem._id);
    } else {
      if (stock) addToWatchlist(stock._id);
    }
  };

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    const qty = parseFloat(quantity);

    if (isNaN(qty) || qty <= 0) {
      return toast.warning('Please enter a valid positive quantity');
    }

    if (tradeType === 'buy') {
      const cost = qty * stock.price;
      if (cost > user.balance) {
        return toast.error('Insufficient cash balance to place this order');
      }
    } else {
      if (!holding || holding.quantity < qty) {
        return toast.error(`Insufficient shares. You only own ${holding ? holding.quantity : 0} shares.`);
      }
    }

    setSubmittingTrade(true);
    try {
      const endpoint = tradeType === 'buy' ? '/api/orders/buy' : '/api/orders/sell';
      const res = await axios.post(endpoint, {
        symbol: symbol.toUpperCase(),
        quantity: qty
      });

      if (res.data.success) {
        toast.success(res.data.message);
        
        // Confetti explosion for successful trading experience!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        setQuantity('');
        
        // Re-fetch data
        fetchStockAndHoldingData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Order execution failed');
    } finally {
      setSubmittingTrade(false);
    }
  };

  const isWatched = watchlist.some(w => w.symbol === symbol.toUpperCase());
  const isPositive = stock?.change >= 0;

  // Format Recharts historical prices
  const historyData = stock?.historicalPrices?.map(h => {
    const d = new Date(h.date);
    return {
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      price: h.price
    };
  }) || [];

  if (loading && !stock) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentBlue"></div>
      </div>
    );
  }

  const estimatedValue = parseFloat(((parseFloat(quantity) || 0) * (stock?.price || 0)).toFixed(2));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back link */}
      <div>
        <Link to="/stocks" className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={16} />
          <span>Back to Markets</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 border-b border-darkBorder/40 pb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gray-900 border border-darkBorder rounded-2xl font-black text-xl tracking-wider text-white">
            {stock?.symbol}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{stock?.companyName}</h1>
              
              {/* Watchlist Toggle */}
              <button
                onClick={handleToggleWatchlist}
                className={`p-1.5 rounded-lg border transition-all ${
                  isWatched
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                    : 'bg-gray-800/40 border-darkBorder text-gray-400 hover:text-white'
                }`}
                title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {isWatched ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
              {stock?.exchange} &bull; {stock?.sector} &bull; {stock?.industry}
            </p>
          </div>
        </div>

        {/* Current price & Change */}
        <div className="flex md:flex-col items-baseline md:items-end justify-between md:justify-center gap-2">
          <div className="text-3xl font-black text-white">
            ${stock?.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded font-bold text-xs ${
            isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{isPositive ? '+' : ''}{stock?.change?.toFixed(2)}%</span>
          </span>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Historical chart & Metrics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Historical price chart */}
          <div className="glass p-6 rounded-2xl shadow-xl flex flex-col space-y-4">
            <div>
              <h3 className="font-bold text-lg text-white">Historical Performance (30 Days)</h3>
              <p className="text-xs text-gray-400">Random walk simulations showing recent closing metrics.</p>
            </div>
            
            <div className="h-[300px] w-full">
              {historyData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  No historical data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.25}/>
                        <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222f47" opacity={0.2} />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={10} 
                      tickLine={false} 
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `$${val.toFixed(0)}`}
                    />
                    <Tooltip 
                      formatter={(val) => [`$${val.toFixed(2)}`, 'Price']}
                      contentStyle={{ backgroundColor: '#151c2c', borderColor: '#222f47' }}
                      labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={isPositive ? '#10b981' : '#ef4444'} 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Grid key stats */}
          <div className="glass p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-white">Market Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              <div className="p-3 bg-gray-900/40 border border-darkBorder rounded-xl">
                <span className="text-[10px] text-gray-500 font-bold block uppercase">Previous Close</span>
                <span className="text-sm font-bold text-white">${stock?.previousClose?.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-gray-900/40 border border-darkBorder rounded-xl">
                <span className="text-[10px] text-gray-500 font-bold block uppercase">Market Cap</span>
                <span className="text-sm font-bold text-white">${((stock?.marketCap || 0) / 1000000000).toFixed(2)}B</span>
              </div>

              <div className="p-3 bg-gray-900/40 border border-darkBorder rounded-xl">
                <span className="text-[10px] text-gray-500 font-bold block uppercase">Volume</span>
                <span className="text-sm font-bold text-white">{stock?.volume?.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-gray-900/40 border border-darkBorder rounded-xl">
                <span className="text-[10px] text-gray-500 font-bold block uppercase">52-Week Range</span>
                <span className="text-xs font-bold text-white">
                  ${stock?.low52Week?.toFixed(2)} - ${stock?.high52Week?.toFixed(2)}
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Order Ticket & Owned shares */}
        <div className="space-y-6">
          
          {/* Position details */}
          <div className="glass p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-white">Your Position</h3>
            
            {holding ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-gray-900/40 rounded border border-darkBorder">
                    <span className="text-[9px] text-gray-500 block uppercase">Shares Owned</span>
                    <span className="font-bold text-white">{holding.quantity}</span>
                  </div>
                  <div className="p-2 bg-gray-900/40 rounded border border-darkBorder">
                    <span className="text-[9px] text-gray-500 block uppercase">Average Price</span>
                    <span className="font-bold text-white">${holding.averagePrice?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-900/60 rounded-xl border border-darkBorder/60 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-400">Current Market Value</span>
                    <span className="text-lg font-black text-white block">${(holding.quantity * stock?.price).toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block">Total Profit/Loss</span>
                    <span className={`text-base font-extrabold block ${holding.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {holding.gainLoss >= 0 ? '+' : ''}{holding.gainLossPct?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-xs bg-gray-900/40 rounded-xl border border-darkBorder/40">
                You do not own any shares of {stock?.symbol} yet.
              </div>
            )}
          </div>

          {/* Trade Ticket */}
          <div className="glass p-6 rounded-2xl shadow-xl space-y-6">
            
            <div className="flex justify-between items-center border-b border-darkBorder pb-4">
              <h3 className="font-bold text-lg text-white">Order Ticket</h3>
              <div className="flex bg-gray-900 p-0.5 rounded-lg border border-darkBorder">
                <button
                  onClick={() => { setTradeType('buy'); setQuantity(''); }}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    tradeType === 'buy' ? 'bg-accentBlue text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => { setTradeType('sell'); setQuantity(''); }}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    tradeType === 'sell' ? 'bg-red-650 text-white bg-red-600 shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>

            <form onSubmit={handleTradeSubmit} className="space-y-4">
              
              {/* Shares input */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold block uppercase">Quantity of Shares</label>
                <input
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/80 border border-darkBorder text-sm font-bold text-white focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
                  required
                />
              </div>

              {/* Estimate metrics */}
              <div className="space-y-2 text-xs border-t border-darkBorder/40 pt-4">
                <div className="flex justify-between text-gray-400">
                  <span>Available Cash</span>
                  <span className="font-bold text-white">${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                
                {tradeType === 'sell' && (
                  <div className="flex justify-between text-gray-400">
                    <span>Shares Available</span>
                    <span className="font-bold text-white">{holding ? holding.quantity : 0}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-400">
                  <span>Price per Share</span>
                  <span className="font-bold text-white">${stock?.price?.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-dashed border-darkBorder/40">
                  <span>Estimated Total</span>
                  <span className="text-accentBlue">${estimatedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Execute button */}
              <button
                type="submit"
                disabled={submittingTrade || !quantity || estimatedValue === 0}
                className={`w-full py-3.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 ${
                  tradeType === 'buy'
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10 text-white'
                    : 'bg-red-500 hover:bg-red-650 text-white shadow-red-500/10'
                }`}
              >
                {submittingTrade ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Executing Trade...</span>
                  </>
                ) : (
                  <>
                    <ArrowLeftRight size={16} />
                    <span className="uppercase">Submit {tradeType} Order</span>
                  </>
                )}
              </button>

            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default StockDetails;
