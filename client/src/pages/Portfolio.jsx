import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  LineChart, 
  PieChart as PieIcon, 
  Layers,
  ArrowRight,
  RefreshCw 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Portfolio = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('holdings'); // 'holdings' or 'charts'

  const fetchPortfolioData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/portfolio');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load portfolio details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const formatCurrency = (val) => {
    return (val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6', '#6b7280'];

  const holdings = data?.holdings || [];
  const allocation = data?.allocation?.filter(a => a.value > 0) || [];
  const history = data?.history || [];

  // Format history data for Recharts area graph
  const chartHistory = history.map(item => {
    const d = new Date(item.date);
    return {
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: item.value
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Portfolio</h1>
          <p className="text-gray-400 mt-1">Track asset distribution, purchase metrics, and NAV logs.</p>
        </div>
        <button
          onClick={fetchPortfolioData}
          className="self-start sm:self-auto p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all border border-darkBorder flex items-center space-x-1.5 text-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Portfolio</span>
        </button>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Value */}
        <div className="glass p-5 rounded-2xl">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Net Asset Value (NAV)</span>
          <span className="text-2xl font-black text-white">${formatCurrency(data?.totalPortfolioValue || user?.portfolioValue)}</span>
          <div className="text-xs text-gray-400 mt-1 flex items-center space-x-1">
            <span>Cash:</span>
            <span className="font-bold text-gray-200">${formatCurrency(data?.balance || user?.balance)}</span>
          </div>
        </div>

        {/* Total Invested */}
        <div className="glass p-5 rounded-2xl">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Invested Capital</span>
          <span className="text-2xl font-black text-white">${formatCurrency(data?.totalInvested)}</span>
          <div className="text-xs text-gray-400 mt-1 flex items-center space-x-1">
            <span>Holdings value:</span>
            <span className="font-bold text-gray-200">${formatCurrency(data?.currentHoldingsValue)}</span>
          </div>
        </div>

        {/* Overall Gain/Loss */}
        <div className="glass p-5 rounded-2xl">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Overall Gain / Loss</span>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-black ${data?.overallGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {data?.overallGainLoss >= 0 ? '+' : ''}${formatCurrency(data?.overallGainLoss)}
            </span>
            <span className={`text-xs font-bold ${data?.overallGainLoss >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'} px-1.5 py-0.5 rounded`}>
              {data?.overallGainLoss >= 0 ? '+' : ''}{data?.overallGainLossPct?.toFixed(2)}%
            </span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">From cost basis</span>
        </div>

        {/* Today's gain/loss */}
        <div className="glass p-5 rounded-2xl">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Today's Returns</span>
          <span className={`text-2xl font-black ${data?.todaysGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {data?.todaysGainLoss >= 0 ? '+' : ''}${formatCurrency(data?.todaysGainLoss)}
          </span>
          <span className="text-[10px] text-gray-500 mt-1 block">Based on previous close</span>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex border-b border-darkBorder/60">
        <button
          onClick={() => setActiveTab('holdings')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'holdings'
              ? 'border-accentBlue text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Active Holdings ({holdings.length})
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'charts'
              ? 'border-accentBlue text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Performance Analytics
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="glass p-20 text-center rounded-2xl flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentBlue"></div>
          <div className="text-gray-400 text-sm">Analyzing asset portfolios...</div>
        </div>
      ) : activeTab === 'holdings' ? (
        
        /* Holdings Table */
        <div className="glass rounded-2xl shadow-xl overflow-hidden">
          {holdings.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
              <span className="p-4 bg-gray-800 text-gray-500 rounded-full">
                <Layers size={32} />
              </span>
              <h3 className="font-bold text-lg text-white">No Holdings Found</h3>
              <p className="text-gray-500 max-w-sm text-sm">
                You do not own any stocks yet. You have $100,000 USD of virtual money ready to spend. Go to stocks catalog and start trading!
              </p>
              <Link
                to="/stocks"
                className="mt-2 inline-flex items-center space-x-2 bg-accentBlue hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-blue-500/20"
              >
                <span>Browse Stocks</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-darkBorder/60">
                <thead className="bg-gray-900/40 text-left">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Shares</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Avg Cost</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Current Price</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Total Cost</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Market Value</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Today Returns</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Profit / Loss</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Trade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-darkBorder/40">
                  {holdings.map((h) => {
                    const isPositive = h.gainLoss >= 0;
                    const isTodayPositive = h.todayGainLoss >= 0;
                    return (
                      <tr key={h._id} className="hover:bg-gray-800/20 transition-all text-xs">
                        
                        {/* Asset symbol & name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-white bg-gray-900 px-2 py-1 rounded text-xs border border-darkBorder tracking-wide">
                              {h.symbol}
                            </span>
                            <span className="font-medium text-gray-300 truncate max-w-[120px]">{h.companyName}</span>
                          </div>
                        </td>

                        {/* Shares Owned */}
                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-300">
                          {h.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </td>

                        {/* Avg Cost */}
                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-300">
                          ${h.averagePrice.toFixed(2)}
                        </td>

                        {/* Current Price */}
                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-300">
                          ${h.currentPrice.toFixed(2)}
                        </td>

                        {/* Total Cost */}
                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-300">
                          ${formatCurrency(h.totalCost)}
                        </td>

                        {/* Market Value */}
                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-white">
                          ${formatCurrency(h.currentValue)}
                        </td>

                        {/* Today Returns */}
                        <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${isTodayPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isTodayPositive ? '+' : ''}${formatCurrency(h.todayGainLoss)}
                        </td>

                        {/* Profit/Loss overall */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}${formatCurrency(h.gainLoss)}
                          </div>
                          <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isPositive ? '+' : ''}{h.gainLossPct?.toFixed(2)}%
                          </span>
                        </td>

                        {/* Link back to trade details */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Link
                            to={`/stocks/${h.symbol}`}
                            className="inline-flex px-3 py-1 bg-accentBlue hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] transition-all"
                          >
                            Trade
                          </Link>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        
        /* Performance Charts tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* NAV Growth area chart */}
          <div className="lg:col-span-2 glass p-6 rounded-2xl shadow-xl flex flex-col space-y-4">
            <div>
              <h3 className="font-bold text-lg text-white">Portfolio Valuation History</h3>
              <p className="text-xs text-gray-400">Total portfolio value (cash + stocks value) over the last 30 days.</p>
            </div>
            
            <div className="h-[280px] w-full">
              {chartHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  Insufficient valuation records. Logs will build up as days progress.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartHistory}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222f47" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={10} 
                      tickLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(val) => [`$${val.toLocaleString()}`, 'Portfolio Value']}
                      contentStyle={{ backgroundColor: '#151c2c', borderColor: '#222f47' }}
                      labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Allocation Pie Chart detailed view */}
          <div className="glass p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <h3 className="font-bold text-lg text-white">Asset Allocation</h3>
              <p className="text-xs text-gray-400">Weighted distribution of your capital.</p>
            </div>

            <div className="h-[200px] w-full flex items-center justify-center">
              {allocation.length === 0 ? (
                <div className="text-gray-500 text-xs">No assets owned.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {allocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => [`$${val.toLocaleString()}`, 'Weight']}
                      contentStyle={{ backgroundColor: '#151c2c', borderColor: '#222f47' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {allocation.map((item, idx) => (
                <div key={item.name} className="flex justify-between items-center text-xs p-1.5 rounded bg-gray-900/30 border border-darkBorder/40">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="font-bold text-white uppercase">{item.name}</span>
                  </div>
                  <div className="text-right text-gray-300 font-semibold">
                    ${formatCurrency(item.value)}{' '}
                    <span className="text-gray-500 text-[10px]">
                      ({((item.value / (data?.totalPortfolioValue || 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Portfolio;
