import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaMobileAlt, 
  FaUsers, 
  FaChartBar, 
  FaUser, 
  FaSignOutAlt,
  FaPlus,
  FaList 
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, isAdmin, isShopOwner, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenuItems = [
    { path: '/', icon: <FaTachometerAlt />, label: 'داشبورد' },
    { path: '/mobiles', icon: <FaList />, label: 'لیست موبایل‌ها' },
    { path: '/mobiles/add', icon: <FaPlus />, label: 'ثبت موبایل جدید' },
    { path: '/shop-owners', icon: <FaUsers />, label: 'مدیریت دوکانداران' },
    { path: '/reports', icon: <FaChartBar />, label: 'گزارش‌ها' },
    { path: '/profile', icon: <FaUser />, label: 'پروفایل' },
  ];

  const shopOwnerMenuItems = [
    { path: '/', icon: <FaTachometerAlt />, label: 'داشبورد' },
    { path: '/mobiles', icon: <FaList />, label: 'موبایل‌های من' },
    { path: '/mobiles/add', icon: <FaPlus />, label: 'ثبت موبایل جدید' },
    { path: '/profile', icon: <FaUser />, label: 'پروفایل' },
  ];

  const menuItems = isAdmin ? adminMenuItems : shopOwnerMenuItems;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <FaMobileAlt />
          <h2>مدیریت موبایل</h2>
        </div>
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-details">
            <h4>{user?.name || 'کاربر'}</h4>
            <span className="user-role">
              {isAdmin ? 'مدیر سیستم' : 'دوکاندار'}
            </span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt />
          <span>خروج</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;