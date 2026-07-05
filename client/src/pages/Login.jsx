import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { TrendingUp, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.warning('Please fill in all fields');
    }
    
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res && res.success) {
      toast.success('Welcome back to SB Stocks!');
      navigate('/dashboard');
    } else {
      toast.error(res?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-6 relative">
      
      {/* Glow effects */}
      <div className="absolute top-[20%] left-[30%] w-[350px] h-[350px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[30%] w-[350px] h-[350px] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        
        {/* Logo Banner */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-black tracking-wider text-white">
            <span className="p-2 bg-accentBlue rounded-xl text-white shadow-lg">
              <TrendingUp size={28} />
            </span>
            <span>SB <span className="text-accentBlue">STOCKS</span></span>
          </Link>
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Sign in to your paper portfolio</p>
        </div>

        {/* Card */}
        <div className="glass p-8 rounded-2xl shadow-2xl">
          <h2 className="text-xl font-bold mb-6 text-white text-center">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold block uppercase">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/80 border border-darkBorder text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold block uppercase">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/80 border border-darkBorder text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-accentBlue hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-accentBlue hover:underline font-semibold">
              Create Account
            </Link>
          </div>

        </div>

        {/* Guest Credentials for quick review */}
        <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-center text-xs text-gray-500">
          <span className="font-semibold text-blue-400 block mb-1">💡 Demo Accounts:</span>
          <div>User: <span className="text-gray-300 font-mono">john@example.com</span> | Pass: <span className="text-gray-300 font-mono">password123</span></div>
          <div>Admin: <span className="text-gray-300 font-mono">admin@example.com</span> | Pass: <span className="text-gray-300 font-mono">admin123</span></div>
        </div>

      </div>
    </div>
  );
};

export default Login;
