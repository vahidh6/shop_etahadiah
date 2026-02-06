import API from './api';

export const authService = {
  // لاگین کاربر
  login: async (phoneNumber, password) => {
    try {
      const response = await API.post('/auth/login', {
        phoneNumber,
        password,
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('userRole', response.user.role);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // ثبت‌نام دوکاندار (فقط ادمین)
  registerShopOwner: async (shopOwnerData) => {
    try {
      const response = await API.post('/auth/register-shop-owner', shopOwnerData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // دریافت اطلاعات کاربر جاری
  getProfile: async () => {
    try {
      const response = await API.get('/auth/profile');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // خروج
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  },

  // بررسی وضعیت احراز هویت
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // دریافت کاربر جاری
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // بررسی نقش کاربر
  isAdmin: () => {
    return localStorage.getItem('userRole') === 'admin';
  },

  isShopOwner: () => {
    return localStorage.getItem('userRole') === 'shopOwner';
  }
};