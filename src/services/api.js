import axios from 'axios';
import { toast } from 'react-hot-toast';

// آدرس بک‌اند رندر شما
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://back-end-v2-qxa5.onrender.com/api';

// ایجاد اینستنس axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 ثانیه
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// اینترسپتور برای افزودن توکن
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// اینترسپتور برای مدیریت خطا
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('❌ API Error:', error);
    
    let message = 'خطا در ارتباط با سرور';
    
    // بررسی خطای شبکه
    if (error.code === 'ECONNABORTED') {
      message = 'درخواست زمان‌بر شد. سرور در حال راه‌اندازی است...';
      toast.error('🔄 لطفاً کمی صبر کنید');
    } else if (!error.response) {
      message = 'ارتباط با سرور برقرار نشد';
    } else {
      switch (error.response.status) {
        case 400:
          message = 'درخواست نامعتبر';
          break;
        case 401:
          message = 'لطفاً دوباره وارد شوید';
          localStorage.clear();
          window.location.href = '/';
          break;
        case 403:
          message = 'دسترسی غیرمجاز';
          break;
        case 404:
          message = 'منبع یافت نشد';
          break;
        case 500:
          message = 'خطای سرور داخلی';
          break;
        default:
          message = error.response.data?.message || `خطای ${error.response.status}`;
      }
    }
    
    toast.error(`❌ ${message}`);
    return Promise.reject(error);
  }
);

// سرویس‌های API
export const authService = {
  login: (phoneNumber, password) => 
    api.post('/auth/login', { phoneNumber, password }),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  updateProfile: (data) => 
    api.put('/auth/profile', data),
  
  seedDatabase: () => 
    api.post('/auth/seed'),
};

export const mobileService = {
  getMobiles: (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    return api.get('/purchases', { params });
  },
  
  getMobileById: (id) => 
    api.get(`/purchases/${id}`),
  
  addMobile: (data) => 
    api.post('/purchases', data),
  
  updateMobile: (id, data) => 
    api.put(`/purchases/${id}`, data),
  
  deleteMobile: (id) => 
    api.delete(`/purchases/${id}`),
  
  getStats: () => 
    api.get('/purchases/stats'),
  
  getRecent: (limit = 5) => 
    api.get(`/purchases/recent?limit=${limit}`),
};

export const dashboardService = {
  getDashboardStats: () => 
    api.get('/dashboard/stats'),
  
  getRecentActivity: (limit = 10) => 
    api.get(`/dashboard/activity?limit=${limit}`),
  
  getChartData: (range = 'week') => 
    api.get(`/dashboard/charts?range=${range}`),
};

export const shopOwnerService = {
  getShopOwners: (page = 1, limit = 10) => 
    api.get('/shop-owners', { params: { page, limit } }),
  
  getShopOwnerById: (id) => 
    api.get(`/shop-owners/${id}`),
  
  addShopOwner: (data) => 
    api.post('/shop-owners', data),
  
  updateShopOwner: (id, data) => 
    api.put(`/shop-owners/${id}`, data),
  
  deleteShopOwner: (id) => 
    api.delete(`/shop-owners/${id}`),
};

export const reportService = {
  getSalesReport: (startDate, endDate) => 
    api.get(`/reports/sales?startDate=${startDate}&endDate=${endDate}`),
  
  getInventoryReport: () => 
    api.get('/reports/inventory'),
  
  exportReport: (type, reportType, filters = {}) => 
    api.get(`/reports/export/${reportType}`, { 
      params: { format: type, ...filters } 
    }),
};

// تابع تست اتصال
export const checkServerStatus = async () => {
  try {
    const response = await axios.get('https://back-end-v2-qxa5.onrender.com/health', {
      timeout: 10000,
    });
    return { 
      status: 'online', 
      message: 'سرور فعال است',
      data: response.data 
    };
  } catch (error) {
    return { 
      status: 'offline', 
      message: 'سرور در دسترس نیست',
      error: error.message 
    };
  }
};

export default api;