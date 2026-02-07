import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const ShopOwners = () => {
  const [shopOwners, setShopOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [endpoint, setEndpoint] = useState('');

  const API_BASE_URL = 'https://back-end-v2-qxa5.onrender.com';

  useEffect(() => {
    fetchShopOwners();
  }, []);

  const fetchShopOwners = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('لطفاً ابتدا وارد سیستم شوید');
        toast.error('لطفاً ابتدا وارد سیستم شوید');
        return;
      }

      // endpointهای فروشگاه
      const shopEndpoints = [
        '/api/admin/shops',
        '/api/shops',
        '/api/admin/users',
        '/api/users'
      ];

      let shopsData = null;
      let foundEndpoint = '';

      // تست endpointها
      for (const ep of shopEndpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${ep}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            shopsData = await response.json();
            foundEndpoint = ep;
            console.log(`✅ ${ep} - داده دریافتی:`, shopsData);
            break;
          }
        } catch (err) {
          console.log(`${ep} خطا: ${err.message}`);
        }
      }

      if (!shopsData) {
        // اگر هیچ endpointی کار نکرد، از خریدها استخراج کن
        await extractShopsFromPurchases(token);
        return;
      }

      setEndpoint(foundEndpoint);
      localStorage.setItem('shop_endpoint', foundEndpoint);

      // پردازش داده‌ها بر اساس ساختارهای مختلف
      processShopData(shopsData);
      
    } catch (error) {
      console.error('خطا در دریافت فروشگاه‌ها:', error);
      setError('خطا در اتصال به سرور');
      toast.error('خطا در دریافت اطلاعات');
      setShopOwners([]);
    } finally {
      setLoading(false);
    }
  };

  // استخراج فروشگاه‌ها از داده‌های خرید
  const extractShopsFromPurchases = async (token) => {
    try {
      console.log('🔍 استخراج فروشگاه‌ها از خریدها...');
      
      // endpointهای خرید
      const purchaseEndpoints = [
        '/api/admin/purchases',
        '/api/purchases',
        '/api/purchase/all'
      ];
      
      let purchasesData = null;
      
      for (const ep of purchaseEndpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${ep}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            purchasesData = await response.json();
            console.log(`✅ خریدها از ${ep} دریافت شد:`, purchasesData.length);
            break;
          }
        } catch (err) {
          console.log(`${ep} خطا: ${err.message}`);
        }
      }

      if (!purchasesData || !Array.isArray(purchasesData)) {
        setError('داده‌ای برای استخراج فروشگاه‌ها یافت نشد');
        setShopOwners([]);
        return;
      }

      // استخراج فروشگاه‌های منحصربه‌فرد
      const shopsMap = new Map();
      
      purchasesData.forEach(purchase => {
        if (purchase.shopId) {
          const shopKey = purchase.shopId;
          if (!shopsMap.has(shopKey)) {
            shopsMap.set(shopKey, {
              _id: purchase.shopId,
              name: purchase.sellerName || 'نامشخص',
              shop: purchase.sellerName || 'فروشگاه',
              phone: purchase.sellerPhone || '—',
              status: 'active',
              address: purchase.sellerAddress || '',
              // اطلاعات اضافی از خرید
              totalPurchases: 1,
              totalValue: purchase.price || 0
            });
          } else {
            // اگر قبلاً اضافه شده، آمار را به‌روز کن
            const existingShop = shopsMap.get(shopKey);
            existingShop.totalPurchases += 1;
            existingShop.totalValue += purchase.price || 0;
          }
        }
        
        // همچنین بر اساس فروشنده
        if (purchase.sellerName && purchase.sellerPhone) {
          const sellerKey = `${purchase.sellerName}-${purchase.sellerPhone}`;
          if (!shopsMap.has(sellerKey)) {
            shopsMap.set(sellerKey, {
              _id: sellerKey,
              name: purchase.sellerName,
              shop: purchase.sellerName,
              phone: purchase.sellerPhone,
              status: 'active',
              address: purchase.sellerAddress || '',
              totalPurchases: 1,
              totalValue: purchase.price || 0
            });
          }
        }
      });

      const extractedShops = Array.from(shopsMap.values());
      console.log(`✅ ${extractedShops.length} فروشگاه استخراج شد`);
      
      setEndpoint('استخراج از خریدها');
      setShopOwners(extractedShops);
      toast.success(`${extractedShops.length} فروشگاه از خریدها استخراج شد`);
      
    } catch (error) {
      console.error('خطا در استخراج فروشگاه‌ها:', error);
      setError('خطا در پردازش داده‌ها');
      setShopOwners([]);
    }
  };

  // پردازش داده‌های فروشگاه با ساختارهای مختلف
  const processShopData = (data) => {
    console.log('🔧 پردازش داده‌های فروشگاه:', data);
    
    let processedShops = [];
    
    // اگر داده آرایه است
    if (Array.isArray(data)) {
      if (data.length === 0) {
        setError('لیست فروشگاه‌ها خالی است');
        toast.info('هیچ فروشگاهی ثبت نشده است');
        setShopOwners([]);
        return;
      }
      
      // پردازش هر آیتم در آرایه
      processedShops = data.map(item => {
        // تشخیص ساختار داده
        if (item.name || item.shopName) {
          // ساختار استاندارد فروشگاه
          return {
            _id: item._id || item.id || Math.random().toString(36).substr(2, 9),
            name: item.name || item.sellerName || item.shopName || 'نامشخص',
            shop: item.shop || item.shopName || item.name || 'فروشگاه',
            phone: item.phone || item.sellerPhone || item.mobile || '—',
            status: item.status || 'active',
            email: item.email || '',
            address: item.address || item.sellerAddress || '',
            createdAt: item.createdAt || '',
            updatedAt: item.updatedAt || ''
          };
        } else if (item.username || item.email) {
          // ممکن است کاربر باشد نه فروشگاه
          return {
            _id: item._id || item.id,
            name: item.fullName || item.username || 'کاربر',
            shop: item.role === 'shop' ? 'فروشگاه کاربر' : 'حساب کاربری',
            phone: item.phone || item.mobile || '—',
            status: item.status || item.isActive ? 'active' : 'inactive',
            email: item.email || '',
            role: item.role || 'user'
          };
        } else {
          // ساختار ناشناخته
          return {
            _id: item._id || item.id || Math.random().toString(36).substr(2, 9),
            name: 'نامشخص',
            shop: 'فروشگاه',
            phone: '—',
            status: 'active',
            rawData: item // ذخیره داده خام برای دیباگ
          };
        }
      });
      
    } else if (data && typeof data === 'object') {
      // اگر داده object است
      const possibleArrayKeys = ['shops', 'users', 'data', 'list', 'results', 'items'];
      
      for (const key of possibleArrayKeys) {
        if (Array.isArray(data[key])) {
          console.log(`✅ آرایه در کلید "${key}" پیدا شد`);
          processedShops = data[key].map(item => ({
            _id: item._id || item.id,
            name: item.name || item.sellerName || 'نامشخص',
            shop: item.shop || item.shopName || 'فروشگاه',
            phone: item.phone || item.sellerPhone || '—',
            status: item.status || 'active'
          }));
          break;
        }
      }
      
      // اگر آرایه پیدا نشد و object تک است
      if (processedShops.length === 0) {
        processedShops = [{
          _id: data._id || data.id,
          name: data.name || data.sellerName || 'نامشخص',
          shop: data.shop || data.shopName || 'فروشگاه',
          phone: data.phone || data.sellerPhone || '—',
          status: data.status || 'active'
        }];
      }
    }
    
    // فیلتر کردن موارد نامعتبر
    const validShops = processedShops.filter(shop => 
      shop && (shop.name !== 'نامشخص' || shop.phone !== '—')
    );
    
    if (validShops.length === 0) {
      setError('داده‌های دریافتی معتبر نیستند');
      toast.error('فرمت داده‌ها قابل پردازش نیست');
    }
    
    console.log(`📊 ${validShops.length} فروشگاه پردازش شد`);
    setShopOwners(validShops);
    
    if (validShops.length > 0) {
      toast.success(`${validShops.length} فروشگاه بارگذاری شد`);
    }
  };

  const handleAddShop = () => {
    toast.info('این قابلیت به زودی اضافه می‌شود');
  };

  const handleEditShop = (id) => {
    const shop = shopOwners.find(s => s._id === id);
    if (shop) {
      toast.info(`ویرایش فروشگاه: ${shop.name}`);
    }
  };

  const handleDeleteShop = async (id) => {
    const shop = shopOwners.find(s => s._id === id);
    if (!shop) return;
    
    if (window.confirm(`آیا از حذف فروشگاه "${shop.name}" مطمئنید؟`)) {
      try {
        const token = localStorage.getItem('token');
        
        if (endpoint && endpoint.startsWith('/api/')) {
          const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            setShopOwners(prev => prev.filter(s => s._id !== id));
            toast.success(`فروشگاه "${shop.name}" حذف شد`);
          } else {
            throw new Error('حذف از سرور ناموفق بود');
          }
        } else {
          // فقط از state حذف کن
          setShopOwners(prev => prev.filter(s => s._id !== id));
          toast.success(`فروشگاه "${shop.name}" از لیست حذف شد`);
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('خطا در حذف فروشگاه');
      }
    }
  };

  const getStatusBadge = (status) => {
    const isActive = status === 'active' || status === 'فعال' || status === true;
    
    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '14px',
        background: isActive ? '#d1fae5' : '#fee2e2',
        color: isActive ? '#065f46' : '#991b1b',
        fontWeight: '500'
      }}>
        {isActive ? 'فعال' : 'غیرفعال'}
      </span>
    );
  };

  const refreshData = () => {
    fetchShopOwners();
  };

  const viewRawData = () => {
    console.log('📦 داده‌های خام فروشگاه‌ها:', shopOwners);
    toast.info('داده‌ها در کنسول نمایش داده شدند');
  };

  return (
    <div style={{ direction: 'rtl' }}>
      <h1 style={{ color: '#1e293b', marginBottom: '30px' }}>🏪 مدیریت فروشگاه‌ها</h1>
      
      {/* وضعیت اتصال */}
      <div style={{
        background: '#d1fae5',
        border: '1px solid #10b981',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        color: '#065f46'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>✅ متصل به سرور</strong>
            <span style={{ margin: '0 10px', color: '#94a3b8' }}>|</span>
            <span style={{ fontSize: '0.9em' }}>
              منبع: <code style={{ 
                background: '#f1f5f9', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}>
                {endpoint}
              </code>
            </span>
            <span style={{ margin: '0 10px', color: '#94a3b8' }}>|</span>
            <span style={{ fontSize: '0.9em' }}>
              تعداد: <strong>{shopOwners.length}</strong> فروشگاه
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={viewRawData}
              style={{
                padding: '4px 8px',
                background: 'transparent',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '0.8em',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              👁️ نمایش داده‌ها
            </button>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={handleAddShop}
          style={{
            padding: '10px 20px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>➕</span>
          افزودن فروشگاه جدید
        </button>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={refreshData}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🔄</span>
            به‌روزرسانی
          </button>
        </div>
      </div>
      
      {/* Loading */}
      {loading ? (
        <div style={{ 
          padding: '60px 20px', 
          textAlign: 'center', 
          color: '#64748b',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{ 
            fontSize: '2rem', 
            marginBottom: '15px', 
            animation: 'spin 1s linear infinite' 
          }}>🔄</div>
          <p style={{ fontSize: '16px' }}>در حال دریافت اطلاعات فروشگاه‌ها...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        /* Content */
        <div style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          minHeight: '300px'
        }}>
          <div style={{
            padding: '20px 25px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}>
            <h3 style={{ margin: 0, color: '#334155' }}>لیست فروشگاه‌ها</h3>
            <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
              اطلاعات فروشگاه‌های ثبت‌شده در سیستم مدیریت موبایل
            </p>
          </div>
          
          {shopOwners.length === 0 ? (
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center', 
              color: '#94a3b8' 
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🏪</div>
              <h3 style={{ color: '#475569', marginBottom: '10px' }}>هیچ فروشگاهی یافت نشد</h3>
              <p style={{ marginBottom: '20px', maxWidth: '500px', margin: '0 auto' }}>
                در حال حاضر هیچ فروشگاهی در سیستم ثبت نشده است. 
                می‌توانید اولین فروشگاه را به سیستم اضافه کنید.
              </p>
              <button
                onClick={handleAddShop}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
              >
                <span>➕</span>
                افزودن اولین فروشگاه
              </button>
            </div>
          ) : (
            <div style={{ padding: '20px', overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                minWidth: '800px',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                <thead style={{ background: '#f1f5f9' }}>
                  <tr>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'right', 
                      fontWeight: '600', 
                      color: '#334155',
                      borderBottom: '2px solid #e2e8f0'
                    }}>شناسه</th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'right', 
                      fontWeight: '600', 
                      color: '#334155',
                      borderBottom: '2px solid #e2e8f0'
                    }}>نام فروشنده</th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'right', 
                      fontWeight: '600', 
                      color: '#334155',
                      borderBottom: '2px solid #e2e8f0'
                    }}>نام فروشگاه</th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'right', 
                      fontWeight: '600', 
                      color: '#334155',
                      borderBottom: '2px solid #e2e8f0'
                    }}>شماره تماس</th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'right', 
                      fontWeight: '600', 
                      color: '#334155',
                      borderBottom: '2px solid #e2e8f0'
                    }}>وضعیت</th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'right', 
                      fontWeight: '600', 
                      color: '#334155',
                      borderBottom: '2px solid #e2e8f0'
                    }}>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {shopOwners.map((owner, index) => (
                    <tr key={owner._id} style={{ 
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                    }}>
                      <td style={{ 
                        padding: '15px', 
                        fontFamily: 'monospace', 
                        fontSize: '0.85em', 
                        color: '#64748b' 
                      }}>
                        {owner._id ? `#${owner._id.slice(-6)}` : `#${index + 1}`}
                      </td>
                      <td style={{ padding: '15px', color: '#1e293b', fontWeight: '500' }}>
                        {owner.name}
                        {owner.rawData && (
                          <div style={{ fontSize: '0.8em', color: '#94a3b8', marginTop: '4px' }}>
                            (داده خام موجود)
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '15px', color: '#1e293b' }}>
                        {owner.shop}
                        {owner.role && (
                          <div style={{ fontSize: '0.8em', color: '#8b5cf6', marginTop: '4px' }}>
                            نقش: {owner.role}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '15px', color: '#1e293b' }}>
                        {owner.phone}
                        {owner.email && (
                          <div style={{ fontSize: '0.8em', color: '#64748b', marginTop: '4px' }}>
                            {owner.email}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {getStatusBadge(owner.status)}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEditShop(owner._id)}
                            style={{
                              padding: '6px 12px',
                              background: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>✏️</span>
                            ویرایش
                          </button>
                          <button
                            onClick={() => handleDeleteShop(owner._id)}
                            style={{
                              padding: '6px 12px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>🗑️</span>
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* اطلاعات اضافی */}
              {shopOwners.some(shop => shop.address || shop.createdAt) && (
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  fontSize: '0.9em',
                  color: '#64748b'
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                    {shopOwners.filter(shop => shop.address).length > 0 && (
                      <div>
                        <strong>آدرس‌های ثبت شده:</strong>
                        <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                          {shopOwners
                            .filter(shop => shop.address)
                            .slice(0, 3)
                            .map(shop => (
                              <li key={shop._id}>{shop.address}</li>
                            ))
                          }
                        </ul>
                      </div>
                    )}
                    {shopOwners.filter(shop => shop.totalPurchases).length > 0 && (
                      <div>
                        <strong>آمار خرید:</strong>
                        <div style={{ marginTop: '5px' }}>
                          {shopOwners
                            .filter(shop => shop.totalPurchases)
                            .slice(0, 3)
                            .map(shop => (
                              <div key={shop._id}>
                                {shop.name}: {shop.totalPurchases} خرید
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopOwners;
