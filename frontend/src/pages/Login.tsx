import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, Zap, BarChart3, Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@enterprise.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      showToast('success', 'Welcome back.');
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      setError(message);
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Dark Theme with Features */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-logo-section">
            <div className="logo-icon">
              <svg className="logo-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="12" fill="#7C3AED"/>
                <circle cx="13" cy="13" r="2.5" fill="white"/>
                <circle cx="27" cy="13" r="2.5" fill="white"/>
                <circle cx="20" cy="23" r="2.5" fill="white"/>
                <path d="M13 13L20 23M27 13L20 23" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="logo-text">AssetGuard AI</span>
          </div>

          <div className="login-headline">
            <h1>The OS for</h1>
            <h1 className="gradient-text">Modern Industry.</h1>
          </div>

          {/* Feature Cards */}
          <div className="features-list">
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={24} />
              </div>
              <div className="feature-content">
                <h3>Enterprise Security</h3>
                <p>Military-grade encryption for all your critical infrastructure data.</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Zap size={24} />
              </div>
              <div className="feature-content">
                <h3>Real-time Monitoring</h3>
                <p>Instant anomaly detection with ultra-low latency edge processing.</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={24} />
              </div>
              <div className="feature-content">
                <h3>Predictive Insights</h3>
                <p>AI-driven maintenance schedules to prevent costly system failures.</p>
              </div>
            </div>
          </div>

          <div className="login-footer-left">
            <span className="version">Global Infrastructure v2.4</span>
            <div className="status-indicator">
              <span className="status-dot"></span>
              NETWORK STABLE
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Light Theme with Login Form */}
      <div className="login-right">
        <div className="login-form-container">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to manage your industrial assets and devices.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Username / Email</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  placeholder="admin@enterprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="password-header">
                <label htmlFor="password">Password</label>
                <a href="#forgot" className="forgot-password">Forgot Password?</a>
              </div>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember">Remember me for 30 days</label>
            </div>

            {/* Error Message */}
            {error && <div className="error-alert">{error}</div>}

            {/* Submit Button */}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Log In'}
              <span className="btn-arrow">→</span>
            </button>
          </form>

          <div className="form-footer">
            <p className="enterprise-label">ENTERPRISE ACCESS ONLY</p>
            <p className="signup-text">
              Need an account? <a href="#contact" className="contact-link">Contact IT Administrator</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;