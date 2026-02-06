import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// صفحات
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard';
import AddMobile from './pages/AddMobile';
import Mobiles from './pages/Mobiles';
import Reports from './pages/Reports';
import ShopOwners from './pages/ShopOwners';
import Profile from './pages/Profile';

// کامپوننت Protected Route
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// صفحه 404
const NotFound = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    direction: 'rtl',
    background: '#f8fafc'
  }}>
    <h1 style={{ fontSize: '120px', margin: 0, color: '#64748b' }}>۴۰۴</h1>
    <h2 style={{ color: '#334155' }}>صفحه مورد نظر یافت نشد</h2>
    <p style={{ color: '#64748b', marginBottom: '30px' }}>
      ممکن است آدرس را اشتباه وارد کرده باشید یا صفحه حذف شده باشد.
    </p>
    <button
      onClick={() => window.location.href = '/'}
      style={{
        padding: '12px 24px',
        background: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer'
      }}
    >
      بازگشت به صفحه اصلی
    </button>
  </div>
);

// کامپوننت Layout اصلی
const Layout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#f8fafc' }}>
      {/* هدر */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px' }}>🏪 کتابچه الکترونیکی اتحادیه مبایل فروشان ولایت هرات </h2>
          <small style={{ opacity: 0.8 }}>سیستم مدیریت خرید موبایل</small>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>{user.name || user.username || 'کاربر'}</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>{user.role === 'admin' ? 'مدیر سیستم' : 'کاربر'}</div>
          </div>
          
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            خروج
          </button>
        </div>
      </header>

      {/* نوار کناری و محتوا */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
        {/* منوی کناری */}
        <aside style={{
          width: '250px',
          background: 'white',
          borderLeft: '1px solid #e2e8f0',
          padding: '20px 0',
          boxShadow: '2px 0 10px rgba(0,0,0,0.05)'
        }}>
          <nav>
            {[
              { path: '/dashboard', label: '🏠 داشبورد', icon: '🏠' },
              { path: '/mobiles', label: '📱 خریدهای موبایل', icon: '📱' },
              { path: '/mobiles/add', label: '➕ خرید جدید', icon: '➕' },
              { path: '/reports', label: '📊 گزارشات', icon: '📊' },
              { path: '/shop-owners', label: '🏪 فروشگاه‌ها', icon: '🏪' },
              { path: '/profile', label: '👤 پروفایل', icon: '👤' }
            ].map((item, index) => (
              <a
                key={index}
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 20px',
                  color: window.location.pathname === item.path ? '#667eea' : '#475569',
                  textDecoration: 'none',
                  fontSize: '15px',
                  borderRight: window.location.pathname === item.path ? '4px solid #667eea' : 'none',
                  background: window.location.pathname === item.path ? '#f1f5f9' : 'transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = window.location.pathname === item.path ? '#f1f5f9' : 'transparent';
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>
          
          {/* اطلاعات API */}
          <div style={{
            marginTop: '30px',
            padding: '15px',
            background: '#f8fafc',
            borderRadius: '8px',
            margin: '20px',
            fontSize: '12px',
            color: '#64748b',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🌐 اتصال API:</div>
            <div style={{ wordBreak: 'break-all', fontSize: '11px' }}>
              back-end-v2-qxa5.onrender.com
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px' }}>
              وضعیت: <span style={{ color: '#10b981', fontWeight: 'bold' }}>متصل</span>
            </div>
          </div>
        </aside>

        {/* محتوای اصلی */}
        <main style={{ flex: 1, padding: '30px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

// کامپوننت اصلی App
function App() {
  return (
    <Router>
      <Routes>
        {/* صفحه ورود (عمومی) */}
        <Route path="/" element={<Login />} />
        
        {/* صفحات با احراز هویت */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/mobiles" element={
          <ProtectedRoute>
            <Layout>
              <Mobiles />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/mobiles/add" element={
          <ProtectedRoute>
            <Layout>
              <AddMobile />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/shop-owners" element={
          <ProtectedRoute>
            <Layout>
              <ShopOwners />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* صفحه 404 */}
        <Route path="/404" element={<NotFound />} />
        
        {/* هدایت تمام مسیرهای نامشخص به 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-left"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            direction: 'rtl',
            fontFamily: 'Vazirmatn, sans-serif',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </Router>
  );
}

export default App;
