import React, { useEffect, useState } from 'react';
import { 
  FaMobileAlt, 
  FaUsers, 
  FaMoneyBillWave, 
  FaChartLine,
  FaCalendarAlt 
} from 'react-icons/fa';
import StatsCard from '../components/dashboard/StatsCard';
import Chart from '../components/dashboard/Chart';
import RecentActivity from '../components/dashboard/RecentActivity';
import { mobileService } from '../services/mobileService';
import { shopOwnerService } from '../services/shopOwnerService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalMobiles: 0,
    todayMobiles: 0,
    totalShopOwners: 0,
    activeShopOwners: 0,
  });
  const [recentMobiles, setRecentMobiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // دریافت موبایل‌ها
      const mobilesResponse = await mobileService.getMobiles();
      const mobiles = mobilesResponse.data || [];
      
      // فیلتر موبایل‌های امروز
      const today = new Date().toISOString().split('T')[0];
      const todayMobiles = mobiles.filter(mobile => 
        new Date(mobile.createdAt).toISOString().split('T')[0] === today
      );
      
      // دریافت دوکانداران (برای ادمین)
      let shopOwnersData = { data: [] };
      if (isAdmin) {
        shopOwnersData = await shopOwnerService.getShopOwners();
      }
      
      // محاسبه آمار
      setStats({
        totalMobiles: mobiles.length,
        todayMobiles: todayMobiles.length,
        totalShopOwners: shopOwnersData.data?.length || 0,
        activeShopOwners: shopOwnersData.data?.filter(so => so.status === 'active').length || 0,
      });
      
      // ۵ موبایل آخر
      setRecentMobiles(mobiles.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'کل موبایل‌ها',
      value: stats.totalMobiles,
      icon: <FaMobileAlt />,
      color: 'primary',
      change: '+12%',
    },
    {
      title: 'امروز ثبت شده',
      value: stats.todayMobiles,
      icon: <FaCalendarAlt />,
      color: 'success',
      change: '+5%',
    },
    {
      title: 'دوکانداران',
      value: stats.totalShopOwners,
      icon: <FaUsers />,
      color: 'info',
      change: '+8%',
    },
    {
      title: 'فعال',
      value: stats.activeShopOwners,
      icon: <FaChartLine />,
      color: 'warning',
      change: '+3%',
    },
  ];

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>داشبورد مدیریت</h1>
        <p>خلاصه وضعیت سیستم</p>
      </div>

      <div className="stats-grid">
        {statsCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      <div className="dashboard-content">
        <div className="chart-section">
          <div className="section-header">
            <h3>آمار ثبت موبایل‌ها (۷ روز گذشته)</h3>
          </div>
          <Chart />
        </div>

        <div className="activity-section">
          <div className="section-header">
            <h3>آخرین موبایل‌های ثبت شده</h3>
          </div>
          <RecentActivity mobiles={recentMobiles} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;