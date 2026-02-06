import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const ShopOwners = () => {
  const [shopOwners, setShopOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShopOwners();
  }, []);

  const fetchShopOwners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // تلاش برای دریافت فروشگاه‌ها
      const response = await fetch('https://back-end-v2-qxa5.onrender.com/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setShopOwners(data);
      } else {
        // اگر API وجود ندارد، داده نمونه نشان دهید
        setShopOwners([
          { id: 1, name: 'احمد محمدی', shop: 'فروشگاه مرکزی', phone: '09123456789', status: 'active' },
          { id: 2, name: 'رضا کریمی', shop: 'موبایل مارکت', phone: '09129876543', status: 'active' },
          { id: 3, name: 'محمد حسینی', shop: 'گوشی همراه', phone: '09121234567', status: 'inactive' }
        ]);
      }
    } catch (error) {
      console.error('خطا در دریافت فروشگاه‌ها:', error);
      toast.error('خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl' }}>
      <h1 style={{ color: '#1e293b', marginBottom: '30px' }}>🏪 مدیریت فروشگاه‌ها</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => toast.info('این قابلیت به زودی اضافه می‌شود')}
          style={{
            padding: '10px 20px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ➕ افزودن فروشگاه جدید
        </button>
        
        <button
          onClick={fetchShopOwners}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 به‌روزرسانی
        </button>
      </div>
      
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          🔄 در حال دریافت اطلاعات...
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            padding: '20px 25px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}>
            <h3 style={{ margin: 0, color: '#334155' }}>لیست فروشگاه‌ها</h3>
          </div>
          
          {shopOwners.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              📭 هیچ فروشگاهی ثبت نشده است
            </div>
          ) : (
            <div style={{ padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600' }}>نام فروشنده</th>
                    <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600' }}>نام فروشگاه</th>
                    <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600' }}>شماره تماس</th>
                    <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600' }}>وضعیت</th>
                    <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600' }}>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {shopOwners.map((owner, index) => (
                    <tr key={index} style={{ borderTop: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '15px' }}>{owner.name}</td>
                      <td style={{ padding: '15px' }}>{owner.shop}</td>
                      <td style={{ padding: '15px' }}>{owner.phone}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          background: owner.status === 'active' ? '#d1fae5' : '#fee2e2',
                          color: owner.status === 'active' ? '#065f46' : '#991b1b'
                        }}>
                          {owner.status === 'active' ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <button
                          onClick={() => toast.info('ویرایش فروشگاه')}
                          style={{
                            padding: '6px 12px',
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            marginRight: '5px'
                          }}
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => toast.info('حذف فروشگاه')}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopOwners;