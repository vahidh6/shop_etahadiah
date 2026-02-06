import React from 'react';
import { FaBell, FaSearch, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Topbar = () => {
  const { user } = useAuth();

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="جستجو در موبایل‌ها..." 
          />
        </div>
      </div>

      <div className="topbar-right">
        <div className="notifications">
          <FaBell />
          <span className="badge">3</span>
        </div>

        <div className="user-profile">
          <FaUserCircle className="avatar" />
          <div className="user-info">
            <span className="user-name">{user?.name || 'کاربر'}</span>
            <span className="user-role">
              {user?.role === 'admin' ? 'مدیر' : 'دوکاندار'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;