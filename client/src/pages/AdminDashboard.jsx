import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Users, 
  Coins, 
  ArrowLeftRight, 
  TrendingUp, 
  ShieldAlert, 
  LayoutDashboard, 
  Settings, 
  Database,
  BarChart3,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/analytics');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve system statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val) => {
    return (val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const recentTrades = stats?.trades?.recent || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <span className="p-1 bg-amber-600 rounded text-white"><LayoutDashboard size={20} /></span>
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-gray-400 mt-1">Platform moderation tools, transaction tracking, and statistics.</p>
        </div>
        <button
          onClick={fetchStats}
          className="self-start sm:self-auto p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all border border-darkBorder flex items-center space-x-1.5 text-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh System Stats</span>
        </button>
      </div>

      {/* Admin quick links navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="glass p-4 rounded-xl hover:border-amber-500/40 border border-darkBorder transition-all flex items-center justify-between text-gray-200 group"
        >
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg"><Users size={18} /></span>
            <span className="font-bold text-sm">Manage User Accounts</span>
          </div>
          <span className="text-xs text-gray-500 group-hover:text-amber-500 font-bold transition-all">Open &rarr;</span>
        </Link>

        <Link
          to="/admin/stocks"
          className="glass p-4 rounded-xl hover:border-amber-500/40 border border-darkBorder transition-all flex items-center justify-between text-gray-200 group"
        >
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><Database size={18} /></span>
            <span className="font-bold text-sm">Manage Listed Stocks</span>
          </div>
          <span className="text-xs text-gray-500 group-hover:text-amber-500 font-bold transition-all">Open &rarr;</span>
        </Link>

        <Link
          to="/admin/analytics"
          className="glass p-4 rounded-xl hover:border-amber-500/40 border border-darkBorder transition-all flex items-center justify-between text-gray-200 group"
        >
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg"><BarChart3 size={18} /></span>
            <span className="font-bold text-sm">System Analytics</span>
          </div>
          <span className="text-xs text-gray-500 group-hover:text-amber-500 font-bold transition-all">Open &rarr;</span>
        </Link>
      </div>

      {loading ? (
        <div className="glass p-20 text-center rounded-2xl flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <div className="text-gray-400 text-sm">Summarizing core ledger data...</div>
        </div>
      ) : (
        <>
          {/* Stats Deck */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Users */}
            <div className="glass p-5 rounded-2xl flex items-center space-x-4">
              <span className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Users size={24} />
              </span>
              <div>
                <span className="text-[10px] text-gray-500 font-semibold block uppercase">Total Users Registered</span>
                <span className="text-xl font-black text-white">{stats?.users?.total} Users</span>
                <span className="text-[10px] text-gray-500 block">Active: {stats?.users?.active} | Suspended: {stats?.users?.suspended}</span>
              </div>
            </div>

            {/* Total Portfolios value */}
            <div className="glass p-5 rounded-2xl flex items-center space-x-4">
              <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Coins size={24} />
              </span>
              <div>
                <span className="text-[10px] text-gray-500 font-semibold block uppercase">Virtual Assets Managed</span>
                <span className="text-xl font-black text-white">${formatCurrency(stats?.financials?.totalPortfolios)}</span>
                <span className="text-[10px] text-gray-500 block">Total User Cash: ${formatCurrency(stats?.financials?.totalBalances)}</span>
              </div>
            </div>

            {/* Volume traded */}
            <div className="glass p-5 rounded-2xl flex items-center space-x-4">
              <span className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                <ArrowLeftRight size={24} />
              </span>
              <div>
                <span className="text-[10px] text-gray-500 font-semibold block uppercase">Total Value Traded</span>
                <span className="text-xl font-black text-white">${formatCurrency(stats?.financials?.totalValueTraded)}</span>
                <span className="text-[10px] text-gray-500 block">Across {stats?.trades?.total} transactions</span>
              </div>
            </div>

            {/* System Status */}
            <div className="glass p-5 rounded-2xl flex items-center space-x-4">
              <span className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                <TrendingUp size={24} />
              </span>
              <div>
                <span className="text-[10px] text-gray-500 font-semibold block uppercase">Platform Status</span>
                <span className="text-xl font-black text-emerald-400 uppercase tracking-wider">ONLINE</span>
                <span className="text-[10px] text-gray-500 block">Node.js Server Port 5000</span>
              </div>
            </div>

          </div>

          {/* Recent Trades log table */}
          <div className="glass p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-white">Live System Trade Logs (Last 10)</h3>

            {recentTrades.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No transactions completed yet on this platform.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-darkBorder/60 text-left text-xs">
                  <thead className="bg-gray-900/40 font-semibold text-gray-400 uppercase">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">User Details</th>
                      <th className="px-4 py-3">Symbol</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Shares</th>
                      <th className="px-4 py-3 text-right">Share Price</th>
                      <th className="px-4 py-3 text-right">Total Trade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-darkBorder/40">
                    {recentTrades.map(tx => (
                      <tr key={tx._id} className="text-gray-300 font-semibold">
                        
                        {/* Time */}
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(tx.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>

                        {/* User email & name */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{tx.user?.name || 'Deleted User'}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{tx.user?.email || 'N/A'}</div>
                        </td>

                        {/* Ticker */}
                        <td className="px-4 py-3">
                          <span className="font-extrabold text-white bg-gray-900 px-1.5 py-0.5 rounded text-[10px] border border-darkBorder tracking-wider">
                            {tx.symbol}
                          </span>
                        </td>

                        {/* Trade Type */}
                        <td className="px-4 py-3">
                          <span className={`uppercase font-bold text-[9px] px-1.5 py-0.5 rounded ${
                            tx.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>

                        {/* Quantity */}
                        <td className="px-4 py-3 text-right font-semibold text-gray-300">
                          {tx.quantity}
                        </td>

                        {/* Share Price */}
                        <td className="px-4 py-3 text-right font-semibold text-gray-300">
                          ${tx.price.toFixed(2)}
                        </td>

                        {/* Total Trade */}
                        <td className="px-4 py-3 text-right font-bold text-white">
                          ${tx.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </>
      )}

    </div>
  );
};

export default AdminDashboard;
