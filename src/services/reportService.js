import API from './api';

export const reportService = {
  // دریافت گزارش روزانه
  getDailyReport: async (date) => {
    try {
      const response = await API.get('/reports/daily', { date });
      return response;
    } catch (error) {
      console.error('Error fetching daily report:', error);
      throw error;
    }
  },

  // دریافت گزارش ماهانه
  getMonthlyReport: async (year, month) => {
    try {
      const response = await API.get('/reports/monthly', { year, month });
      return response;
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      throw error;
    }
  },

  // گزارش دوکانداران
  getShopOwnersReport: async () => {
    try {
      const response = await API.get('/reports/shop-owners');
      return response;
    } catch (error) {
      console.error('Error fetching shop owners report:', error);
      throw error;
    }
  },

  // گزارش بر اساس برند
  getBrandReport: async () => {
    try {
      const response = await API.get('/reports/brands');
      return response;
    } catch (error) {
      console.error('Error fetching brand report:', error);
      throw error;
    }
  },

  // خروجی Excel
  exportToExcel: async (params) => {
    try {
      const response = await API.get('/reports/export', params);
      return response;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }
};