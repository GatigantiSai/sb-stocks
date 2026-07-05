import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { TrendingUp, User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      return toast.warning('Please fill in all fields');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }

    setSubmitting(true);
    const res = await register(name, email, password, confirmPassword);
    setSubmitting(false);

    if (res && res.success) {
      toast.success('Account created successfully! Starting balance: $100,000 USD');
      navigate('/dashboard');
    } else {
      toast.error(res?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-6 relative">
      
      {/* Glow effects */}
      <div className="absolute top-[20%] left-[30%] w-[350px] h-[350px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[30%] w-[350px] h-[350px] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        
        {/* Logo Banner */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-black tracking-wider text-white">
            <span className="p-2 bg-accentBlue rounded-xl text-white shadow-lg">
              <TrendingUp size={28} />
            </span>
            <span>SB <span className="text-accentBlue">STOCKS</span></span>
          </Link>
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-semibold">Join the paper stock market</p>
        </div>

        {/* Card */}
        <div className="glass p-8 rounded-2xl shadow-2xl">
          <h2 className="text-xl font-bold mb-6 text-white text-center">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold block uppercase">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-900/80 border border-darkBorder text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
                  required
                />
              </div>
            </div>

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
                  placeholder="john@example.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-900/80 border border-darkBorder text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
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
                  placeholder="At least 6 characters"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-900/80 border border-darkBorder text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
                  required
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold block uppercase">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-900/80 border border-darkBorder text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-accentBlue hover:underline font-semibold">
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
