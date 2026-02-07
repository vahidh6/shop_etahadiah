// src/components/Layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Layout.css';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="layout-container">
      <Sidebar 
        collapsed={isMobile ? false : sidebarCollapsed}
        onToggle={toggleSidebar}
        isMobile={isMobile}
      />
      
      <main className={`
        main-content 
        ${sidebarCollapsed && !isMobile ? 'sidebar-collapsed' : ''}
        ${isMobile ? 'mobile' : ''}
      `}>
        {isMobile && <Topbar />}
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;