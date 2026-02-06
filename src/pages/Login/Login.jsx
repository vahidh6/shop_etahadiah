import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('لطفاً نام کاربری و رمز عبور را وارد کنید');
      return;
    }

    setLoading(true);
    
    try {
      // 🔴 **خطای شما اینجاست - هنوز phoneNumber داره!**
      // باید دقیقاً این فرمت باشه:
      const requestBody = {
        username: username,  // ✅
        password: password   // ✅
      };
      
      console.log('📤 **فرمت درست ارسالی:**', JSON.stringify(requestBody, null, 2));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch('https://back-end-v2-qxa5.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody), // ✅ اینجا مهمه
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      console.log('📥 پاسخ سرور:', data);
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast.success(`✅ ورود موفق!`);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast.error(data.message || 'نام کاربری یا رمز عبور اشتباه است');
      }
      
    } catch (error) {
      console.error('❌ خطای لاگین:', error);
      
      if (error.name === 'AbortError') {
        toast.error('⏱️ درخواست زمان‌بر شد');
      } else {
        toast.error('🌐 خطا در ارتباط با سرور');
      }
    } finally {
      setLoading(false);
    }
  };

  // نمایش فرمت درست
  const showFormat = () => {
    const format = {
      username: username || 'admin',
      password: password || 'Admin@123'
    };
    
    console.log('📝 فرمت درست برای کپی:', format);
    alert(`فرمت درست:\n\n${JSON.stringify(format, null, 2)}`);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      direction: 'rtl'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)'
      }}>
        
        {/* نمایش فرمت درست */}
        <div style={{
          padding: '15px',
          background: '#dcfce7',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '2px solid #86efac'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ fontSize: '24px' }}>✅</div>
            <div>
              <strong style={{ color: '#166534' }}>فرمت درست ارسال:</strong>
              <div style={{ fontSize: '13px', color: '#15803d' }}>
                {`{ username: "${username || 'admin'}", password: "${password || 'Admin@123'}" }`}
              </div>
            </div>
          </div>
          
          <button
            onClick={showFormat}
            style={{
              width: '100%',
              padding: '8px',
              background: '#bbf7d0',
              border: '1px solid #86efac',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            👁️ نمایش فرمت کامل برای کپی
          </button>
        </div>
        
        {/* فرم */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#374151', marginBottom: '8px', fontWeight: '500' }}>
              نام کاربری (username)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '16px'
              }}
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', color: '#374151', marginBottom: '8px', fontWeight: '500' }}>
              رمز عبور (password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '16px'
              }}
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
          >
            {loading ? '🔄 در حال ارسال...' : '🚀 ارسال فرمت درست'}
          </button>
        </form>
        
        {/* دیباگ */}
        <div style={{
          marginTop: '25px',
          padding: '15px',
          background: '#fef3c7',
          borderRadius: '10px',
          fontSize: '12px'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#92400e' }}>
            🔍 برای دیباگ در کنسول (F12):
          </p>
          <ol style={{ margin: '0', paddingRight: '20px', color: '#92400e' }}>
            <li>کنسول را باز کنید (F12 → Console)</li>
            <li>روی "ارسال فرمت درست" کلیک کنید</li>
            <li>ببینید چه فرمتی ارسال می‌شود</li>
            <li>اگر هنوز phoneNumber است، مشکل از جای دیگر است</li>
          </ol>
        </div>
        
        {/* اطلاعات */}
        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '11px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          <p>اگر هنوز `phoneNumber` ارسال می‌شود:</p>
          <p>1. ممکن است در App.js یا کامپوننت دیگری override شده باشد</p>
          <p>2. کش مرورگر را پاک کنید (Ctrl+Shift+R)</p>
        </div>
      </div>
    </div>
  );
};

export default Login;