import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sb_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate session on initial mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('sb_access_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('sb_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          localStorage.removeItem('sb_access_token');
          localStorage.removeItem('sb_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, role, rememberMe = false) => {
    const res = await api.post('/auth/login', { email, password, role, rememberMe });
    const { accessToken, user: loggedUser } = res.data;
    localStorage.setItem('sb_access_token', accessToken);
    localStorage.setItem('sb_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    return res.data;
  };

  const verifyEmail = async (email, token) => {
    const res = await api.post('/auth/verify-email', { email, token });
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout request failed:', err.message);
    } finally {
      localStorage.removeItem('sb_access_token');
      localStorage.removeItem('sb_user');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('sb_user', JSON.stringify(res.data.user));
      return res.data.user;
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    verifyEmail,
    logout,
    refreshUser,
    isStudent: user?.role === 'Student',
    isCompany: user?.role === 'Company',
    isAcademician: user?.role === 'Academician',
    isAdmin: user?.role === 'Admin',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
