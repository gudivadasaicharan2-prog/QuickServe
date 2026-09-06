import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { saveToken } from '../utils/authService';
import './Login.css';

const BASE_URL = 'http://localhost:8080';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Invalid username or password');
        throw new Error('Login failed. Please try again.');
      }

      const data = await response.json();
      if (data.token) {
        saveToken(data.token);
        navigate('/');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand__icon">
            <ChefHat size={24} strokeWidth={2} />
          </div>
          <div>
            <h1 className="login-brand__name">QuickServe</h1>
            <p className="login-brand__sub">Restaurant Management</p>
          </div>
        </div>

        <div className="login-divider" />

        <h2 className="login-title">Owner Login</h2>
        <p className="login-subtitle">Sign in to manage your restaurant</p>

        {error && (
          <div className="login-error" role="alert">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div className="login-password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16 }} />
                Signing in…
              </>
            ) : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
