import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Register Page
 * File: src/pages/Register.jsx
 *
 * Multi-field registration form with role selection.
 * Shows different optional fields based on selected role.
 *
 * CONDITIONAL RENDERING:
 * We show the coach-specific field hint only when role === 'coach'.
 * This is a simple conditional: {role === 'coach' && <div>...</div>}
 */
export default function Register() {
  const [formData, setFormData] = useState({
    name:     '',
    email:    '',
    password: '',
    password_confirmation: '',
    role:     'student', // Default to student
    summoner_name: '',
    region:   'EUW',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  // Generic change handler — updates any field in formData
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Spread operator creates new object — preserves other fields while updating this one
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const user = await register(formData);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 422) {
        // Laravel validation errors — show per-field
        setFieldErrors(err.response.data.errors || {});
        setError(err.response.data.message || 'Please fix the errors below.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Gets the first error for a field (Laravel returns arrays of errors)
  const getFieldError = (field) => fieldErrors[field]?.[0];

  const regions = ['EUW', 'EUNE', 'NA', 'KR', 'JP', 'BR', 'LAN', 'LAS', 'OCE', 'TR', 'RU'];

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
            <p className="text-gray-400 mt-2">Start improving your LoL skills today</p>
          </div>

          {error && <div className="mb-5"><ErrorMessage message={error} /></div>}

          {/* Role selector — shown first as it affects the form */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'student', label: 'I want coaching', icon: '🎮' },
              { value: 'coach', label: 'I want to coach', icon: '🎯' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: opt.value }))}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  formData.role === opt.value
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-dark-600 bg-dark-700 text-gray-400 hover:border-dark-500'
                }`}
              >
                <span className="text-2xl block mb-1">{opt.icon}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="form-label">Full Name</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className={`form-input ${getFieldError('name') ? 'border-red-500' : ''}`}
              />
              {getFieldError('name') && <p className="text-red-400 text-xs mt-1">{getFieldError('name')}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className={`form-input ${getFieldError('email') ? 'border-red-500' : ''}`}
              />
              {getFieldError('email') && <p className="text-red-400 text-xs mt-1">{getFieldError('email')}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className={`form-input ${getFieldError('password') ? 'border-red-500' : ''}`}
              />
              {getFieldError('password') && <p className="text-red-400 text-xs mt-1">{getFieldError('password')}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label">Confirm Password</label>
              <input
                name="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Repeat password"
                required
                className="form-input"
              />
            </div>

            {/* Summoner Name + Region — optional but encouraged */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="form-label">Summoner Name <span className="text-gray-500 font-normal">(optional)</span></label>
                <input
                  name="summoner_name"
                  type="text"
                  value={formData.summoner_name}
                  onChange={handleChange}
                  placeholder="In-game name"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Region</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="form-input"
                >
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Coach-specific note */}
            {formData.role === 'coach' && (
              <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-4 text-sm text-gray-400">
                <span className="text-primary-400 font-medium">Coach accounts</span> require admin verification
                before appearing in search results. You can complete your profile while waiting for approval.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  Creating account...
                </span>
              ) : `Create ${formData.role === 'coach' ? 'Coach' : 'Student'} Account`}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
