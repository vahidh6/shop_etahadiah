import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isShopOwner, setIsShopOwner] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = authService.getCurrentUser();
      
      if (token && storedUser) {
        setUser(storedUser);
        setIsAdmin(storedUser.role === 'admin');
        setIsShopOwner(storedUser.role === 'shopOwner');
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      setIsAdmin(data.user.role === 'admin');
      setIsShopOwner(data.user.role === 'shopOwner');
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAdmin(false);
    setIsShopOwner(false);
  };

  const value = {
    user,
    loading,
    isAdmin,
    isShopOwner,
    login,
    logout,
    isAuthenticated: authService.isAuthenticated()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};