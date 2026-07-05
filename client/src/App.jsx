import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Stocks from './pages/Stocks';
import StockDetails from './pages/StockDetails';
import History from './pages/History';
import Profile from './pages/Profile';
import Watchlist from './pages/Watchlist';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageStocks from './pages/ManageStocks';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

// Layout / Components
import Navbar from './components/Navbar';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentBlue"></div>
      </div>
    );
  }
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentBlue"></div>
      </div>
    );
  }
  return token && user && user.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

const AppContent = () => {
  const { token } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-gray-100">
      {token && <Navbar />}
      <div className={`flex-1 flex flex-col ${token ? 'pt-16' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Register />} />

          {/* User Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
          <Route path="/stocks" element={<ProtectedRoute><Stocks /></ProtectedRoute>} />
          <Route path="/stocks/:symbol" element={<ProtectedRoute><StockDetails /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
          <Route path="/admin/stocks" element={<AdminRoute><ManageStocks /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <MarketProvider>
          <AppContent />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </MarketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
