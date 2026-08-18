import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

// Create context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===== INITIALIZE: Restore token from localStorage on mount =====
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      // Verify token is still valid by fetching current user
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // ===== VERIFY TOKEN: Check if saved token is still valid =====
  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${tokenToVerify}` },
      });
      setUser(response.data.user);
      setToken(tokenToVerify);
    } catch (error) {
      console.log('Token expired or invalid');
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ===== SIGNUP =====
  const signup = async (name, email, password, latitude, longitude) => {
    try {
      const response = await apiClient.post('/auth/signup', {
        name,
        email,
        password,
        latitude,
        longitude,
      });
      const { token: newToken, user: newUser } = response.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('authToken', newToken);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Signup failed' };
    }
  };

  // ===== LOGIN =====
  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      const { token: newToken, user: newUser } = response.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('authToken', newToken);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  // ===== LOGOUT =====
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  // ===== UPDATE PROFILE =====
  const updateProfile = async (profileData) => {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Update failed' };
    }
  };

  const value = {
    user,
    token,
    loading,
    signup,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
