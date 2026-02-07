import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import logo from '../../assets/logo.jpg';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('نام کاربری و رمز عبور را وارد کنید');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'https://back-end-v2-qxa5.onrender.com/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('ورود موفق');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'نام کاربری یا رمز عبور اشتباه است');
      }
    } catch (err) {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        direction: 'rtl',
        background: 'linear-gradient(135deg, #eef2ff, #f8fafc)',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '42px 38px',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.12)',
        }}
      >
        {/* لوگو */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <img
            src={logo}
            alt="لوگوی اتحادیه موبایل‌فروشان هرات"
            style={{ width: '110px' }}
          />
        </div>

        <h2
          style={{
            textAlign: 'center',
            marginBottom: '32px',
            fontSize: '17px',
            color: '#1f2937',
            lineHeight: '1.8',
          }}
        >
          کتابچه الکترونیکی اتحادیه مبایل‌فروشان ولایت هرات
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label>نام کاربری</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                marginTop: '6px',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
              }}
            />
          </div>

          <div style={{ marginBottom: '26px' }}>
            <label>رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                marginTop: '6px',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
