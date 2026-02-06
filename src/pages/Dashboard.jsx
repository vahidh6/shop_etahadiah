import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPurchases: 0,
    todayPurchases: 0,
    recentPurchases: [],
    loading: true
  });
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchRealData();
  }, []);

  // دریافت داده‌های واقعی از API
  const fetchRealData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 1. دریافت خریدها
      const purchasesResponse = await fetch('https://back-end-v2-qxa5.onrender.com/api/purchases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      let purchases = [];
      if (purchasesResponse.ok) {
        purchases = await purchasesResponse.json();
      }
      
      // 2. محاسبه آمار واقعی
      const today = new Date().toISOString().split('T')[0];
      const todayPurchases = purchases.filter(p => {
        if (!p.date && !p.createdAt) return false;
        const purchaseDate = p.date || p.createdAt;
        return purchaseDate.includes(today);
      });
      
      // 3. 5 خرید آخر
      const recentPurchases = purchases.slice(0, 5);
      
      setStats({
        totalPurchases: purchases.length,
        todayPurchases: todayPurchases.length,
        recentPurchases: recentPurchases,
        loading: false
      });
      
    } catch (error) {
      console.error('خطا در دریافت داده‌ها:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('با موفقیت خارج شدید');
    navigate('/');
  };

  const refreshData = () => {
    setStats(prev => ({ ...prev, loading: true }));
    fetchRealData();
  };

  // استایل‌ها
  const styles = {
    container: {
      direction: 'rtl',
      background: '#f8fafc',
      minHeight: '100vh'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '25px 30px'
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    welcome: {
      margin: 0,
      fontSize: '14px',
      opacity: 0.9
    },
    logoutBtn: {
      padding: '8px 16px',
      background: 'rgba(255,255,255,0.2)',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '6px',
      cursor: 'pointer'
    },
    mainTitle: {
      fontSize: '28px',
      margin: '0 0 10px 0'
    },
    subtitle: {
      margin: 0,
      opacity: 0.8,
      fontSize: '16px'
    },
    content: {
      padding: '30px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      background: 'white',
      borderRadius: '12px',
      marginBottom: '30px',
      border: '2px dashed #e2e8f0'
    },
    emptyIcon: {
      fontSize: '64px',
      color: '#cbd5e1',
      marginBottom: '20px'
    },
    emptyTitle: {
      color: '#64748b',
      fontSize: '20px',
      marginBottom: '10px'
    },
    emptyText: {
      color: '#94a3b8',
      fontSize: '16px',
      marginBottom: '25px'
    },
    addButton: {
      padding: '12px 24px',
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-block'
    },
    statsCard: {
      background: 'white',
      padding: '25px',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '40px'
    },
    statValue: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#1e293b',
      margin: '10px 0'
    },
    statLabel: {
      color: '#64748b',
      fontSize: '16px',
      margin: 0
    },
    recentPurchases: {
      background: 'white',
      padding: '25px',
      borderRadius: '12px',
      marginBottom: '30px'
    },
    sectionTitle: {
      color: '#334155',
      fontSize: '20px',
      margin: '0 0 20px 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    refreshBtn: {
      padding: '8px 16px',
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    purchaseList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    purchaseItem: {
      padding: '15px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    purchaseName: {
      margin: 0,
      color: '#1e293b',
      fontSize: '16px'
    },
    purchaseDetails: {
      color: '#64748b',
      fontSize: '14px',
      margin: '5px 0 0 0'
    },
    noData: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#94a3b8'
    },
    loading: {
      textAlign: 'center',
      padding: '50px 20px',
      color: '#64748b',
      fontSize: '18px'
    }
  };

  if (stats.loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          🔄 در حال دریافت داده‌های واقعی...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* هدر */}
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <p style={styles.welcome}>
            👤 خوش آمدید، {user.name || user.username || 'کاربر'}
          </p>
          <button 
            onClick={handleLogout}
            style={styles.logoutBtn}
          >
            خروج
          </button>
        </div>
        
        <h1 style={styles.mainTitle}>داشبورد مدیریت</h1>
        <p style={styles.subtitle}>
          آمار واقعی سیستم - {new Date().toLocaleDateString('fa-IR')}
        </p>
      </header>

      {/* محتوا */}
      <main style={styles.content}>
        {/* اگر داده‌ای وجود ندارد */}
        {stats.totalPurchases === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyTitle}>هنوز داده‌ای ثبت نشده است</h3>
            <p style={styles.emptyText}>
              سیستم آماده دریافت اطلاعات است. اولین خرید را ثبت کنید.
            </p>
            <button 
              onClick={() => navigate('/mobiles/add')}
              style={styles.addButton}
            >
              ➕ ثبت اولین خرید
            </button>
          </div>
        )}

        {/* کارت‌های آماری */}
        <div style={styles.statsGrid}>
          <div style={styles.statsCard}>
            <div style={{ fontSize: '24px', color: '#667eea' }}>🛒</div>
            <div style={styles.statValue}>{stats.totalPurchases}</div>
            <p style={styles.statLabel}>کل خریدها</p>
          </div>
          
          <div style={styles.statsCard}>
            <div style={{ fontSize: '24px', color: '#10b981' }}>📅</div>
            <div style={styles.statValue}>{stats.todayPurchases}</div>
            <p style={styles.statLabel}>خریدهای امروز</p>
          </div>
          
          <div style={styles.statsCard}>
            <div style={{ fontSize: '24px', color: '#f59e0b' }}>👥</div>
            <div style={styles.statValue}>1</div>
            <p style={styles.statLabel}>کاربران فعال</p>
          </div>
        </div>

        {/* آخرین خریدها */}
        <div style={styles.recentPurchases}>
          <div style={styles.sectionTitle}>
            <span>آخرین خریدها</span>
            <button 
              onClick={refreshData}
              style={styles.refreshBtn}
            >
              🔄 به‌روزرسانی
            </button>
          </div>
          
          {stats.recentPurchases.length === 0 ? (
            <div style={styles.noData}>
              📝 هنوز خریدی ثبت نشده است
            </div>
          ) : (
            <ul style={styles.purchaseList}>
              {stats.recentPurchases.map((purchase, index) => (
                <li key={index} style={styles.purchaseItem}>
                  <div>
                    <h4 style={styles.purchaseName}>
                      {purchase.mobileName || purchase.brand || `خرید ${index + 1}`}
                    </h4>
                    <p style={styles.purchaseDetails}>
                      {purchase.sellerName || 'نامشخص'} | 
                      قیمت: {purchase.price?.toLocaleString() || '۰'} تومان
                    </p>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>
                    {purchase.date ? new Date(purchase.date).toLocaleDateString('fa-IR') : 'تاریخ نامشخص'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* منوی سریع */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div 
            onClick={() => navigate('/mobiles')}
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px solid #e2e8f0'
            }}
          >
            <div style={{ fontSize: '32px', color: '#3b82f6' }}>📱</div>
            <h3>لیست خریدها</h3>
          </div>
          
          <div 
            onClick={() => navigate('/mobiles/add')}
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px solid #e2e8f0'
            }}
          >
            <div style={{ fontSize: '32px', color: '#10b981' }}>➕</div>
            <h3>خرید جدید</h3>
          </div>
          
          <div 
            onClick={() => navigate('/reports')}
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px solid #e2e8f0'
            }}
          >
            <div style={{ fontSize: '32px', color: '#f59e0b' }}>📊</div>
            <h3>گزارشات</h3>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;