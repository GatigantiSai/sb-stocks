import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set default authorization header if token exists
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Load user profile on mount or token change
  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await axios.get('/api/auth/profile');
      if (res.data.success) {
        setUser(res.data.data);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  // Register User
  const register = async (name, email, password, confirmPassword) => {
    try {
      const res = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        confirmPassword
      });
      if (res.data.success) {
        const { token: userToken, ...userData } = res.data.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed'
      };
    }
  };

  // Login User
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        const { token: userToken, ...userData } = res.data.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid email or password'
      };
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Update Profile Info
  const updateProfile = async (name, email) => {
    try {
      const res = await axios.put('/api/auth/profile', { name, email });
      if (res.data.success) {
        setUser(prev => ({
          ...prev,
          name: res.data.data.name,
          email: res.data.data.email
        }));
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update profile'
      };
    }
  };

  // Change Password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await axios.put('/api/auth/password', { currentPassword, newPassword });
      if (res.data.success) {
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to change password'
      };
    }
  };

  // Manually refresh user details
  const refreshUser = async () => {
    try {
      const res = await axios.get('/api/auth/profile');
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error('Failed to refresh user balance:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
