import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('نام کاربری و رمز عبور را وارد کنید');
      return;
    }

    setLoading(true);

    try {
      // اتصال مستقیم به بک‌اند رندر شما
      const API_URL = 'https://back-end-v2-qxa5.onrender.com/api/auth/login';
      
      console.log('📡 ارسال درخواست به:', API_URL);
      console.log('👤 کاربر:', username);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: username, // یا username بسته به انتظار بک‌اند
          password: password 
        }),
      });

      console.log('📊 وضعیت پاسخ:', response.status);

      const data = await response.json();
      console.log('📦 پاسخ سرور:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'نام کاربری یا رمز عبور اشتباه است');
      }

      // ذخیره اطلاعات
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userRole', data.user.role || 'admin');
      
      toast.success('✅ ورود موفقیت‌آمیز');
      
      // هدایت به داشبورد
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);

    } catch (error) {
      console.error('❌ خطا:', error);
      
      // پیام خطای مناسب
      let errorMessage = error.message;
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'سرور در دسترس نیست. لطفاً اتصال اینترنت را بررسی کنید';
      } else if (error.message.includes('timed out')) {
        errorMessage = 'سرور در حال راه‌اندازی است. لطفاً دوباره تلاش کنید';
      }
      
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // پر کردن خودکار برای تست
  const fillAdmin = () => {
    setUsername('admin');
    setPassword('admin123');
    toast.success('اطلاعات مدیر پر شد');
  };

  return (
    <div className="login-minimal">
      <div className="login-box">
        {/* لوگو */}
        <div className="logo">
          <div className="logo-icon">📱</div>
          <h1>فروشگاه اتحادیه</h1>
        </div>

        {/* فرم */}
        <form onSubmit={handleLogin} className="login-form">
          {/* فیلد نام کاربری */}
          <div className="input-group">
            <label>نام کاربری</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          {/* فیلد رمز عبور */}
          <div className="input-group">
            <label>رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {/* دکمه ورود */}
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                در حال ورود...
              </>
            ) : 'ورود به سیستم'}
          </button>

          {/* دکمه تست */}
          <button 
            type="button" 
            className="test-btn"
            onClick={fillAdmin}
          >
            پر کردن خودکار (تست)
          </button>
        </form>

        {/* وضعیت اتصال */}
        <div className="connection-info">
          <p>بک‌اند: <code>back-end-v2-qxa5.onrender.com</code></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
