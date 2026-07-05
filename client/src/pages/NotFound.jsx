import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 bg-darkBg">
      <div className="p-4 bg-red-500/10 text-red-400 rounded-full mb-6 animate-bounce-slow">
        <ShieldAlert size={48} />
      </div>
      <h1 className="text-6xl font-black text-white mb-2">404</h1>
      <h2 className="text-2xl font-bold text-gray-300 mb-4">Page Not Found</h2>
      <p className="text-gray-500 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        to="/dashboard" 
        className="flex items-center space-x-2 bg-accentBlue hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20"
      >
        <ArrowLeft size={18} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;
