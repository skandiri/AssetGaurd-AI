import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import './CreateUserForm.css';

interface UserCredentials {
  email: string;
  temporaryPassword: string;
}

export default function CreateUserForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<UserCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5002/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          mobileNumber: formData.mobileNumber || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const data = await response.json();
      setCredentials(data.data.credentials);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: ''
    });
    setCredentials(null);
    setError('');
  };

  if (credentials) {
    return (
      <div className="create-user-modal">
        <div className="modal-overlay" onClick={onClose}></div>
        <div className="modal-content success">
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={24} />
          </button>

          <div className="success-content">
            <div className="success-icon">✓</div>
            <h2>User Created Successfully!</h2>
            
            <div className="credentials-box">
              <p className="credentials-label">Share these login credentials with the user:</p>
              
              <div className="credential-item">
                <label>Email</label>
                <div className="credential-display">
                  <span>{credentials.email}</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(credentials.email, 'email')}
                    aria-label="Copy email address"
                  >
                    {copiedField === 'email' ? (
                      <Check size={18} className="check-icon" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="credential-item">
                <label>Temporary Password</label>
                <div className="credential-display">
                  <span className="password-text">{credentials.temporaryPassword}</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(credentials.temporaryPassword, 'password')}
                    aria-label="Copy temporary password"
                  >
                    {copiedField === 'password' ? (
                      <Check size={18} className="check-icon" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="info-message">
              <p>⚠️ Please instruct the user to change their password after first login.</p>
            </div>

            <div className="action-buttons">
              <button className="btn-primary" onClick={handleReset}>
                Create Another User
              </button>
              <button className="btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-user-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>

        <h2>Create New User</h2>
        <p className="form-subtitle">Add a new user to the system</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Enter mobile number"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating User...' : 'Create User'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="form-info">
          <p>ℹ️ A temporary password will be generated and must be changed on first login.</p>
        </div>
      </div>
    </div>
  );
}
