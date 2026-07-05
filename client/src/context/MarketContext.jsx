import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const MarketContext = createContext();

export const useMarket = () => useContext(MarketContext);

export const MarketProvider = ({ children }) => {
  const { token } = useAuth();
  
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Fetch top gainers, losers, and sectors
  const fetchMarketSummary = async () => {
    if (!token) return;
    setLoadingSummary(true);
    try {
      const [gRes, lRes, sRes] = await Promise.all([
        axios.get('/api/stocks/market/gainers'),
        axios.get('/api/stocks/market/losers'),
        axios.get('/api/stocks/market/sectors')
      ]);
      if (gRes.data.success) setGainers(gRes.data.data);
      if (lRes.data.success) setLosers(lRes.data.data);
      if (sRes.data.success) setSectors(sRes.data.data);
    } catch (err) {
      console.error('Error fetching market summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Fetch watchlist
  const fetchWatchlist = async () => {
    if (!token) return;
    setWatchlistLoading(true);
    try {
      const res = await axios.get('/api/watchlist');
      if (res.data.success) {
        setWatchlist(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching watchlist:', err);
    } finally {
      setWatchlistLoading(false);
    }
  };

  // Add stock to watchlist
  const addToWatchlist = async (stockId) => {
    try {
      const res = await axios.post('/api/watchlist', { stockId });
      if (res.data.success) {
        setWatchlist(res.data.data);
        toast.success(res.data.message || 'Added to watchlist');
        return { success: true };
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to watchlist');
      return { success: false };
    }
  };

  // Remove stock from watchlist
  const removeFromWatchlist = async (stockId) => {
    try {
      const res = await axios.delete(`/api/watchlist/${stockId}`);
      if (res.data.success) {
        setWatchlist(res.data.data);
        toast.info(res.data.message || 'Removed from watchlist');
        return { success: true };
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove from watchlist');
      return { success: false };
    }
  };

  // Poll market summary and watchlist data every 15 seconds to simulate active trading
  useEffect(() => {
    if (token) {
      fetchMarketSummary();
      fetchWatchlist();
      
      const interval = setInterval(() => {
        fetchMarketSummary();
        fetchWatchlist();
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <MarketContext.Provider
      value={{
        gainers,
        losers,
        sectors,
        watchlist,
        loadingSummary,
        watchlistLoading,
        fetchMarketSummary,
        fetchWatchlist,
        addToWatchlist,
        removeFromWatchlist
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};
