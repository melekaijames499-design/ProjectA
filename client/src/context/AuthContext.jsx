import React, { createContext, useState, useEffect } from 'react';
import { login as loginApi, logout as logoutApi, getMe } from '../api/auth.api';
import { setAccessToken, registerAuthHandlers } from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize new token and user updates from Axios interceptor
  const handleTokenRefreshed = (newAccessToken, updatedUser) => {
    setAccessToken(newAccessToken);
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  const handleLogoutTrigger = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('isAuthenticated');
  };

  // Register Axios refresh/logout handlers on boot
  useEffect(() => {
    registerAuthHandlers(handleTokenRefreshed, handleLogoutTrigger);
    
    // Check if session is already active
    const checkActiveSession = async () => {
      // If we don't have this, avoid unnecessary request (or just run it to let cookie refresh take place)
      const isAuthHint = localStorage.getItem('isAuthenticated');
      if (isAuthHint) {
        try {
          // Trigger refresh to retrieve initial access token
          const axios = await import('axios');
          const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          
          const res = await axios.default.post(
            `${VITE_API_URL}/api/auth/refresh`, 
            {}, 
            { withCredentials: true }
          );
          
          const token = res.data.data.accessToken;
          const u = res.data.data.user;
          
          setAccessToken(token);
          setUser(u);
        } catch (err) {
          console.log('No active session found or refresh token expired.');
          localStorage.removeItem('isAuthenticated');
        }
      }
      setLoading(false);
    };

    checkActiveSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      // Backend wraps response in { success, data, message } — unwrap with .data
      const token = res.data.accessToken;
      const u = res.data.user;

      setAccessToken(token);
      setUser(u);
      localStorage.setItem('isAuthenticated', 'true');
      return u;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error('Logout request failed:', err.message);
    } finally {
      handleLogoutTrigger();
    }
  };

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
