import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading';

const ProtectedRoute = ({ children, adminOnly = false, shopOwnerOnly = false }) => {
  const { isAuthenticated, loading, isAdmin, isShopOwner } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  if (shopOwnerOnly && !isShopOwner) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;