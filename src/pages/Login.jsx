import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaLock, FaMobileAlt } from 'react-icons/fa';

const BASE_URL = 'https://e549-103-216-160-90.ngrok-free.app'; // لینک Ngrok فعلی

const LoginSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required('شماره تماس الزامی است')
    .matches(/^09[0-9]{9}$/, 'شماره تماس معتبر نیست'),
  password: Yup.string()
    .required('رمز عبور الزامی است')
    .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.phoneNumber, // backend expects "username"
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.message || 'خطا در ورود به سیستم');
      } else {
        // ذخیره توکن
        localStorage.setItem('token', data.token);
        navigate('/'); // بعد از ورود به داشبورد هدایت شود
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <FaMobileAlt size={36} color="#4CAF50" />
            <h1>سیستم مدیریت موبایل</h1>
          </div>
          <p>لطفاً اطلاعات خود را وارد کنید</p>
        </div>

        <Formik
          initialValues={{ phoneNumber: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, handleChange, handleBlur, values }) => (
            <Form className="login-form">
              <div className="form-group">
                <label>
                  <FaUser /> شماره تماس
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="09xxxxxxxxx"
                  value={values.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.phoneNumber && touched.phoneNumber ? 'error' : ''}
                />
                {errors.phoneNumber && touched.phoneNumber && (
                  <div className="error-message">{errors.phoneNumber}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FaLock /> رمز عبور
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="رمز عبور"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.password && touched.password ? 'error' : ''}
                />
                {errors.password && touched.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>

              {errorMessage && <div className="server-error">{errorMessage}</div>}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'در حال ورود...' : 'ورود به سیستم'}
              </button>

              <div className="login-footer">
                <p>
                  دوکاندار جدید هستید؟ <Link to="/register">ثبت‌نام کنید</Link>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      <style jsx>{`
        .login-page {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f5f5f5;
        }
        .login-container {
          background: #fff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 0 15px rgba(0,0,0,0.1);
          width: 350px;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .login-header p {
          margin-bottom: 20px;
          color: #555;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        input {
          width: 100%;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #ccc;
        }
        input.error {
          border-color: red;
        }
        .error-message {
          color: red;
          font-size: 0.9em;
        }
        .server-error {
          margin-bottom: 10px;
          color: red;
          font-weight: bold;
        }
        .login-btn {
          width: 100%;
          padding: 10px;
          background: #4CAF50;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1em;
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-footer {
          margin-top: 15px;
          text-align: center;
          font-size: 0.9em;
        }
        .login-footer a {
          color: #4CAF50;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

export default Login;
