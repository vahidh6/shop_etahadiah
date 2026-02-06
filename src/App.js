import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './App.css';

// کامپوننت‌ها - بهتر است در فایل‌های جداگانه باشند
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import AddMobile from './components/Mobiles/AddMobile';
import MobileList from './components/Mobiles/MobileList';
import ShopOwners from './components/ShopOwners/ShopOwners';
import Reports from './components/Reports/Reports';

// کامپوننت Protected Route
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    toast.error('لطفاً ابتدا وارد شوید');
    return <Navigate to="/" replace />;
  }

  if (adminOnly && userRole !== 'admin') {
    toast.error('دسترسی غیرمجاز');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/mobiles" element={
          <ProtectedRoute>
            <MobileList />
          </ProtectedRoute>
        } />
        
        <Route path="/mobiles/add" element={
          <ProtectedRoute>
            <AddMobile />
          </ProtectedRoute>
        } />
        
        <Route path="/shop-owners" element={
          <ProtectedRoute adminOnly>
            <ShopOwners />
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute adminOnly>
            <Reports />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;