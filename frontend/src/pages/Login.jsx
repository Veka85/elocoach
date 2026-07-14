import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Login Page
 * File: src/pages/Login.jsx
 *
 * FORM HANDLING PATTERN:
 * 1. useState for each field (controlled inputs)
 * 2. onSubmit handler calls auth service
 * 3. Loading state prevents double-submission
 * 4. Error state shows API errors
 * 5. Navigate after success based on user role
 *
 * VALIDATION CONCEPT:
 * - Browser-level: required attribute, type="email"
 * - Server-level: Laravel's LoginRequest validates the data
 * - Client-level: we could add JS validation but server validation is authoritative
 */
export default function Login() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await login(email, password);

      // Redirect based on role after login
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500/20 border border-primary-500/30 rounded-2xl
                            flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚔️</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-gray-400 mt-2">Sign in to your EloCoach account</p>
          </div>

          {/* Error message */}
          {error && <div className="mb-5"><ErrorMessage message={error} onDismiss={() => setError(null)} /></div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="form-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label" htmlFor="password" style={{marginBottom: 0}}>Password</label>
                <a href="#" className="text-xs text-primary-400 hover:text-primary-300">Forgot password?</a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 p-4 bg-dark-800 rounded-xl border border-dark-600">
            <p className="text-xs text-gray-500 font-medium mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-gray-400 font-mono">
              <p>Admin: admin@elocoach.gg / password</p>
              <p>Coach: coach@elocoach.gg / password</p>
              <p>Student: student@elocoach.gg / password</p>
            </div>
          </div>

          {/* Register link */}
          <p className="text-center text-gray-400 text-sm mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
