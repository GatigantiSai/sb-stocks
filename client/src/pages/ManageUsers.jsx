import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Users, 
  Search, 
  UserX, 
  UserCheck, 
  Trash2, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Query states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users', {
        params: {
          search,
          status,
          page,
          limit: 10
        }
      });
      if (res.data.success) {
        setUsers(res.data.data);
        setTotalPages(res.data.pages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve user accounts directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleSuspend = async (user) => {
    try {
      const res = await axios.put(`/api/admin/users/${user._id}/suspend`);
      if (res.data.success) {
        toast.info(res.data.message);
        
        // Update user state locally
        setUsers(prev => prev.map(u => 
          u._id === user._id 
            ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
            : u
        ));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Suspension toggle failed');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const doubleConfirm = window.confirm(`⚠️ WARNING: Are you absolutely sure you want to delete user "${userName}"?\nThis will permanently delete their account, holdings, transaction history, and watchlist. This action CANNOT be undone.`);
    if (!doubleConfirm) return;

    try {
      const res = await axios.delete(`/api/admin/users/${userId}`);
      if (res.data.success) {
        toast.success(res.data.message || 'User deleted successfully');
        
        // Remove user locally
        setUsers(prev => prev.filter(u => u._id !== userId));
        setTotalCount(prev => prev - 1);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

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
            <span className="p-1 bg-blue-500 rounded text-white"><Users size={20} /></span>
            <span>Manage User Accounts</span>
          </h1>
          <p className="text-gray-400 mt-1">Audit profile registries, manage account status, and purge accounts.</p>
        </div>
        <button
          onClick={fetchUsers}
          className="self-start sm:self-auto p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all border border-darkBorder flex items-center space-x-1.5 text-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Queries Panel */}
      <div className="glass p-5 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <form onSubmit={handleSearchSubmit} className="w-full md:w-auto flex-1 max-w-md">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/60 border border-darkBorder text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
            />
          </div>
        </form>

        <div className="flex items-center space-x-2 self-end md:self-auto">
          <span className="text-xs text-gray-400 font-semibold uppercase">Status:</span>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3.5 py-2 rounded-xl bg-gray-900/60 border border-darkBorder text-xs text-white focus:outline-none"
          >
            <option value="All">All Users</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>

      </div>

      {/* Users table */}
      <div className="glass rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <div className="text-gray-400 text-sm">Searching user registry...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <span className="p-4 bg-gray-800 text-gray-500 rounded-full">
              <ShieldAlert size={32} />
            </span>
            <h3 className="font-bold text-lg text-white">No Users Found</h3>
            <p className="text-gray-500 text-sm">No registered user matches your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-darkBorder/60 text-left text-xs">
              <thead className="bg-gray-900/40 text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Register Date</th>
                  <th className="px-6 py-4">User Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Cash Balance</th>
                  <th className="px-6 py-4 text-right">Portfolio Value</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/40">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-800/10 text-gray-300 font-semibold transition-all">
                    
                    {/* Created Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Name & Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-white text-sm">{u.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{u.email}</div>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    {/* Balance */}
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-200">
                      ${u.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Portfolio value */}
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-white">
                      ${u.portfolioValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2.5">
                        
                        {/* Suspend button */}
                        <button
                          onClick={() => handleToggleSuspend(u)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            u.status === 'active'
                              ? 'bg-red-500/10 border-red-500/10 text-red-400 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                          title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                        >
                          {u.status === 'active' ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-1.5 bg-gray-900 border border-darkBorder hover:border-red-500/50 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-all"
                          title="Permanently Delete User"
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="bg-gray-900/30 px-6 py-4 border-t border-darkBorder/60 flex items-center justify-between text-xs">
            <div className="text-gray-400">
              Showing <span className="font-semibold text-white">{users.length}</span> of{' '}
              <span className="font-semibold text-white">{totalCount}</span> users
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="p-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-gray-300 border border-darkBorder transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-gray-400">
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

    </div>
  );
};

export default ManageUsers;
