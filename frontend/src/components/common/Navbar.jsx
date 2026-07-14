import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Navbar Component
 * File: src/components/common/Navbar.jsx
 *
 * REACT ROUTER CONCEPT:
 * <Link> renders an <a> tag but uses React Router to navigate
 * WITHOUT a full page reload (single-page app navigation).
 *
 * useNavigate() returns a function to programmatically navigate:
 * navigate('/dashboard') — goes to dashboard after login
 * navigate(-1) — goes back (like browser back button)
 *
 * useLocation() returns the current URL info — we use it to
 * highlight the active nav link.
 *
 * RESPONSIVE DESIGN:
 * We use useState to track mobile menu open/closed state.
 * Tailwind's 'md:' prefix shows/hides elements based on screen width.
 * md:flex = only show as flex on medium screens and up
 */
export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isCoach, logout } = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Helper to check if a nav link is currently active
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinkClass = (path) =>
    `text-sm font-medium transition-colors ${
      isActive(path)
        ? 'text-primary-400'
        : 'text-gray-400 hover:text-gray-100'
    }`;

  return (
    <nav className="bg-dark-900 border-b border-dark-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center
                            group-hover:bg-primary-400 transition-colors">
              <span className="text-dark-950 font-bold text-sm">EC</span>
            </div>
            <span className="font-bold text-white text-lg">
              Elo<span className="text-primary-400">Coach</span>
            </span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/coaches" className={navLinkClass('/coaches')}>Browse Coaches</Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard"  className={navLinkClass('/dashboard')}>Dashboard</Link>
                <Link to="/sessions"   className={navLinkClass('/sessions')}>My Sessions</Link>
                {isAdmin && (
                  <Link to="/admin" className={navLinkClass('/admin')}>
                    <span className="text-red-400">Admin</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* AUTH BUTTONS / USER MENU */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* User avatar and name */}
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30
                                  flex items-center justify-center text-primary-400 text-xs font-bold
                                  group-hover:border-primary-400 transition-colors">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5
                             rounded-lg hover:bg-dark-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* MOBILE MENU — toggles based on menuOpen state */}
        {menuOpen && (
          <div className="md:hidden border-t border-dark-700 py-4 space-y-3">
            <Link to="/coaches"   className="block text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Browse Coaches</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link to="/sessions"  className="block text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>My Sessions</Link>
                <Link to="/profile"   className="block text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Profile</Link>
                {isAdmin && <Link to="/admin" className="block text-red-400 py-2" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block text-gray-400 py-2">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"    className="block text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block text-primary-400 font-medium py-2"  onClick={() => setMenuOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
