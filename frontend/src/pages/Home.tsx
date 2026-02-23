import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X, Shield, Zap, BarChart3, Smartphone, Server, Globe } from 'lucide-react';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <div className="logo-badge">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="12" fill="#7C3AED"/>
                <circle cx="13" cy="13" r="2.5" fill="white"/>
                <circle cx="27" cy="13" r="2.5" fill="white"/>
                <circle cx="20" cy="23" r="2.5" fill="white"/>
                <path d="M13 13L20 23M27 13L20 23" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span>AssetGuard AI</span>
          </div>

          <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#solutions" className="nav-link">Solutions</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#about" className="nav-link">About</a>
            <button 
              onClick={() => navigate('/login')}
              className="nav-btn signin-btn"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="nav-btn primary-btn"
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>

          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-label">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              NEXT-GEN ASSET INTELLIGENCE
            </div>

            <h1 className="hero-title">
              Reliability is our <span className="gradient-text">Bottom Line.</span>
            </h1>

            <p className="hero-description">
              Empower your enterprise with AI-driven condition monitoring. Reduce downtime by 40% with predictive maintenance that actually works.
            </p>

            <div className="hero-buttons">
              <button 
                onClick={() => navigate('/login')}
                className="btn btn-primary"
              >
                Start Free Trial <ArrowRight size={18} />
              </button>
              <button className="btn btn-secondary">
                View Demo
              </button>
            </div>

            <div className="hero-social">
              <div className="avatars">
                <div className="avatar"></div>
                <div className="avatar"></div>
                <div className="avatar"></div>
                <div className="avatar"></div>
              </div>
              <span>500+ industrial leaders trust us</span>
            </div>
          </div>

          <div className="hero-image">
            <div className="image-placeholder">
              <img src="/images/Home page image.jpg" alt="Industrial factory with conveyor systems and robots" />
            </div>
            <div className="status-badge">
              <div className="status-icon"></div>
              <div className="status-text">
                <div className="status-label">SYSTEM UPTIME</div>
                <div className="status-value">99.98%</div>
              </div>
              <div className="status-bar"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Sections Container for Additional Content */}
      <div id="features" className="sections-container">
        {/* Features Section */}
        <section className="features-section">
          <div className="features-header">
            <h2 className="features-title">Comprehensive Asset Management</h2>
            <p className="features-subtitle">
              Designed for accessibility and performance, our platform ensures every user can manage critical infrastructure with ease.
            </p>
          </div>

          <div className="features-grid">
            {/* Feature Card 1 */}
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3 className="feature-title">Bank-Grade Security</h3>
              <p className="feature-description">
                End-to-end encryption for all your sensor data and asset hierarchies.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="feature-card">
              <div className="feature-icon">
                <Zap size={32} />
              </div>
              <h3 className="feature-title">Real-Time Monitoring</h3>
              <p className="feature-description">
                Low-latency streaming of vibration, temperature, and current data.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={32} />
              </div>
              <h3 className="feature-title">Advanced Analytics</h3>
              <p className="feature-description">
                Deep-dive into historical trends with our accessible charting engine.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="feature-card">
              <div className="feature-icon">
                <Smartphone size={32} />
              </div>
              <h3 className="feature-title">Mobile First</h3>
              <p className="feature-description">
                Full functionality on the go. Manage your assets from anywhere.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="feature-card">
              <div className="feature-icon">
                <Server size={32} />
              </div>
              <h3 className="feature-title">Edge Computing</h3>
              <p className="feature-description">
                Process data at the source for instant insights and reduced latency.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="feature-card">
              <div className="feature-icon">
                <Globe size={32} />
              </div>
              <h3 className="feature-title">Global Scale</h3>
              <p className="feature-description">
                Scale from a single site to a global enterprise with ease.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;