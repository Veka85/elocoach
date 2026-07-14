import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/**
 * AuthContext
 * File: src/context/AuthContext.jsx
 *
 * CONTEXT CONCEPT:
 * React's Context API solves "prop drilling" — the problem of passing
 * data through many component levels.
 *
 * Without Context:
 * App → Navbar → UserMenu → Avatar  (user must be passed as prop each level)
 *
 * With Context:
 * App (provides user)
 * └── Navbar (reads user directly from context)
 * └── UserMenu (reads user directly from context)
 * └── Avatar (reads user directly from context)
 *
 * The user data "lives" in context and any component can access it
 * without explicit prop passing.
 *
 * HOW IT WORKS:
 * 1. createContext() creates the context object
 * 2. AuthProvider wraps the app and provides values
 * 3. useAuth() hook lets components consume the context
 *
 * STATE MANAGEMENT DECISION:
 * We use React Context for auth state because:
 * - It's built into React (no extra library)
 * - Auth state doesn't change often (only on login/logout)
 * - It's globally accessible
 *
 * For complex state (like fetched data with caching), use React Query or Zustand.
 */

// Create the context with undefined default (useAuth will throw if used outside Provider)
const AuthContext = createContext(undefined);

/**
 * AuthProvider — wraps the application and provides auth state
 *
 * PROVIDER PATTERN:
 * The Provider component holds the state and makes it available
 * to all children via Context. You wrap your entire app with it.
 */
export function AuthProvider({ children }) {
  // null = not yet checked, false = checked but not logged in, object = logged in user
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true); // True on initial load (checking if logged in)

  /**
   * On app startup, check if there's a stored token and validate it.
   *
   * USEEFFECT CONCEPT:
   * useEffect runs after the component mounts (and optionally when dependencies change).
   * The empty [] means "run once on mount" — like componentDidMount in class components.
   *
   * WHY CHECK TOKEN ON MOUNT:
   * When the user refreshes the page, React state is lost.
   * We store the token in localStorage so we can re-authenticate on reload.
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');

      if (token) {
        try {
          // Verify the token is still valid by fetching current user
          const response = await api.get('/auth/me');
          setUser(response.data.data);
        } catch (error) {
          // Token is invalid or expired — clean up
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      setLoading(false); // Finished checking — app can now render
    };

    initAuth();
  }, []);

  /**
   * Login: authenticate and store user in state + localStorage
   *
   * useCallback memoizes the function — prevents unnecessary re-renders
   * of children that receive this as a prop.
   */
  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { data, token } = response.data;

    // Store token for persistent auth across page reloads
    localStorage.setItem('auth_token', token);

    // Update the axios instance (interceptor will pick this up for next requests)
    setUser(data);

    return data; // Return user so calling code can redirect based on role
  }, []);

  /**
   * Register: create account and auto-login
   */
  const register = useCallback(async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { data, token } = response.data;

    localStorage.setItem('auth_token', token);
    setUser(data);

    return data;
  }, []);

  /**
   * Logout: revoke token and clear state
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if the API call fails, we still want to clear local state
      console.warn('Logout API call failed:', error.message);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  }, []);

  /**
   * Update user in context (e.g., after profile update)
   */
  const updateUser = useCallback((updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  }, []);

  // =========================================================
  // ROLE HELPER COMPUTED VALUES
  // Derived from user state — no extra state needed.
  // =========================================================
  const isAuthenticated = !!user;
  const isAdmin   = user?.role === 'admin';
  const isCoach   = user?.role === 'coach';
  const isStudent = user?.role === 'student';

  // The VALUE object is what all consumers get via useAuth()
  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isCoach,
    isStudent,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — custom hook to consume the AuthContext
 *
 * CUSTOM HOOK CONCEPT:
 * Custom hooks let you extract and reuse stateful logic.
 * They MUST start with 'use' so React knows they're hooks.
 *
 * Usage in any component:
 *   const { user, isCoach, logout } = useAuth();
 *
 * This is cleaner than: const { user } = useContext(AuthContext)
 * And includes the error check below.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
