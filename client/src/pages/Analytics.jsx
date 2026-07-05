import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  BarChart3, 
  ChevronLeft, 
  RefreshCw, 
  PieChart as PieIcon, 
  Coins, 
  TrendingUp 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/analytics');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load system analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (val) => {
    return (val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const sectorData = stats?.sectors?.map(s => ({
    name: s._id || 'Unknown',
    count: s.count
  })) || [];

  const tradeDistribution = [
    { name: 'BUY Orders', value: stats?.trades?.buys || 0 },
    { name: 'SELL Orders', value: stats?.trades?.sells || 0 }
  ].filter(t => t.value > 0);

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];
  const SECTOR_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6', '#6b7280', '#10b981', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button */}
      <div>
        <Link to="/admin" className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={16} />
          <span>Back to Control Panel</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <span className="p-1 bg-purple-650 bg-purple-600 rounded text-white"><BarChart3 size={20} /></span>
            <span>Platform Analytics</span>
          </h1>
          <p className="text-gray-400 mt-1">Global platform metrics, sector distribution, and trade analytics.</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="self-start sm:self-auto p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all border border-darkBorder flex items-center space-x-1.5 text-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {loading ? (
        <div className="glass p-20 text-center rounded-2xl flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <div className="text-gray-400 text-sm">Aggregating analytical distributions...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sector breakdown bar chart */}
          <div className="lg:col-span-2 glass p-6 rounded-2xl shadow-xl flex flex-col space-y-4">
            <div>
              <h3 className="font-bold text-lg text-white">Stock Listings by Sector</h3>
              <p className="text-xs text-gray-400">Total volume count of mock stocks registered under each category.</p>
            </div>

            <div className="h-[300px] w-full">
              {sectorData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  No stocks registered in database.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222f47" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af" 
                      fontSize={8} 
                      tickLine={false} 
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <Tooltip 
                      formatter={(val) => [val, 'Stocks count']}
                      contentStyle={{ backgroundColor: '#151c2c', borderColor: '#222f47' }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]}>
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Trade distribution pie chart */}
          <div className="glass p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-bold text-lg text-white">Trade Distribution</h3>
              <p className="text-xs text-gray-400">Breakdown ratio of BUY vs SELL orders executed across platform.</p>
            </div>

            <div className="h-[220px] w-full flex items-center justify-center">
              {tradeDistribution.length === 0 ? (
                <div className="text-gray-500 text-xs text-center border-2 border-dashed border-darkBorder rounded-full w-40 h-40 flex items-center justify-center">
                  No transactions logged yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tradeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {tradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => [val, 'Count']}
                      contentStyle={{ backgroundColor: '#151c2c', borderColor: '#222f47' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="space-y-2 border-t border-darkBorder/40 pt-4 text-xs font-semibold">
              <div className="flex justify-between text-gray-400">
                <span>Total Transactions</span>
                <span className="text-white font-bold">{stats?.trades?.total}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>BUY Orders</span>
                <span className="text-emerald-400 font-bold">{stats?.trades?.buys}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>SELL Orders</span>
                <span className="text-red-400 font-bold">{stats?.trades?.sells}</span>
              </div>
            </div>
          </div>

          {/* Aggregates overview */}
          <div className="lg:col-span-3 glass p-6 rounded-2xl shadow-xl">
            <h3 className="font-bold text-base text-white mb-4">Financial Liquidity Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-4 bg-gray-900/50 border border-darkBorder rounded-xl flex items-center space-x-4">
                <span className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Coins size={22} />
                </span>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">Aggregate Cash Pools</span>
                  <span className="text-lg font-black text-white">${formatCurrency(stats?.financials?.totalBalances)}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-900/50 border border-darkBorder rounded-xl flex items-center space-x-4">
                <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <TrendingUp size={22} />
                </span>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">Aggregate Assets Valuation</span>
                  <span className="text-lg font-black text-white">
                    ${formatCurrency((stats?.financials?.totalPortfolios || 0) - (stats?.financials?.totalBalances || 0))}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-900/50 border border-darkBorder rounded-xl flex items-center space-x-4">
                <span className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                  <BarChart3 size={22} />
                </span>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">Total System Valuation</span>
                  <span className="text-lg font-black text-white">${formatCurrency(stats?.financials?.totalPortfolios)}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Analytics;
