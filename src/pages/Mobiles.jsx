// src/pages/Mobiles.jsx - نسخه نهایی
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Mobiles.css';

const Mobiles = () => {
  const navigate = useNavigate();
  const [mobiles, setMobiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [endpoint, setEndpoint] = useState('');

  const API_BASE_URL = 'https://back-end-v2-qxa5.onrender.com';

  useEffect(() => {
    fetchMobiles();
  }, []);

  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('authToken');
  };

  const fetchMobiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      
      if (!token) {
        setError('لطفاً ابتدا وارد سیستم شوید');
        alert('لطفاً ابتدا وارد سیستم شوید');
        navigate('/login');
        return;
      }

      // endpointهای ممکن
      const possibleEndpoints = [
        '/api/admin/purchases',
        '/api/purchases',
        '/api/purchase',
        '/api/purchase/all',
        '/api/items'
      ];

      let apiResponse = null;
      let foundEndpoint = '';

      // تست endpointها
      for (const ep of possibleEndpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${ep}`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            apiResponse = await response.json();
            foundEndpoint = ep;
            break;
          }
        } catch (err) {
          console.log(`${ep} خطا: ${err.message}`);
        }
      }

      if (!apiResponse) {
        throw new Error('نقطه دسترسی API پیدا نشد');
      }

      setEndpoint(foundEndpoint);
      localStorage.setItem('api_endpoint', foundEndpoint);

      // پردازش داده‌های دریافتی
      processApiData(apiResponse);
      
    } catch (err) {
      console.error('خطا در دریافت موبایل‌ها:', err);
      setError(err.message);
      setMobiles([]); // خالی کردن لیست در صورت خطا
    } finally {
      setLoading(false);
    }
  };

  const processApiData = (data) => {
    if (Array.isArray(data)) {
      setMobiles(data);
    } else if (data && typeof data === 'object') {
      // جستجوی آرایه در object
      const possibleArrayKeys = ['purchases', 'items', 'data', 'list', 'results'];
      
      for (const key of possibleArrayKeys) {
        if (Array.isArray(data[key])) {
          setMobiles(data[key]);
          return;
        }
      }
      
      // اگر آرایه پیدا نشد
      setMobiles([]);
    } else {
      setMobiles([]);
    }
  };

  const filteredMobiles = mobiles.filter(mobile => {
    const matchesSearch = searchTerm === '' || 
      mobile.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mobile.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mobile.imei1?.includes(searchTerm) ||
      mobile.sellerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || mobile.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddMobile = () => {
    navigate('/mobiles/add');
  };

  const handleViewMobile = (id) => {
    navigate(`/mobiles/${id}`);
  };

  const handleEditMobile = (id) => {
    navigate(`/mobiles/edit/${id}`);
  };

  const handleDeleteMobile = async (id) => {
    if (!window.confirm('آیا از حذف این موبایل مطمئنید؟')) return;
    
    try {
      const token = getToken();
      const currentEndpoint = endpoint || localStorage.getItem('api_endpoint');
      
      if (currentEndpoint) {
        const response = await fetch(`${API_BASE_URL}${currentEndpoint}/${id}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          setMobiles(prev => prev.filter(mobile => mobile._id !== id));
          alert('موبایل با موفقیت حذف شد');
        } else {
          throw new Error('حذف انجام نشد');
        }
      }
    } catch (err) {
      alert('خطا در حذف موبایل');
      console.error('Delete error:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'نامشخص';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR');
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'نامشخص';
    return price.toLocaleString('fa-IR') + ' افغانی';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { text: 'فعال', color: '#065f46', bgColor: '#d1fae5' },
      'sold': { text: 'فروخته', color: '#92400e', bgColor: '#fef3c7' },
      'available': { text: 'موجود', color: '#065f46', bgColor: '#d1fae5' },
      'inactive': { text: 'غیرفعال', color: '#991b1b', bgColor: '#fee2e2' }
    };
    
    const config = statusConfig[status] || { text: status, color: '#475569', bgColor: '#f1f5f9' };
    
    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '500',
        backgroundColor: config.bgColor,
        color: config.color
      }}>
        {config.text}
      </span>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('api_endpoint');
    navigate('/login');
  };

  const refreshData = () => {
    fetchMobiles();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
  };

  return (
    <div className="mobiles-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <h1><span className="header-icon">📱</span>لیست موبایل‌ها</h1>
            <p className="page-description">
              مدیریت و مشاهده اطلاعات موبایل‌های ثبت‌شده در سیستم
            </p>
          </div>
          
          <div className="header-actions">
            <button className="btn btn-primary" onClick={handleAddMobile}>
              <span>➕</span> ثبت موبایل جدید
            </button>
            <button className="btn btn-secondary" onClick={refreshData}>
              <span>🔄</span> بروزرسانی لیست
            </button>
            <button 
              className="btn" 
              onClick={handleLogout}
              style={{ backgroundColor: '#fef3c7', color: '#92400e' }}
            >
              <span>🚪</span> خروج
            </button>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <span>📋</span>
            </div>
            <div className="stat-info">
              <span className="stat-label">کل موبایل‌ها</span>
              <span className="stat-value">{mobiles.length}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon available">
              <span>✅</span>
            </div>
            <div className="stat-info">
              <span className="stat-label">فعال</span>
              <span className="stat-value">
                {mobiles.filter(m => m.status === 'active').length}
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon value">
              <span>💰</span>
            </div>
            <div className="stat-info">
              <span className="stat-label">میانگین قیمت</span>
              <span className="stat-value">
                {mobiles.length > 0 
                  ? formatPrice(mobiles.reduce((sum, m) => sum + (m.price || 0), 0) / mobiles.length)
                  : formatPrice(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="active-filters" style={{
        backgroundColor: '#d1fae5',
        borderColor: '#10b981'
      }}>
        <div className="filters-tags">
          <span style={{ color: '#065f46', fontWeight: '500' }}>
            ✅ متصل به سرور 
          </span>
          
          {endpoint && (
            <>
              <span style={{ margin: '0 10px', color: '#94a3b8' }}>|</span>
              <span style={{ color: '#475569', fontSize: '0.9em' }}>
                 <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                  {endpoint}
                </code>
              </span>
            </>
          )}
          
          <span style={{ margin: '0 10px', color: '#94a3b8' }}>|</span>
          <span style={{ color: '#475569', fontSize: '0.9em' }}>
            تعداد: <strong>{filteredMobiles.length}</strong> از {mobiles.length} موبایل
          </span>
          
          <button 
            className="clear-filters-btn" 
            onClick={clearFilters}
            style={{ color: '#3b82f6', marginRight: '10px' }}
          >
            🗑️ پاک کردن فیلترها
          </button>
        </div>
      </div>

      {error && (
        <div className="active-filters" style={{backgroundColor: '#fee', borderColor: '#f99'}}>
          <div className="filters-tags">
            <span style={{color: '#c00'}}>⚠️ {error}</span>
            <button 
              className="clear-filters-btn" 
              onClick={() => setError(null)}
              style={{marginRight: '10px'}}
            >
              ✕ بستن
            </button>
            <button 
              className="clear-filters-btn" 
              onClick={refreshData}
              style={{color: '#3b82f6'}}
            >
              🔄 تلاش مجدد
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" style={{
            fontSize: '3rem',
            animation: 'spin 1s linear infinite'
          }}>⏳</div>
          <p>در حال بارگذاری موبایل‌ها از سرور...</p>
        </div>
      ) : (
        <>
          <div className="search-filter-bar">
            <div className="search-box">
              <input 
                type="text" 
                className="search-input" 
                placeholder="جستجو بر اساس برند، مدل یا IMEI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="filter-actions">
              <div className="filter-group" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.9em' }}>وضعیت:</span>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    background: 'white',
                    color: '#475569',
                    fontSize: '0.9em'
                  }}
                >
                  <option value="all">همه</option>
                  <option value="active">فعال</option>
                  <option value="sold">فروخته شده</option>
                  <option value="inactive">غیرفعال</option>
                </select>
              </div>
              
              <div className="view-toggle">
                <button className="view-btn active">📋 جدول</button>
                <button className="view-btn">🟦 کارت</button>
              </div>
            </div>
          </div>

          <div className="table-container" style={{overflowX: 'auto'}}>
            {filteredMobiles.length === 0 ? (
              <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                background: 'white',
                borderRadius: '12px',
                color: '#64748b'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📭</div>
                <h3 style={{ color: '#475569', marginBottom: '10px' }}>
                  {mobiles.length === 0 ? 'هیچ موبایلی ثبت نشده است' : 'هیچ موبایلی یافت نشد'}
                </h3>
                <p>
                  {mobiles.length === 0 
                    ? 'برای شروع، اولین موبایل را ثبت کنید.' 
                    : 'هیچ موبایلی با فیلترهای انتخاب شده مطابقت ندارد.'}
                </p>
                {mobiles.length === 0 && (
                  <button 
                    onClick={handleAddMobile}
                    style={{
                      marginTop: '20px',
                      padding: '10px 20px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    ➕ ثبت اولین موبایل
                  </button>
                )}
              </div>
            ) : (
              <table className="mobiles-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{backgroundColor: '#f8fafc'}}>
                    <th style={{padding: '12px', textAlign: 'right', borderBottom: '2px solid #e2e8f0'}}>شناسه</th>
                    <th style={{padding: '12px', textAlign: 'right', borderBottom: '2px solid #e2e8f0'}}>برند</th>
                    <th style={{padding: '12px', textAlign: 'right', borderBottom: '2px solid #e2e8f0'}}>مدل</th>
                    <th style={{padding: '12px', textAlign: 'right', borderBottom: '2px solid #e2e8f0'}}>IMEI</th>
                    <th style={{padding: '12px', textAlign: 'right', borderBottom: '2px solid #e2e8f0'}}>قیمت</th>
                    <th style={{padding: '12px', textAlign: 'right', borderBottom: '2px solid #e2e8f0'}}>وضعیت</th>
                    <th style={{padding: '12px', textAlign: 'right', borderBottom: '2px solid #e2e8f0'}}>فروشنده</th>
                    <th style={{padding: '12px', textAlign: 'right', borderBottom: '2px solid #e2e8f0'}}>تاریخ ثبت</th>
                    <th style={{padding: '12px', textAlign: 'right', borderBottom: '2px solid #e2e8f0'}}>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMobiles.map(mobile => (
                    <tr key={mobile._id} style={{borderBottom: '1px solid #e2e8f0'}}>
                      <td style={{padding: '12px', fontFamily: 'monospace', fontSize: '0.9em'}}>
                        #{mobile._id ? mobile._id.slice(-6) : 'N/A'}
                      </td>
                      <td style={{padding: '12px'}}>{mobile.brand || 'نامشخص'}</td>
                      <td style={{padding: '12px'}}>{mobile.model || '—'}</td>
                      <td style={{padding: '12px', fontFamily: 'monospace'}}>
                        {mobile.imei1 || mobile.imei || '—'}
                      </td>
                      <td style={{padding: '12px', fontWeight: 'bold'}}>
                        {formatPrice(mobile.price)}
                      </td>
                      <td style={{padding: '12px'}}>
                        {getStatusBadge(mobile.status)}
                      </td>
                      <td style={{padding: '12px'}}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{mobile.sellerName || '—'}</div>
                          {mobile.sellerPhone && (
                            <div style={{ fontSize: '0.85em', color: '#64748b', marginTop: '4px' }}>
                              {mobile.sellerPhone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{padding: '12px'}}>{formatDate(mobile.createdAt)}</td>
                      <td style={{padding: '12px'}}>
                        <div style={{display: 'flex', gap: '8px'}}>
                          <button 
                            className="action-btn view-btn"
                            onClick={() => handleViewMobile(mobile._id)}
                            style={{
                              padding: '6px 12px',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              backgroundColor: '#dbeafe',
                              fontSize: '14px'
                            }}
                          >
                            👁️ مشاهده
                          </button>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => handleEditMobile(mobile._id)}
                            style={{
                              padding: '6px 12px',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              backgroundColor: '#fef3c7',
                              fontSize: '14px'
                            }}
                          >
                            ✏️ ویرایش
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteMobile(mobile._id)}
                            style={{
                              padding: '6px 12px',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              fontSize: '14px'
                            }}
                          >
                            🗑️ حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {filteredMobiles.length > 0 && (
            <div className="pagination-section">
              <div className="pagination-info">
                نمایش ۱ تا {filteredMobiles.length} از {mobiles.length} مورد
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Mobiles;
