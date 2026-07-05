import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { toast } from 'react-toastify';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Briefcase, 
  Percent, 
  Grid, 
  Eye, 
  Newspaper, 
  ArrowRight,
  RefreshCw 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const { gainers, losers, watchlist, loadingSummary } = useMarket();

  const [portfolioData, setPortfolioData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);

  // Dynamic mock news list to make it look premium
  const newsList = [
    { id: 1, title: "Federal Reserve hints at interest rate stabilization in upcoming quarter", source: "MarketWatch", time: "10m ago" },
    { id: 2, title: "Tech stocks lead surge as artificial intelligence adoption accelerates", source: "Bloomberg", time: "45m ago" },
    { id: 3, title: "Energy sector faces downward pressure amid fluctuating crude inventories", source: "Reuters", time: "2h ago" },
    { id: 4, title: "S&P 500 reaches new record high during mid-day trading session", source: "CNBC", time: "4h ago" }
  ];

  const fetchDashboardData = async () => {
    setLoadingPortfolio(true);
    try {
      // Fetch portfolio summary
      const pRes = await axios.get('/api/portfolio');
      if (pRes.data.success) {
        setPortfolioData(pRes.data.data);
      }

      // Fetch recent transactions (limit 5)
      const tRes = await axios.get('/api/transactions', {
        params: { page: 1, limit: 5 }
      });
      if (tRes.data.success) {
        setRecentTransactions(tRes.data.data);
      }

      // Refresh user details (cash balance)
      await refreshUser();
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoadingPortfolio(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-update dashboard metrics quietly every 15 seconds
    const interval = setInterval(() => {
      axios.get('/api/portfolio')
        .then(res => { if (res.data.success) setPortfolioData(res.data.data); })
        .catch(err => console.error(err));
      
      axios.get('/api/transactions', { params: { page: 1, limit: 5 } })
        .then(res => { if (res.data.success) setRecentTransactions(res.data.data); })
        .catch(err => console.error(err));
        
      refreshUser();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Format currencies
  const formatCurrency = (val) => {
    return (val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6', '#6b7280'];

  // Parse allocation data
  const pieData = portfolioData?.allocation?.filter(a => a.value > 0) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, <span className="text-white font-semibold">{user?.name}</span>. Here is your portfolio status.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="self-start sm:self-auto p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all border border-darkBorder flex items-center space-x-1.5 text-sm"
        >
          <RefreshCw size={16} className={loadingPortfolio ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Net Portfolio Value */}
        <div className="glass p-6 rounded-2xl flex items-center space-x-4">
          <span className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Briefcase size={24} />
          </span>
          <div>
            <span className="text-xs text-gray-500 font-semibold block uppercase">Portfolio Value</span>
            <span className="text-2xl font-black text-white">
              ${formatCurrency(portfolioData?.totalPortfolioValue || user?.portfolioValue)}
            </span>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="glass p-6 rounded-2xl flex items-center space-x-4">
          <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Wallet size={24} />
          </span>
          <div>
            <span className="text-xs text-gray-500 font-semibold block uppercase">Available Cash</span>
            <span className="text-2xl font-black text-white">
              ${formatCurrency(portfolioData?.balance || user?.balance)}
            </span>
          </div>
        </div>

        {/* Today's Gain/Loss */}
        <div className="glass p-6 rounded-2xl flex items-center space-x-4">
          {portfolioData?.todaysGainLoss >= 0 ? (
            <>
              <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <TrendingUp size={24} />
              </span>
              <div>
                <span className="text-xs text-gray-500 font-semibold block uppercase">Today's Gain</span>
                <span className="text-2xl font-black text-emerald-400">
                  +${formatCurrency(portfolioData?.todaysGainLoss)}
                </span>
              </div>
            </>
          ) : (
            <>
              <span className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                <TrendingDown size={24} />
              </span>
              <div>
                <span className="text-xs text-gray-500 font-semibold block uppercase">Today's Loss</span>
                <span className="text-2xl font-black text-red-400">
                  -${formatCurrency(Math.abs(portfolioData?.todaysGainLoss))}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Total Holdings */}
        <div className="glass p-6 rounded-2xl flex items-center space-x-4">
          <span className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Grid size={24} />
          </span>
          <div>
            <span className="text-xs text-gray-500 font-semibold block uppercase">Assets Owned</span>
            <span className="text-2xl font-black text-white">
              {portfolioData?.holdings?.length || 0} Stocks
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Allocation Pie & Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Asset Allocation */}
          <div className="glass p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-4">
              <h3 className="font-bold text-lg text-white">Asset Allocation</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Visualizing your portfolio weights divided between stocks and cash. Keep a balanced allocation to minimize risk.
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                {pieData.map((item, idx) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="text-gray-300 font-semibold truncate max-w-[100px]">{item.name}</span>
                    <span className="text-gray-500">({((item.value / (portfolioData?.totalPortfolioValue || 1)) * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-[180px] h-[180px] flex items-center justify-center relative">
              {pieData.length === 0 ? (
                <div className="text-gray-500 text-xs text-center border-2 border-dashed border-darkBorder rounded-full w-full h-full flex items-center justify-center">
                  100% Cash Portfolio
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => [`$${val.toLocaleString()}`, 'Value']}
                      contentStyle={{ backgroundColor: '#151c2c', borderColor: '#222f47' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="glass p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Recent Transactions</h3>
              <Link to="/history" className="text-xs text-accentBlue hover:underline flex items-center space-x-1 font-semibold">
                <span>View Full History</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No transactions completed yet. Browse stock listings to initiate paper trades!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-darkBorder/40 text-left text-xs">
                  <thead>
                    <tr className="text-gray-500 font-semibold uppercase">
                      <th className="py-2.5">Stock</th>
                      <th className="py-2.5">Type</th>
                      <th className="py-2.5 text-right">Qty</th>
                      <th className="py-2.5 text-right">Price</th>
                      <th className="py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-darkBorder/30">
                    {recentTransactions.map(tx => (
                      <tr key={tx._id} className="text-gray-300 font-semibold">
                        <td className="py-3">
                          <span className="font-bold text-white bg-gray-900 px-1.5 py-0.5 rounded text-[10px] border border-darkBorder">
                            {tx.symbol}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`uppercase font-bold text-[9px] px-1.5 py-0.5 rounded ${
                            tx.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 text-right">{tx.quantity}</td>
                        <td className="py-3 text-right">${tx.price.toFixed(2)}</td>
                        <td className="py-3 text-right text-white">${tx.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right column: Tickers list & news */}
        <div className="space-y-6">
          
          {/* Top Gainers & Losers */}
          <div className="glass p-6 rounded-2xl shadow-xl space-y-5">
            <h3 className="font-bold text-lg text-white">Daily Movers</h3>
            
            <div className="grid grid-cols-2 gap-4">
              
              {/* Gainers */}
              <div className="space-y-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Top Gainers</span>
                {loadingSummary && gainers.length === 0 ? (
                  <div className="h-20 animate-pulse bg-gray-800 rounded-lg"></div>
                ) : (
                  <div className="space-y-2">
                    {gainers.slice(0, 3).map(g => (
                      <Link to={`/stocks/${g.symbol}`} key={g._id} className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all text-[11px]">
                        <span className="font-bold text-white">{g.symbol}</span>
                        <span className="text-emerald-400 font-bold">+{g.change.toFixed(1)}%</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Losers */}
              <div className="space-y-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Top Losers</span>
                {loadingSummary && losers.length === 0 ? (
                  <div className="h-20 animate-pulse bg-gray-800 rounded-lg"></div>
                ) : (
                  <div className="space-y-2">
                    {losers.slice(0, 3).map(l => (
                      <Link to={`/stocks/${l.symbol}`} key={l._id} className="flex justify-between items-center p-2 rounded-lg bg-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-all text-[11px]">
                        <span className="font-bold text-white">{l.symbol}</span>
                        <span className="text-red-400 font-bold">{l.change.toFixed(1)}%</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Watchlist Preview */}
          <div className="glass p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Watchlist</h3>
              <Link to="/watchlist" className="text-xs text-accentBlue hover:underline flex items-center space-x-1 font-semibold">
                <span>View Watchlist</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {watchlist.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs bg-gray-900/40 rounded-xl border border-darkBorder/40">
                No stocks added yet. Track stocks to view quick values here.
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {watchlist.slice(0, 4).map(w => {
                  const isPositive = w.change >= 0;
                  return (
                    <Link to={`/stocks/${w.symbol}`} key={w._id} className="flex justify-between items-center p-2.5 rounded-xl bg-gray-900/50 hover:bg-gray-800/30 border border-darkBorder transition-all text-xs">
                      <div>
                        <span className="font-bold text-white">{w.symbol}</span>
                        <span className="text-[10px] text-gray-500 block">{w.companyName}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${w.price.toFixed(2)}</div>
                        <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{w.change.toFixed(1)}%
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Market News */}
          <div className="glass p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-darkBorder pb-2">
              <Newspaper size={18} className="text-accentBlue" />
              <h3 className="font-bold text-lg text-white">Market News</h3>
            </div>

            <div className="space-y-4">
              {newsList.map(news => (
                <div key={news.id} className="space-y-1 group">
                  <h4 className="text-xs font-semibold text-gray-200 group-hover:text-accentBlue transition-colors leading-snug cursor-pointer">
                    {news.title}
                  </h4>
                  <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    <span>{news.source}</span>
                    <span>{news.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
