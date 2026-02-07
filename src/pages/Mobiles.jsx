// src/pages/Mobiles.jsx - نسخه کامل اصلاح شده
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Mobiles.css';

const Mobiles = () => {
  const navigate = useNavigate();
  const [mobiles, setMobiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [endpoint, setEndpoint] = useState('');

  const API_BASE_URL = 'https://back-end-v2-qxa5.onrender.com';

  // استفاده از useCallback برای جلوگیری از dependency warning
  const fetchMobiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setError('لطفاً ابتدا وارد سیستم شوید');
        alert('لطفاً ابتدا وارد سیستم شوید');
        navigate('/login');
        return;
      }

      // endpointهای ممکن
      const possibleEndpoints = [
        '/api/admin/purchases',
        '/api/purchases',
        '/api/purchase',
        '/api/purchase/all',
        '/api/items'
      ];

      let apiResponse = null;
      let foundEndpoint = '';

      // تست endpointها
      for (const ep of possibleEndpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${ep}`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            apiResponse = await response.json();
            foundEndpoint = ep;
            break;
          }
        } catch (err) {
          console.log(`${ep} خطا: ${err.message}`);
        }
      }

      if (!apiResponse) {
        throw new Error('نقطه دسترسی API پیدا نشد');
      }

      setEndpoint(foundEndpoint);
      localStorage.setItem('api_endpoint', foundEndpoint);

      // پردازش داده‌های دریافتی
      if (Array.isArray(apiResponse)) {
        setMobiles(apiResponse);
      } else if (apiResponse && typeof apiResponse === 'object') {
        // جستجوی آرایه در object
        const possibleArrayKeys = ['purchases', 'items', 'data', 'list', 'results'];
        
        for (const key of possibleArrayKeys) {
          if (Array.isArray(apiResponse[key])) {
            setMobiles(apiResponse[key]);
            return;
          }
        }
        
        // اگر آرایه پیدا نشد
        setMobiles([]);
      } else {
        setMobiles([]);
      }
      
    } catch (err) {
      console.error('خطا در دریافت موبایل‌ها:', err);
      setError(err.message);
      setMobiles([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]); // اضافه کردن navigate به dependencies

  useEffect(() => {
    fetchMobiles();
  }, [fetchMobiles]); // اضافه کردن fetchMobiles به dependency array

  // بقیه کد بدون تغییر...
};
