import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  LayoutDashboard, 
  Briefcase, 
  Eye, 
  History as HistoryIcon, 
  User as UserIcon, 
  LogOut, 
  Shield, 
  Menu, 
  X 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Stocks', path: '/stocks', icon: TrendingUp },
    { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { name: 'Watchlist', path: '/watchlist', icon: Eye },
    { name: 'History', path: '/history', icon: HistoryIcon },
    { name: 'Profile', path: '/profile', icon: UserIcon }
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass border-b border-darkBorder shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 text-xl font-extrabold text-white tracking-wider">
              <span className="p-1.5 bg-accentBlue rounded-lg text-white shadow-md">
                <TrendingUp size={24} />
              </span>
              <span>SB <span className="text-accentBlue">STOCKS</span></span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-accentBlue text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Admin Portal link */}
            {user && user.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/25'
                    : 'text-amber-500 hover:text-white hover:bg-amber-500/10'
                }`}
              >
                <Shield size={16} />
                <span>Admin Portal</span>
              </Link>
            )}
          </div>

          {/* User Balance & Logout Info */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Cash Balance</div>
              <div className="text-sm font-bold text-emerald-400">
                ${user?.balance !== undefined ? user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <div className="text-right text-xs mr-1">
              <div className="text-[10px] text-gray-500 font-semibold">CASH</div>
              <div className="font-bold text-emerald-400">${user?.balance?.toFixed(2) || '0.00'}</div>
            </div>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-darkBorder animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-accentBlue text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            
            {user && user.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium transition-all ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-500 hover:text-white hover:bg-amber-500/10'
                }`}
              >
                <Shield size={18} />
                <span>Admin Portal</span>
              </Link>
            )}
            
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium text-red-400 hover:text-white hover:bg-red-600/20 transition-all"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
