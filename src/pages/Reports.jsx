import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://back-end-v2-qxa5.onrender.com/api/purchases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('خطا در دریافت گزارشات:', error);
      toast.error('خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const totalPurchases = reports.length;
  const totalAmount = reports.reduce((sum, item) => sum + (item.price || 0), 0);
  const avgPrice = totalPurchases > 0 ? Math.round(totalAmount / totalPurchases) : 0;

  return (
    <div style={{ direction: 'rtl' }}>
      <h1 style={{ color: '#1e293b', marginBottom: '30px' }}>📊 گزارشات و آمار</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderTop: '4px solid #3b82f6'
        }}>
          <h3 style={{ color: '#64748b', margin: '0 0 10px 0', fontSize: '16px' }}>تعداد کل خریدها</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>
            {loading ? '...' : totalPurchases}
          </div>
        </div>
        
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderTop: '4px solid #10b981'
        }}>
          <h3 style={{ color: '#64748b', margin: '0 0 10px 0', fontSize: '16px' }}>مجموع مبلغ</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>
            {loading ? '...' : totalAmount.toLocaleString()} افغانی
          </div>
        </div>
        
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderTop: '4px solid #f59e0b'
        }}>
          <h3 style={{ color: '#64748b', margin: '0 0 10px 0', fontSize: '16px' }}>میانگین قیمت</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>
            {loading ? '...' : avgPrice.toLocaleString()} افغانی
          </div>
        </div>
      </div>
      
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '30px'
      }}>
        <div style={{
          padding: '20px 25px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#334155' }}>لیست خریدها</h3>
          <button
            onClick={fetchReports}
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
            🔄 در حال دریافت گزارشات...
          </div>
        ) : reports.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            📭 هیچ گزارشی موجود نیست
          </div>
        ) : (
          <div style={{ padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f1f5f9' }}>
                <tr>
                  <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600' }}>موبایل</th>
                  <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600' }}>فروشنده</th>
                  <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600' }}>قیمت</th>
                  <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600' }}>تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {reports.slice(0, 10).map((item, index) => (
                  <tr key={index} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '15px' }}>{item.mobileName || item.brand || 'نامشخص'}</td>
                    <td style={{ padding: '15px' }}>{item.sellerName || 'نامشخص'}</td>
                    <td style={{ padding: '15px' }}>{item.price?.toLocaleString() || '۰'} تومان</td>
                    <td style={{ padding: '15px' }}>
                      {item.date ? new Date(item.date).toLocaleDateString('fa-IR') : 'نامشخص'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;