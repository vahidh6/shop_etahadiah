import React from 'react';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <h1>👤 پروفایل کاربری</h1>
      
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '500px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: 'white',
            margin: '0 auto 20px'
          }}>
            {user.name?.charAt(0) || user.username?.charAt(0) || '👤'}
          </div>
          <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>
            {user.name || user.username || 'کاربر'}
          </h2>
          <div style={{
            display: 'inline-block',
            padding: '6px 12px',
            background: user.role === 'admin' ? '#dcfce7' : '#dbeafe',
            color: user.role === 'admin' ? '#166534' : '#1e40af',
            borderRadius: '20px',
            fontSize: '14px'
          }}>
            {user.role === 'admin' ? 'مدیر سیستم' : 'کاربر'}
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <h3 style={{ color: '#334155', marginBottom: '15px' }}>اطلاعات حساب</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>نام کاربری</div>
            <div style={{ fontSize: '16px', color: '#1e293b' }}>{user.username || 'نامشخص'}</div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>ایمیل</div>
            <div style={{ fontSize: '16px', color: '#1e293b' }}>{user.email || 'ثبت نشده'}</div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>شماره تماس</div>
            <div style={{ fontSize: '16px', color: '#1e293b' }}>{user.phone || 'ثبت نشده'}</div>
          </div>
          
          <div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>تاریخ عضویت</div>
            <div style={{ fontSize: '16px', color: '#1e293b' }}>
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : 'نامشخص'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;