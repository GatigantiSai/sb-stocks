import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Mail, Lock, KeyRound, Save, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
  // Profile form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      return toast.warning('Name and Email cannot be empty');
    }

    setProfileLoading(true);
    const res = await updateProfile(name, email);
    setProfileLoading(false);

    if (res && res.success) {
      toast.success('Profile details updated successfully');
    } else {
      toast.error(res?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return toast.warning('Please fill in all password fields');
    }

    if (newPassword !== confirmNewPassword) {
      return toast.error('New passwords do not match');
    }

    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters long');
    }

    setPasswordLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setPasswordLoading(false);

    if (res && res.success) {
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      toast.error(res?.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Account Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account information and password.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Info Form */}
        <div className="glass p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center space-x-3 border-b border-darkBorder pb-4">
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <User size={20} />
            </span>
            <h3 className="font-bold text-lg text-white">Personal Information</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold block uppercase">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/60 border border-darkBorder text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold block uppercase">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/60 border border-darkBorder text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
                  required
                />
              </div>
            </div>

            {/* Readonly Balance for info */}
            <div className="p-3 bg-gray-900/40 border border-darkBorder rounded-xl flex justify-between items-center text-xs">
              <span className="text-gray-400 font-semibold uppercase">Account Role</span>
              <span className="font-bold text-amber-500 uppercase tracking-wide px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded">
                {user?.role}
              </span>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-accentBlue hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{profileLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>

          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center space-x-3 border-b border-darkBorder pb-4">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <KeyRound size={20} />
            </span>
            <h3 className="font-bold text-lg text-white">Change Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold block uppercase">Current Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/60 border border-darkBorder text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold block uppercase">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/60 border border-darkBorder text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
                  required
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold block uppercase">Confirm New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/60 border border-darkBorder text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue/30 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <CheckCircle size={16} />
              <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
