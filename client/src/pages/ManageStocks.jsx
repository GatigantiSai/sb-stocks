import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Database, 
  Search, 
  Plus, 
  X, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Loader2 
} from 'lucide-react';

const ManageStocks = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Query states
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form states (Add/Edit Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedStockId, setSelectedStockId] = useState(null);
  
  const [symbol, setSymbol] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('Technology');
  const [industry, setIndustry] = useState('');
  const [price, setPrice] = useState('');
  const [previousClose, setPreviousClose] = useState('');
  const [marketCap, setMarketCap] = useState('');
  const [exchange, setExchange] = useState('NASDAQ');
  const [volume, setVolume] = useState('');
  const [submittingForm, setSubmittingForm] = useState(false);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/stocks', {
        params: {
          search,
          page,
          limit: 10
        }
      });
      if (res.data.success) {
        setStocks(res.data.data);
        setTotalPages(res.data.pages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load stock list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStocks();
  };

  // Open modal for adding stock
  const openAddModal = () => {
    setModalMode('add');
    setSelectedStockId(null);
    setSymbol('');
    setCompanyName('');
    setSector('Technology');
    setIndustry('');
    setPrice('');
    setPreviousClose('');
    setMarketCap('');
    setExchange('NASDAQ');
    setVolume('');
    setIsModalOpen(true);
  };

  // Open modal for editing stock
  const openEditModal = (stock) => {
    setModalMode('edit');
    setSelectedStockId(stock._id);
    setSymbol(stock.symbol);
    setCompanyName(stock.companyName);
    setSector(stock.sector);
    setIndustry(stock.industry || '');
    setPrice(stock.price);
    setPreviousClose(stock.previousClose || '');
    setMarketCap(stock.marketCap || '');
    setExchange(stock.exchange || 'NASDAQ');
    setVolume(stock.volume || '');
    setIsModalOpen(true);
  };

  // Handle Form Submission (Add/Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!symbol || !companyName || !price) {
      return toast.warning('Symbol, Company Name, and Price are required');
    }

    setSubmittingForm(true);
    try {
      const bodyData = {
        symbol,
        companyName,
        sector,
        industry,
        price: parseFloat(price),
        previousClose: parseFloat(previousClose) || parseFloat(price),
        marketCap: parseFloat(marketCap) || 0,
        exchange,
        volume: parseFloat(volume) || 0
      };

      if (modalMode === 'add') {
        const res = await axios.post('/api/admin/stocks', bodyData);
        if (res.data.success) {
          toast.success(res.data.message || 'Stock created successfully');
          setIsModalOpen(false);
          setPage(1);
          fetchStocks();
        }
      } else {
        const res = await axios.put(`/api/admin/stocks/${selectedStockId}`, bodyData);
        if (res.data.success) {
          toast.success(res.data.message || 'Stock updated successfully');
          setIsModalOpen(false);
          fetchStocks();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Handle deleting a stock
  const handleDeleteStock = async (stockId, stockSymbol) => {
    const confirmDelete = window.confirm(`⚠️ Are you sure you want to delete stock "${stockSymbol}"?\nThis removes the asset listing from the platform.`);
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(`/api/admin/stocks/${stockId}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Stock deleted successfully');
        
        // Remove locally
        setStocks(prev => prev.filter(s => s._id !== stockId));
        setTotalCount(prev => prev - 1);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete stock asset');
    }
  };

  const sectorOptions = [
    'Technology',
    'Financials',
    'Healthcare',
    'Consumer Discretionary',
    'Consumer Staples',
    'Energy',
    'Industrials',
    'Communication Services',
    'Real Estate',
    'Utilities',
    'Other'
  ];

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
            <span className="p-1 bg-emerald-600 rounded text-white"><Database size={20} /></span>
            <span>Manage Listed Stocks</span>
          </h1>
          <p className="text-gray-400 mt-1">Add new mock stocks, modify pricing data, and delete stock assets.</p>
        </div>
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center space-x-1.5 text-sm"
          >
            <Plus size={16} />
            <span>Add Stock Asset</span>
          </button>
          <button
            onClick={fetchStocks}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all border border-darkBorder"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Queries Panel */}
      <div className="glass p-5 rounded-2xl shadow-xl">
        <form onSubmit={handleSearchSubmit} className="max-w-md">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticker symbol or company name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/60 border border-darkBorder text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
            />
          </div>
        </form>
      </div>

      {/* Stocks table */}
      <div className="glass rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            <div className="text-gray-400 text-sm">Searching stock listings database...</div>
          </div>
        ) : stocks.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <span className="text-3xl">📭</span>
            <h3 className="font-bold text-lg text-white">No Stocks Found</h3>
            <p className="text-gray-500 text-sm">Clear your search parameters and try again.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-darkBorder/60 text-left text-xs">
              <thead className="bg-gray-900/40 text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Sector</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">Market Cap</th>
                  <th className="px-6 py-4 text-right">Exchange</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/40">
                {stocks.map(s => (
                  <tr key={s._id} className="hover:bg-gray-800/10 text-gray-300 font-semibold transition-all">
                    
                    {/* Symbol */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-extrabold text-white bg-gray-900 px-2 py-1 rounded text-xs border border-darkBorder tracking-wider">
                        {s.symbol}
                      </span>
                    </td>

                    {/* Company */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-200">
                      {s.companyName}
                    </td>

                    {/* Sector */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {s.sector}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-white">
                      ${s.price?.toFixed(2)}
                    </td>

                    {/* Market Cap */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-400">
                      ${((s.marketCap || 0) / 1000000000).toFixed(2)}B
                    </td>

                    {/* Exchange */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-450 uppercase">
                      {s.exchange}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2.5">
                        
                        {/* Edit button */}
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 bg-gray-900 border border-darkBorder hover:border-amber-500/50 hover:bg-amber-500/10 text-gray-500 hover:text-amber-500 rounded-lg transition-all"
                          title="Edit Stock details"
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteStock(s._id, s.symbol)}
                          className="p-1.5 bg-gray-900 border border-darkBorder hover:border-red-500/50 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-all"
                          title="Delete Stock Listing"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-900/30 px-6 py-4 border-t border-darkBorder/60 flex items-center justify-between text-xs">
            <div className="text-gray-400">
              Showing <span className="font-semibold text-white">{stocks.length}</span> of{' '}
              <span className="font-semibold text-white">{totalCount}</span> assets
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

      {/* Dynamic Slide-in Modal for Stock Editing/Creation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-fadeIn border border-darkBorder overflow-y-auto max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-darkBorder pb-4 mb-4">
              <h3 className="font-bold text-lg text-white">
                {modalMode === 'add' ? 'Add Stock Asset' : `Edit Stock Details: ${symbol}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-gray-400 uppercase">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Ticker Symbol */}
                <div className="space-y-1.5">
                  <label className="block">Symbol Ticker</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="e.g. MSFT"
                    disabled={modalMode === 'edit'}
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-900 border border-darkBorder text-white font-bold focus:outline-none uppercase"
                    required
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="block">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Microsoft Corporation"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-900 border border-darkBorder text-white font-bold focus:outline-none normal-case"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Sector */}
                <div className="space-y-1.5">
                  <label className="block">Sector Category</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-900 border border-darkBorder text-white font-bold focus:outline-none"
                  >
                    {sectorOptions.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                {/* Industry */}
                <div className="space-y-1.5">
                  <label className="block">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Infrastructure Software"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-900 border border-darkBorder text-white font-bold focus:outline-none normal-case"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-1.5">
                  <label className="block">Current Share Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="100.00"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-900 border border-darkBorder text-white font-bold focus:outline-none"
                    required
                  />
                </div>

                {/* Previous Close */}
                <div className="space-y-1.5">
                  <label className="block">Previous Close Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={previousClose}
                    onChange={(e) => setPreviousClose(e.target.value)}
                    placeholder="100.00"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-900 border border-darkBorder text-white font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Market Cap */}
                <div className="space-y-1.5">
                  <label className="block">Market Cap ($)</label>
                  <input
                    type="number"
                    value={marketCap}
                    onChange={(e) => setMarketCap(e.target.value)}
                    placeholder="1500000000"
                    className="w-full px-2 py-2.5 rounded-lg bg-gray-900 border border-darkBorder text-white font-bold focus:outline-none"
                  />
                </div>

                {/* Volume */}
                <div className="space-y-1.5">
                  <label className="block">Volume Traded</label>
                  <input
                    type="number"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    placeholder="1000000"
                    className="w-full px-2 py-2.5 rounded-lg bg-gray-900 border border-darkBorder text-white font-bold focus:outline-none"
                  />
                </div>

                {/* Exchange */}
                <div className="space-y-1.5">
                  <label className="block">Exchange</label>
                  <input
                    type="text"
                    value={exchange}
                    onChange={(e) => setExchange(e.target.value)}
                    placeholder="NASDAQ"
                    className="w-full px-2 py-2.5 rounded-lg bg-gray-900 border border-darkBorder text-white font-bold focus:outline-none uppercase"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submittingForm}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submittingForm ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Executing Request...</span>
                  </>
                ) : (
                  <span>{modalMode === 'add' ? 'Create Stock Listing' : 'Save Asset Details'}</span>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageStocks;
