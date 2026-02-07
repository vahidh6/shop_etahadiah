import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

// Constants
const API_BASE_URL = 'https://back-end-v2-qxa5.onrender.com';
const SHOP_ENDPOINTS = [
  '/api/admin/shops',
  '/api/shops',
  '/api/admin/users',
  '/api/users'
];
const PURCHASE_ENDPOINTS = [
  '/api/admin/purchases',
  '/api/purchases',
  '/api/purchase/all'
];

// API Service
const shopApi = {
  getToken: () => localStorage.getItem('token'),
  
  fetchEndpoint: async (endpoint, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  },
  
  discoverShopEndpoint: async (token) => {
    for (const endpoint of SHOP_ENDPOINTS) {
      const data = await shopApi.fetchEndpoint(endpoint, token);
      if (data) {
        return { endpoint, data };
      }
    }
    return null;
  },
  
  fetchPurchases: async (token) => {
    for (const endpoint of PURCHASE_ENDPOINTS) {
      const data = await shopApi.fetchEndpoint(endpoint, token);
      if (data) {
        return data;
      }
    }
    return null;
  }
};

// Data Processing Utilities
const shopDataProcessor = {
  extractFromPurchases: (purchasesData) => {
    if (!Array.isArray(purchasesData)) return [];
    
    const shopsMap = new Map();
    
    purchasesData.forEach(purchase => {
      // Extract by shopId
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
            totalPurchases: 1,
            totalValue: purchase.price || 0
          });
        } else {
          const existingShop = shopsMap.get(shopKey);
          existingShop.totalPurchases += 1;
          existingShop.totalValue += purchase.price || 0;
        }
      }
      
      // Extract by seller info
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
    
    return Array.from(shopsMap.values());
  },
  
  processApiData: (data) => {
    let processedShops = [];
    
    if (Array.isArray(data)) {
      processedShops = data.map(item => shopDataProcessor.normalizeShopItem(item));
    } else if (data && typeof data === 'object') {
      const arrayKeys = ['shops', 'users', 'data', 'list', 'results', 'items'];
      
      for (const key of arrayKeys) {
        if (Array.isArray(data[key])) {
          processedShops = data[key].map(item => shopDataProcessor.normalizeShopItem(item));
          break;
        }
      }
      
      if (processedShops.length === 0) {
        processedShops = [shopDataProcessor.normalizeShopItem(data)];
      }
    }
    
    return processedShops.filter(shop => 
      shop && (shop.name !== 'نامشخص' || shop.phone !== '—')
    );
  },
  
  normalizeShopItem: (item) => {
    if (item.name || item.shopName) {
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
    }
    
    if (item.username || item.email) {
      return {
        _id: item._id || item.id,
        name: item.fullName || item.username || 'کاربر',
        shop: item.role === 'shop' ? 'فروشگاه کاربر' : 'حساب کاربری',
        phone: item.phone || item.mobile || '—',
        status: item.status || item.isActive ? 'active' : 'inactive',
        email: item.email || '',
        role: item.role || 'user'
      };
    }
    
    return {
      _id: item._id || item.id || Math.random().toString(36).substr(2, 9),
      name: 'نامشخص',
      shop: 'فروشگاه',
      phone: '—',
      status: 'active'
    };
  }
};

