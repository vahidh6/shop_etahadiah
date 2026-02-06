import API from './api';

export const shopOwnerService = {
  // دریافت همه دوکانداران (فقط ادمین)
  getAllShopOwners: async (params = {}) => {
    try {
      const response = await API.get('/shop-owners', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // دریافت دوکاندار بر اساس ID
  getShopOwnerById: async (id) => {
    try {
      const response = await API.get(`/shop-owners/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ایجاد دوکاندار جدید (فقط ادمین)
  createShopOwner: async (shopOwnerData) => {
    try {
      const response = await API.post('/shop-owners', shopOwnerData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // آپدیت دوکاندار
  updateShopOwner: async (id, shopOwnerData) => {
    try {
      const response = await API.put(`/shop-owners/${id}`, shopOwnerData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // فعال/غیرفعال کردن دوکاندار
  toggleShopOwnerStatus: async (id, status) => {
    try {
      const response = await API.patch(`/shop-owners/${id}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // دریافت آمار دوکانداران
  getShopOwnersStats: async () => {
    try {
      const response = await API.get('/shop-owners/stats');
      return response;
    } catch (error) {
      throw error;
    }
  }
};