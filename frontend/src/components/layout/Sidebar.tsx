import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  Plus,
  MapPin,
  List,
  Smartphone,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  ChevronRight,
  Users,
  Wrench,
  FileText,
  GitBranch,
  Activity,
  ArrowLeftRight,
  Menu,
  X
} from 'lucide-react';
import '../../styles/sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({
    dashboards: false,
    spectralAnalysis: false,
    assetManagement: false,
    userManagement: false,
    assetTaxonomy: false,
    myDevices: false,
    advanceSettings: false
  });

  const toggleMenu = (menu: 'dashboards' | 'spectralAnalysis' | 'assetManagement' | 'userManagement' | 'assetTaxonomy' | 'myDevices' | 'advanceSettings') => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Logo Section */}
      <div className="sidebar-logo">
        <div className="logo-icon">AG</div>
        <span className="logo-text">AssetGuard AI</span>
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="sidebar-toggle-btn"
        title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {/* My Dashboards */}
        <div className="nav-section">
          <button
            className="nav-menu-header"
            onClick={() => toggleMenu('dashboards')}
          >
            <LayoutDashboard size={18} />
            <span>My Dashboards</span>
            {expandedMenus.dashboards ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {expandedMenus.dashboards && (
            <div className="nav-submenu">
              <button 
                onClick={() => navigate('/dashboard/executive-overview')}
                className="nav-item active"
              >
                Executive Overview
              </button>
              <a href="#" className="nav-item">
                Asset Performance
              </a>
              <a href="#" className="nav-item">
                Vibration Analysis
              </a>
            </div>
          )}
        </div>

        {/* Spectral Analysis */}
        <div className="nav-section">
          <button
            className="nav-menu-header"
            onClick={() => toggleMenu('spectralAnalysis')}
          >
            <Activity size={18} />
            <span>Spectral Analysis</span>
            {expandedMenus.spectralAnalysis ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {expandedMenus.spectralAnalysis && (
            <div className="nav-submenu">
              <button
                onClick={() => navigate('/diagnostic/AX-7029-P')}
                className="nav-item"
              >
                <Activity size={16} />
                View Analysis
              </button>
              <button
                onClick={() => navigate('/spectral/SENSOR_001/compare?t1=1761254160&t2=1761257760')}
                className="nav-item"
              >
                <ArrowLeftRight size={16} />
                Compare Spectra
              </button>
            </div>
          )}
        </div>

        {/* Asset Management */}
        <div className="nav-section">
          <button
            className="nav-menu-header"
            onClick={() => toggleMenu('assetManagement')}
          >
            <Layers size={18} />
            <span>Asset Management</span>
            {expandedMenus.assetManagement ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {expandedMenus.assetManagement && (
            <div className="nav-submenu">
              <button
                onClick={() => navigate('/assets/add')}
                className="nav-item"
              >
                <Plus size={16} />
                Add Asset
              </button>
              <button
                onClick={() => navigate('/assets')}
                className="nav-item"
              >
                <MapPin size={16} />
                Asset List
              </button>
            </div>
          )}
        </div>

        {/* User Management */}
        <div className="nav-section">
          <button
            className="nav-menu-header"
            onClick={() => toggleMenu('userManagement')}
          >
            <Users size={18} />
            <span>User Management</span>
            {expandedMenus.userManagement ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {expandedMenus.userManagement && (
            <div className="nav-submenu">
              <button 
                onClick={() => navigate('/user-management')}
                className="nav-item"
              >
                <Plus size={16} />
                Users
              </button>
            </div>
          )}
        </div>

        {/* Asset Taxonomy */}
        <div className="nav-section">
          <button
            className="nav-menu-header"
            onClick={() => toggleMenu('assetTaxonomy')}
          >
            <List size={18} />
            <span>Asset Taxonomy</span>
            {expandedMenus.assetTaxonomy ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {expandedMenus.assetTaxonomy && (
            <div className="nav-submenu">
              <a href="#" className="nav-item">
                Categories
              </a>
              <a href="#" className="nav-item">
                Types
              </a>
              <a href="#" className="nav-item">
                Classifications
              </a>
            </div>
          )}
        </div>

        {/* My Devices */}
        <div className="nav-section">
          <button
            className="nav-menu-header"
            onClick={() => toggleMenu('myDevices')}
          >
            <Smartphone size={18} />
            <span>My Devices</span>
            {expandedMenus.myDevices ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {expandedMenus.myDevices && (
            <div className="nav-submenu">
              <a href="#" className="nav-item">
                Add Device
              </a>
              <a href="#" className="nav-item">
                Device List
              </a>
            </div>
          )}
        </div>

        {/* Advance Settings */}
        <div className="nav-section">
          <button
            className="nav-menu-header"
            onClick={() => toggleMenu('advanceSettings')}
          >
            <Wrench size={18} />
            <span>Advance Settings</span>
            {expandedMenus.advanceSettings ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {expandedMenus.advanceSettings && (
            <div className="nav-submenu">
              <button 
                onClick={() => navigate('/form-builder')}
                className="nav-item"
              >
                <FileText size={16} />
                Form Builder
              </button>
              <a href="#" className="nav-item">
                <GitBranch size={16} />
                Form Rules
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-bottom">
        <a href="#" className="nav-item-main">
          <SettingsIcon size={18} />
          <span>Settings</span>
        </a>
        <button 
          onClick={() => logout()}
          className="nav-item-main logout"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
