import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import '../../styles/header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      {/* Left Section */}
      <div className="header-left">
        <button className="hamburger-menu" title="Menu">
          <Menu size={24} />
        </button>
        <nav className="breadcrumb">
          <span className="breadcrumb-item">System</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">My Dashboards</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">Executive Overview</span>
        </nav>
      </div>

      {/* Center Section */}
      <div className="header-center">
        <div className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search assets, serials..."
            className="search-input"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="header-right">
        <button type="button" className="notification-bell" title="Notifications">
          <Bell size={24} />
          <span className="notification-badge"></span>
        </button>
        <div className="user-profile">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-role">ENTERPRISE ACCESS</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