// UI Components
const ConnectionStatus = ({ endpoint, shopCount }) => (
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
          تعداد: <strong>{shopCount}</strong> فروشگاه
        </span>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
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

const ShopTable = ({ shops, onEdit, onDelete }) => (
  <div style={{ padding: '20px', overflowX: 'auto' }}>
    <table style={{ 
      width: '100%', 
      borderCollapse: 'collapse', 
      minWidth: '800px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <thead style={{ background: '#f1f5f9' }}>
        <tr>
          <TableHeader>شناسه</TableHeader>
          <TableHeader>نام فروشنده</TableHeader>
          <TableHeader>نام فروشگاه</TableHeader>
          <TableHeader>شماره تماس</TableHeader>
          <TableHeader>وضعیت</TableHeader>
          <TableHeader>عملیات</TableHeader>
        </tr>
      </thead>
      <tbody>
        {shops.map((shop, index) => (
          <ShopTableRow 
            key={shop._id}
            shop={shop}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  </div>
);

const TableHeader = ({ children }) => (
  <th style={{ 
    padding: '15px', 
    textAlign: 'right', 
    fontWeight: '600', 
    color: '#334155',
    borderBottom: '2px solid #e2e8f0'
  }}>
    {children}
  </th>
);

const ShopTableRow = ({ shop, index, onEdit, onDelete }) => (
  <tr style={{ 
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
  }}>
    <td style={{ 
      padding: '15px', 
      fontFamily: 'monospace', 
      fontSize: '0.85em', 
      color: '#64748b' 
    }}>
      {shop._id ? `#${shop._id.slice(-6)}` : `#${index + 1}`}
    </td>
    <td style={{ padding: '15px', color: '#1e293b', fontWeight: '500' }}>
      {shop.name}
    </td>
    <td style={{ padding: '15px', color: '#1e293b' }}>
      {shop.shop}
      {shop.role && (
        <div style={{ fontSize: '0.8em', color: '#8b5cf6', marginTop: '4px' }}>
          نقش: {shop.role}
        </div>
      )}
    </td>
    <td style={{ padding: '15px', color: '#1e293b' }}>
      {shop.phone}
      {shop.email && (
        <div style={{ fontSize: '0.8em', color: '#64748b', marginTop: '4px' }}>
          {shop.email}
        </div>
      )}
    </td>
    <td style={{ padding: '15px' }}>
      <StatusBadge status={shop.status} />
    </td>
    <td style={{ padding: '15px' }}>
      <ActionButtons shop={shop} onEdit={onEdit} onDelete={onDelete} />
    </td>
  </tr>
);

const ActionButtons = ({ shop, onEdit, onDelete }) => (
  <div style={{ display: 'flex', gap: '8px' }}>
    <button
      onClick={() => onEdit(shop._id)}
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
      onClick={() => onDelete(shop._id)}
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
);

const LoadingState = () => (
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
);

const EmptyState = ({ onAddShop }) => (
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
      onClick={onAddShop}
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
);

// Main Component
const ShopOwners = () => {
  const [shopOwners, setShopOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [endpoint, setEndpoint] = useState('');

  const fetchShopOwners = useCallback(async () => {
    try {
      setLoading(true);
      const token = shopApi.getToken();
      
      if (!token) {
        toast.error('لطفاً ابتدا وارد سیستم شوید');
        return;
      }

      // Try to discover shop endpoint
      const shopResult = await shopApi.discoverShopEndpoint(token);
      
      if (shopResult) {
        const { endpoint: foundEndpoint, data } = shopResult;
        setEndpoint(foundEndpoint);
        localStorage.setItem('shop_endpoint', foundEndpoint);
        
        const processedShops = shopDataProcessor.processApiData(data);
        setShopOwners(processedShops);
        
        if (processedShops.length > 0) {
          toast.success(`${processedShops.length} فروشگاه بارگذاری شد`);
        }
      } else {
        // Fallback: Extract shops from purchases
        const purchasesData = await shopApi.fetchPurchases(token);
        
        if (purchasesData) {
          const extractedShops = shopDataProcessor.extractFromPurchases(purchasesData);
          setEndpoint('استخراج از خریدها');
          setShopOwners(extractedShops);
          
          if (extractedShops.length > 0) {
            toast.success(`${extractedShops.length} فروشگاه از خریدها استخراج شد`);
          } else {
            toast.info('هیچ فروشگاهی یافت نشد');
          }
        } else {
          toast.error('نقطه دسترسی API پیدا نشد');
          setShopOwners([]);
        }
      }
    } catch (error) {
      console.error('Error fetching shop owners:', error);
      toast.error('خطا در دریافت اطلاعات');
      setShopOwners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShopOwners();
  }, [fetchShopOwners]);

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
        const token = shopApi.getToken();
        
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
          setShopOwners(prev => prev.filter(s => s._id !== id));
          toast.success(`فروشگاه "${shop.name}" از لیست حذف شد`);
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('خطا در حذف فروشگاه');
      }
    }
  };

  return (
    <div style={{ direction: 'rtl' }}>
      <h1 style={{ color: '#1e293b', marginBottom: '30px' }}>🏪 مدیریت فروشگاه‌ها</h1>
      
      <ConnectionStatus endpoint={endpoint} shopCount={shopOwners.length} />
      
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
            onClick={fetchShopOwners}
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
      
      {loading ? (
        <LoadingState />
      ) : (
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
            <EmptyState onAddShop={handleAddShop} />
          ) : (
            <ShopTable 
              shops={shopOwners}
              onEdit={handleEditShop}
              onDelete={handleDeleteShop}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ShopOwners;
