// src/components/Layout/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaMobileAlt, 
  FaUsers, 
  FaChartBar, 
  FaUser, 
  FaSignOutAlt,
  FaPlus,
  FaList,
  FaStore,
  FaCog,
  FaBell,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaChevronLeft,
  FaHome,
  FaShoppingCart
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ collapsed, onToggle, isMobile }) => {
  const { user, isAdmin, isShopOwner, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isTablet, setIsTablet] = useState(false);

  // Auto close on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  }, [location]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth >= 769 && window.innerWidth <= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      onToggle();
    }
  };

  const toggleSubmenu = (menuName) => {
    setActiveSubmenu(activeSubmenu === menuName ? null : menuName);
  };

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && mobileOpen && !e.target.closest('.sidebar')) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, mobileOpen]);

  const adminMenuItems = [
    { 
      path: '/', 
      icon: <FaTachometerAlt />, 
      label: 'داشبورد',
      exact: true
    },
    { 
      path: '/mobiles', 
      icon: <FaMobileAlt />, 
      label: 'لیست موبایل‌ها'
    },
    { 
      path: '/mobiles/add', 
      icon: <FaPlus />, 
      label: 'ثبت موبایل جدید'
    },
    {
      icon: <FaStore />,
      label: 'فروشگاه‌ها',
      submenu: [
        { path: '/shops', label: 'مدیریت فروشگاه‌ها' },
        { path: '/shop-owners', label: 'مدیریت دوکانداران' }
      ]
    },
    { 
      path: '/users', 
      icon: <FaUsers />, 
      label: 'کاربران'
    },
    { 
      path: '/reports', 
      icon: <FaChartBar />, 
      label: 'گزارش‌ها'
    },
    { 
      path: '/notifications', 
      icon: <FaBell />, 
      label: 'اعلان‌ها',
      badge: 3
    },
    { 
      path: '/settings', 
      icon: <FaCog />, 
      label: 'تنظیمات'
    },
    { 
      path: '/profile', 
      icon: <FaUser />, 
      label: 'پروفایل'
    },
  ];

  const shopOwnerMenuItems = [
    { 
      path: '/', 
      icon: <FaTachometerAlt />, 
      label: 'داشبورد',
      exact: true
    },
    { 
      path: '/mobiles', 
      icon: <FaList />, 
      label: 'موبایل‌های من'
    },
    { 
      path: '/mobiles/add', 
      icon: <FaPlus />, 
      label: 'ثبت موبایل جدید'
    },
    { 
      path: '/sales', 
      icon: <FaShoppingCart />, 
      label: 'فروش‌های من'
    },
    { 
      path: '/profile', 
      icon: <FaUser />, 
      label: 'پروفایل'
    },
  ];

  const menuItems = isAdmin ? adminMenuItems : shopOwnerMenuItems;

  const renderMenuItem = (item, index) => {
    if (item.submenu) {
      return (
        <li key={index} className={`menu-item ${activeSubmenu === item.label ? 'open' : ''}`}>
          <div 
            className="menu-link submenu-toggle" 
            onClick={() => toggleSubmenu(item.label)}
          >
            <span className="menu-icon">{item.icon}</span>
            {(!collapsed || isMobile || mobileOpen) && (
              <>
                <span className="menu-text">{item.label}</span>
                <span className="submenu-arrow">
                  {activeSubmenu === item.label ? <FaChevronDown /> : <FaChevronLeft />}
                </span>
              </>
            )}
          </div>
          
          {(!collapsed || isMobile || mobileOpen) && (
            <ul className={`submenu ${activeSubmenu === item.label ? 'open' : ''}`}>
              {item.submenu.map((subItem, subIndex) => (
                <li key={subIndex}>
                  <NavLink 
                    to={subItem.path}
                    className={({ isActive }) => isActive ? 'active' : ''}
                    onClick={() => isMobile && setMobileOpen(false)}
                  >
                    <span className="submenu-icon">•</span>
                    <span>{subItem.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={index} className="menu-item">
        <NavLink 
          to={item.path}
          end={item.exact}
          className={({ isActive }) => 
            `menu-link ${isActive ? 'active' : ''}`
          }
          onClick={() => isMobile && setMobileOpen(false)}
        >
          <span className="menu-icon">{item.icon}</span>
          {(!collapsed || isMobile || mobileOpen) && (
            <>
              <span className="menu-text">{item.label}</span>
              {item.badge && (
                <span className="menu-badge">{item.badge}</span>
              )}
            </>
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button 
          className="mobile-toggle-btn"
          onClick={toggleSidebar}
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && mobileOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        sidebar 
        ${collapsed && !isMobile ? 'collapsed' : ''}
        ${mobileOpen ? 'mobile-open' : ''}
        ${isTablet ? 'tablet' : ''}
      `}>
        <div className="sidebar-header">
          <div className="logo">
            <FaMobileAlt className="logo-icon" />
            {(!collapsed || isMobile || mobileOpen) && <h2>مدیریت موبایل</h2>}
            {(collapsed && !isMobile && !mobileOpen) && <h2 className="logo-mini">M</h2>}
          </div>
          
          {!isMobile && (
            <button 
              className="desktop-toggle-btn"
              onClick={toggleSidebar}
              aria-label={collapsed ? "باز کردن منو" : "بستن منو"}
            >
              {collapsed ? <FaChevronLeft /> : <FaChevronRight />}
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {(!collapsed || isMobile || mobileOpen) && (
            <div className="user-details">
              <h4 className="user-name">{user?.name || 'کاربر'}</h4>
              <span className="user-role">
                {isAdmin ? 'مدیر سیستم' : 'دوکاندار'}
              </span>
              <span className="user-email">{user?.email || ''}</span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="menu-list">
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button 
            onClick={handleLogout} 
            className="logout-btn"
          >
            <FaSignOutAlt className="logout-icon" />
            {(!collapsed || isMobile || mobileOpen) && <span>خروج از سیستم</span>}
          </button>
          
          {(!collapsed || isMobile || mobileOpen) && (
            <div className="api-status">
              <div className="status-indicator">
                <span className="status-dot connected"></span>
                <span>API متصل</span>
              </div>
              <code className="api-url">back-end-v2-qxa5.onrender.com</code>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;