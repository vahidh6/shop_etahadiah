import API from './api';

export const mobileService = {
  // دریافت همه موبایل‌ها
  getAllMobiles: async (params = {}) => {
    try {
      const response = await API.get('/mobiles', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // دریافت موبایل بر اساس ID
  getMobileById: async (id) => {
    try {
      const response = await API.get(`/mobiles/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ثبت موبایل جدید
  createMobile: async (mobileData) => {
    try {
      const response = await API.post('/mobiles', mobileData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // آپدیت موبایل
  updateMobile: async (id, mobileData) => {
    try {
      const response = await API.put(`/mobiles/${id}`, mobileData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // حذف موبایل
  deleteMobile: async (id) => {
    try {
      const response = await API.delete(`/mobiles/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // جستجوی موبایل بر اساس IMEI
  searchByIMEI: async (imei) => {
    try {
      const response = await API.get(`/mobiles/search/imei/${imei}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // دریافت موبایل‌های دوکاندار جاری
  getMyMobiles: async () => {
    try {
      const response = await API.get('/mobiles/my-mobiles');
      return response;
    } catch (error) {
      throw error;
    }
  }
};