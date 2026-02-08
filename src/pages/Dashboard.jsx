import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './DashboardResponsive.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalPurchases: 0,
    todayPurchases: 0,
    recentPurchases: [],
    loading: true,
    connected: false,
    endpoint: '',
    error: null,
    lastUpdated: null
  });
  
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  const API_BASE_URL = 'https://back-end-v2-qxa5.onrender.com';
  const CORRECT_ENDPOINT = '/api/admin/purchases';

  // بررسی اتصال و اعتبارسنجی توکن
  const checkConnection = useCallback(async () => {
    try {
      console.log('🔄 Starting connection check...');
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      // بررسی وجود توکن
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      console.log('🔑 Token found:', !!token);
      
      if (!token) {
        console.warn('⚠️ No token found, redirecting to login');
        toast.error('لطفاً ابتدا وارد سیستم شوید');
        navigate('/login');
        return;
      }

      // بررسی اعتبار توکن
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token structure');
        }
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('📝 Token payload:', payload);
        
        const expirationTime = payload.exp * 1000;
        if (Date.now() > expirationTime) {
          toast.error('توکن منقضی شده است. لطفاً مجدد وارد شوید');
          navigate('/login');
          return;
        }
        console.log('✅ Token is valid');
      } catch (tokenError) {
        console.error('❌ Token validation error:', tokenError);
        toast.error('توکن نامعتبر است. لطفاً مجدد وارد شوید');
        navigate('/login');
        return;
      }

      // درخواست به سرور
      const fullUrl = `${API_BASE_URL}${CORRECT_ENDPOINT}`;
      console.log(`📡 Fetching from: ${fullUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout');
        controller.abort();
      }, 15000);
      
      const startTime = Date.now();
      
      const response = await fetch(fullUrl, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      console.log(`⏱️ Response time: ${responseTime}ms`);
      console.log(`📊 Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Data received:', data);
        
        // پردازش داده‌ها
        let purchases = [];
        
        if (Array.isArray(data)) {
          purchases = data;
          console.log('📊 Data is direct array');
        } else if (data && typeof data === 'object') {
          console.log('🔍 Searching for array in object...');
          
          const possibleKeys = ['purchases', 'data', 'items', 'list', 'results', 'records'];
          for (const key of possibleKeys) {
            if (Array.isArray(data[key])) {
              console.log(`✅ Found array in key: "${key}" with ${data[key].length} items`);
              purchases = data[key];
              break;
            }
          }
          
          if (purchases.length === 0) {
            Object.keys(data).forEach(key => {
              if (Array.isArray(data[key])) {
                console.log(`✅ Found array in key: "${key}" with ${data[key].length} items`);
                purchases = data[key];
              }
            });
          }
        }
        
        console.log(`📦 Total purchases processed: ${purchases.length}`);
        
        // محاسبه آمار
        const today = new Date().toISOString().split('T')[0];
        const todayPurchases = purchases.filter(p => {
          if (!p) return false;
          const purchaseDate = p.createdAt || p.purchaseDate || p.date || p.created_at;
          if (!purchaseDate) return false;
          
          try {
            const dateStr = new Date(purchaseDate).toISOString().split('T')[0];
            return dateStr === today;
          } catch {
            return purchaseDate.includes(today);
          }
        });

        // 5 خرید آخر
        const recentPurchases = purchases
          .slice(0, 5)
          .filter(p => p)
          .map(p => ({
            id: p._id || p.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
            brand: p.brand || p.phoneBrand || 'نامشخص',
            model: p.model || p.phoneModel || '—',
            price: p.price || p.purchasePrice || 0,
            sellerName: p.sellerName || p.seller || p.shopName || '—',
            sellerPhone: p.sellerPhone || p.phone || p.sellerPhoneNumber || '—',
            date: p.createdAt || p.purchaseDate || p.date || p.created_at || new Date().toISOString(),
            status: p.status || (p.sold ? 'sold' : 'active') || 'active',
            imei: p.imei || p.imei1 || p.imeiNumber || '—'
          }));

        setStats({
          totalPurchases: purchases.length,
          todayPurchases: todayPurchases.length,
          recentPurchases: recentPurchases,
          loading: false,
          connected: true,
          endpoint: CORRECT_ENDPOINT,
          error: null,
          lastUpdated: new Date().toISOString()
        });

        if (purchases.length > 0) {
          toast.success(`✅ ${purchases.length} خرید دریافت شد (${responseTime}ms)`);
        } else {
          toast.info('📭 هنوز خریدی در سیستم ثبت نشده است');
        }

      } else if (response.status === 401) {
        console.warn('⚠️ Unauthorized (401)');
        toast.error('دسترسی غیرمجاز. لطفاً مجدداً وارد سیستم شوید');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        navigate('/login');
      } else if (response.status === 403) {
        console.warn('⚠️ Forbidden (403)');
        toast.error('شما دسترسی لازم برای مشاهده این بخش را ندارید');
        setStats(prev => ({ 
          ...prev, 
          loading: false, 
          connected: false,
          endpoint: 'دسترسی ممنوع',
          error: 'شما دسترسی لازم برای مشاهده این بخش را ندارید'
        }));
      } else if (response.status === 404) {
        console.warn('⚠️ Not Found (404)');
        console.log('📝 Response text:', await response.text());
        toast.error('آدرس API یافت نشد. لطفاً با پشتیبانی تماس بگیرید');
        setStats(prev => ({ 
          ...prev, 
          loading: false, 
          connected: false,
          endpoint: 'یافت نشد',
          error: `آدرس ${CORRECT_ENDPOINT} یافت نشد`
        }));
      } else {
        console.error(`❌ Server error: ${response.status}`);
        const errorText = await response.text();
        console.error('Error text:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

    } catch (error) {
      console.error('❌ Connection error:', error);
      
      let errorMessage = 'خطا در اتصال به سرور';
      if (error.name === 'AbortError') {
        errorMessage = 'سرور در زمان مقرر پاسخ نداد (15 ثانیه timeout)';
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage = 'سرور یافت نشد. لطفاً اتصال اینترنت و آدرس سرور را بررسی کنید';
      }
      
      toast.error(errorMessage);
      setStats(prev => ({ 
        ...prev, 
        loading: false, 
        connected: false,
        endpoint: 'قطع ارتباط',
        error: `${errorMessage}: ${error.message}`,
        lastUpdated: new Date().toISOString()
      }));
    }
  }, [navigate]);

  useEffect(() => {
    console.log('🚀 Dashboard component mounted');
    console.log('🔗 API Base URL:', API_BASE_URL);
    console.log('🔗 Correct Endpoint:', CORRECT_ENDPOINT);
    
    // بررسی اولیه اتصال
    checkConnection();
    
    // دریافت اطلاعات کاربر
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('👤 User from localStorage:', parsedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('❌ Error parsing user:', e);
        setUser({ name: 'مدیر', role: 'مدیر سیستم' });
      }
    } else {
      setUser({ name: 'مدیر', role: 'مدیر سیستم' });
    }
  }, [checkConnection]);

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    toast.success('با موفقیت خارج شدید');
    navigate('/login');
  };

  const handleAddPurchase = () => {
    navigate('/mobiles/add');
  };

  const handleViewPurchases = () => {
    navigate('/mobiles');
  };

  const handleViewShops = () => {
    navigate('/shops');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'نامشخص';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'نامشخص';
    return new Intl.NumberFormat('fa-IR').format(price) + ' افغانی';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { color: '#10b981', bg: '#d1fae5', text: 'فعال' },
      'فعال': { color: '#10b981', bg: '#d1fae5', text: 'فعال' },
      'sold': { color: '#f59e0b', bg: '#fef3c7', text: 'فروخته شده' },
      'فروخته شده': { color: '#f59e0b', bg: '#fef3c7', text: 'فروخته شده' },
      'در انتظار': { color: '#3b82f6', bg: '#dbeafe', text: 'در انتظار' },
      'pending': { color: '#3b82f6', bg: '#dbeafe', text: 'در انتظار' }
    };
    
    const defaultStatus = { color: '#6b7280', bg: '#f3f4f6', text: status || 'نامشخص' };
    return statusMap[status] || defaultStatus;
  };

  // نمایش صفحه loading
  if (stats.loading) {
    return (
      <div className="loading-state">
        <div className="loading-icon">🔄</div>
        <h3 className="loading-title">در حال اتصال به سرور...</h3>
        <p className="loading-description">
          در حال برقراری ارتباط با سرور و دریافت اطلاعات
        </p>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
        <div className="loading-info">
          <div><strong>آدرس سرور:</strong> {API_BASE_URL}</div>
          <div><strong>Endpoint:</strong> {CORRECT_ENDPOINT}</div>
          <div><strong>کنسول را بررسی کنید:</strong> F12 → Console</div>
        </div>
      </div>
    );
  }

  // اگر به سرور متصل نیستیم
  if (!stats.connected) {
    return (
      <div className="error-state">
        <div className="error-icon">🚫</div>
        <h1 className="error-title">اتصال برقرار نشد</h1>
        
        <div className="error-details">
          <p className="error-message">
            <strong>خطا:</strong> {stats.error || 'سرور پاسخ نمی‌دهد'}
          </p>
          <div className="error-info">
            <div><strong>آدرس درخواستی:</strong> {API_BASE_URL}{CORRECT_ENDPOINT}</div>
            <div><strong>آخرین بروزرسانی:</strong> {stats.lastUpdated ? formatTime(stats.lastUpdated) : 'نامشخص'}</div>
          </div>
        </div>
        
        <div className="error-solutions">
          <p><strong>راه‌حل‌ها:</strong></p>
          <ul>
            <li>کنترل‌کننده (F12) را باز کرده و Console را بررسی کنید</li>
            <li>اطمینان از فعال بودن سرور {API_BASE_URL}</li>
            <li>بررسی اتصال اینترنت</li>
            <li>تماس با پشتیبانی فنی</li>
          </ul>
        </div>
        
        <div className="error-actions">
          <button 
            className="action-button secondary"
            onClick={checkConnection}
          >
            <span>🔄</span>
            تلاش مجدد
          </button>
          <button 
            className="action-button"
            onClick={handleLogout}
            style={{ background: '#6b7280' }}
          >
            <span>🚪</span>
            خروج
          </button>
        </div>
      </div>
    );
  }

  // نمایش داشبورد اصلی
  return (
    <div className="dashboard-container">
      {/* هدر */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-main">
            <div>
              <h1 className="header-title">📊 داشبورد مدیریت</h1>
              <div className="header-info">
                <span className="status-badge">✅ متصل</span>
                <span className="endpoint-badge">{stats.endpoint}</span>
                {stats.lastUpdated && (
                  <span className="last-updated">
                    آخرین بروزرسانی: {formatTime(stats.lastUpdated)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="header-user">
              <div className="user-info">
                <div className="user-name">👤 {user.name || 'مدیر سیستم'}</div>
                <div className="user-role">{user.role || 'مدیر'}</div>
              </div>
              <button 
                className="logout-btn"
                onClick={handleLogout}
              >
                <span>🚪</span>
                خروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* محتوا */}
      <main className="dashboard-main">
        {/* اگر داده‌ای وجود ندارد */}
        {stats.totalPurchases === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3 className="empty-title">هنوز خریدی ثبت نشده است</h3>
            <p className="empty-description">
              سیستم با موفقیت به سرور متصل شده است اما هنوز خریدی در دیتابیس وجود ندارد.
            </p>
            <div className="empty-actions">
              <button 
                className="action-button primary"
                onClick={handleAddPurchase}
              >
                <span>➕</span>
                ثبت اولین خرید
              </button>
              <button 
                className="action-button secondary"
                onClick={checkConnection}
              >
                <span>🔄</span>
                بروزرسانی
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* کارت‌های آماری */}
            <div className="stats-grid">
              <div 
                className="stat-card"
                onClick={handleViewPurchases}
              >
                <div className="stat-icon" style={{ color: '#667eea' }}>🛒</div>
                <div className="stat-value">{stats.totalPurchases}</div>
                <p className="stat-label">کل خریدها</p>
                <div className="stat-subtext">مشاهده همه →</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{ color: '#10b981' }}>📅</div>
                <div className="stat-value">{stats.todayPurchases}</div>
                <p className="stat-label">خریدهای امروز</p>
                <div className="stat-subtext">{formatDate(new Date().toISOString())}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{ color: '#8b5cf6' }}>💰</div>
                <div className="stat-value">
                  {formatPrice(stats.recentPurchases.length > 0 ? 
                    Math.round(stats.recentPurchases.reduce((sum, p) => sum + (p.price || 0), 0) / stats.recentPurchases.length) : 0)}
                </div>
                <p className="stat-label">میانگین قیمت</p>
                <div className="stat-subtext">بر اساس {stats.recentPurchases.length} خرید</div>
              </div>
              
              <div 
                className="stat-card"
                onClick={handleViewShops}
              >
                <div className="stat-icon" style={{ color: '#f59e0b' }}>🏪</div>
                <div className="stat-value">
                  {stats.recentPurchases.reduce((count, p) => {
                    const shops = new Set(stats.recentPurchases.map(p => p.sellerName));
                    return shops.size;
                  }, 0) || 1}
                </div>
                <p className="stat-label">فروشگاه‌ها</p>
                <div className="stat-subtext">مدیریت فروشگاه‌ها →</div>
              </div>
            </div>

            {/* آخرین خریدها */}
            <div className="recent-purchases">
              <div className="recent-header">
                <h3 className="recent-title">
                  <span>📋</span>
                  آخرین خریدها
                  <span className="count-badge">
                    {stats.recentPurchases.length} مورد
                  </span>
                </h3>
                <div className="recent-actions">
                  <button 
                    className="action-btn secondary"
                    onClick={checkConnection}
                  >
                    <span>🔄</span>
                    بروزرسانی
                  </button>
                  <button 
                    className="action-btn primary"
                    onClick={handleViewPurchases}
                  >
                    <span>📱</span>
                    مشاهده همه
                  </button>
                </div>
              </div>
              
              {stats.recentPurchases.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 20px', margin: 0 }}>
                  <div className="empty-icon">📝</div>
                  <p className="empty-title">هنوز خریدی ثبت نشده است</p>
                </div>
              ) : (
                <div className="recent-grid">
                  {stats.recentPurchases.map((purchase) => {
                    const status = getStatusBadge(purchase.status);
                    return (
                      <div
                        key={purchase.id}
                        className="purchase-card"
                        onClick={() => purchase.id && navigate(`/mobiles/${purchase.id}`)}
                      >
                        <div className="purchase-header">
                          <div className="purchase-title">
                            <h4>{purchase.brand} {purchase.model}</h4>
                            <p>فروشنده: {purchase.sellerName}</p>
                          </div>
                          <span 
                            className="purchase-status"
                            style={{
                              backgroundColor: status.bg,
                              color: status.color
                            }}
                          >
                            {status.text}
                          </span>
                        </div>
                        
                        <div className="purchase-details">
                          <div className="detail-row">
                            <span className="detail-label">قیمت:</span>
                            <span className="detail-value">
                              {formatPrice(purchase.price)}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">IMEI:</span>
                            <span className="imei-value">
                              {purchase.imei}
                            </span>
                          </div>
                          <div className="purchase-footer">
                            <span className="purchase-date">
                              {formatDate(purchase.date)}
                            </span>
                            <span className="view-details">
                              مشاهده جزئیات →
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* منوی سریع */}
        <div className="quick-menu-grid">
          <div 
            className="menu-card blue"
            onClick={handleViewPurchases}
          >
            <div className="menu-icon">📱</div>
            <h3 className="menu-title">خریدهای موبایل</h3>
            <p className="menu-description">
              مشاهده و مدیریت تمام خریدها
            </p>
          </div>
          
          <div 
            className="menu-card green"
            onClick={handleAddPurchase}
          >
            <div className="menu-icon">➕</div>
            <h3 className="menu-title">خرید جدید</h3>
            <p className="menu-description">
              ثبت خرید جدید در سیستم
            </p>
          </div>
          
          <div 
            className="menu-card orange"
            onClick={handleViewShops}
          >
            <div className="menu-icon">🏪</div>
            <h3 className="menu-title">فروشگاه‌ها</h3>
            <p className="menu-description">
              مدیریت فروشگاه‌های همکار
            </p>
          </div>
          
          <div 
            className="menu-card purple"
            onClick={() => toast.success('سیستم آماده است!')}
          >
            <div className="menu-icon">📊</div>
            <h3 className="menu-title">وضعیت سیستم</h3>
            <p className="menu-description">
              سلامت و عملکرد سیستم
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
