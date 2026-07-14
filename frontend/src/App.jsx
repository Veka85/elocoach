import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages — lazy imports would be better for production (code splitting)
// but explicit imports are clearer for learning
import Landing      from './pages/Landing';
import Login        from './pages/Login';
import Register     from './pages/Register';
import Coaches      from './pages/Coaches';
import CoachProfile from './pages/CoachProfile';
import Dashboard    from './pages/Dashboard';
import Sessions     from './pages/Sessions';
import SessionDetail from './pages/SessionDetail';
import Profile      from './pages/Profile';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminSessions  from './pages/admin/AdminSessions';

/**
 * App Component — Root of the React application
 * File: src/App.jsx
 *
 * ROUTER CONCEPT:
 * React Router v6 provides client-side routing.
 * <BrowserRouter> uses the browser's History API for clean URLs (/coaches, /dashboard).
 * <Routes> + <Route> maps URL paths to components.
 *
 * NESTING ROUTES:
 * The <Route path="/" element={<Layout />}> pattern renders a shared layout
 * (like Navbar) around all child routes.
 *
 * PROTECTED ROUTES:
 * We use wrapper components (ProtectedRoute, AdminRoute) to check auth
 * and redirect unauthenticated users to /login.
 */

/**
 * ProtectedRoute — Requires authentication.
 * If not logged in: redirect to /login.
 * Shows spinner while auth is being checked.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // <Navigate> is a declarative redirect component in React Router v6
  // replace={true} replaces the history entry so "back" doesn't loop
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * AdminRoute — Requires admin role.
 * Redirects coaches and students who try to access admin pages.
 */
function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * GuestRoute — Redirects logged-in users away from auth pages.
 * If logged in and trying to visit /login: redirect to /dashboard.
 */
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * AppLayout — Wraps pages with the Navbar and footer
 */
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-dark-800 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-dark-900 border-t border-dark-700 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 EloCoach. All rights reserved. Not affiliated with Riot Games.
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Main App component — combines Provider + Router + Routes
 */
export default function App() {
  return (
    // AuthProvider wraps everything so auth context is available everywhere
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/"              element={<Landing />} />
            <Route path="/coaches"       element={<Coaches />} />
            <Route path="/coaches/:id"   element={<CoachProfile />} />

            {/* GUEST-ONLY ROUTES — redirect if already logged in */}
            <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            {/* PROTECTED ROUTES — require auth */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/sessions"  element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
            <Route path="/sessions/:id" element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* ADMIN ROUTES — require admin role */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/sessions" element={<AdminRoute><AdminSessions /></AdminRoute>} />

            {/* 404 FALLBACK */}
            <Route path="*" element={
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-8xl mb-4">🗺️</p>
                  <h1 className="text-3xl font-bold text-white mb-2">404 — Page Not Found</h1>
                  <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn-primary inline-block">Go Home</a>
                </div>
              </div>
            } />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
