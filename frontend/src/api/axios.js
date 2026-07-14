import axios from 'axios';

/**
 * Axios Configuration
 * File: src/api/axios.js
 *
 * AXIOS CONCEPT:
 * Axios is an HTTP client library. We could use the browser's native fetch(),
 * but Axios provides:
 * 1. Automatic JSON parsing (fetch requires response.json() manually)
 * 2. Request/response interceptors (add auth headers automatically)
 * 3. Better error handling
 * 4. Request cancellation
 * 5. Automatic request retries (with additional plugins)
 *
 * INSTANCE CONCEPT:
 * Instead of using the global axios object, we create an INSTANCE
 * with our app's defaults. All services import THIS instance,
 * so changing the base URL or auth logic here affects the whole app.
 *
 * ENVIRONMENT VARIABLE CONCEPT:
 * import.meta.env.VITE_API_URL reads from the .env file.
 * VITE_ prefix is required for Vite to expose env vars to client code.
 * Never put secrets in .env files on the frontend — they're public!
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Required for Sanctum cookie-based auth (if used)
});

/**
 * REQUEST INTERCEPTOR:
 * Runs BEFORE every request is sent.
 * We use it to automatically attach the auth token to every request.
 *
 * Without this, every service would need to manually add:
 * headers: { Authorization: `Bearer ${token}` }
 *
 * This is the "don't repeat yourself" (DRY) principle in action.
 */
api.interceptors.request.use(
  (config) => {
    // Read the token from localStorage
    // localStorage persists across browser sessions (unlike sessionStorage)
    const token = localStorage.getItem('auth_token');

    if (token) {
      // Attach token to every outgoing request
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // If there's an error building the request (rare), reject it
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR:
 * Runs AFTER every response is received.
 * We use it to handle global error cases like expired tokens.
 */
api.interceptors.response.use(
  // Success case: return the response as-is
  (response) => response,

  // Error case: handle specific HTTP errors globally
  (error) => {
    if (error.response?.status === 401) {
      // 401 means our token is expired or invalid.
      // Clean up and redirect to login.
      // Note: We don't import useNavigate here (hooks only work in components).
      // Instead, we clear the token and use window.location for redirection.
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      // Only redirect if not already on the login page (prevent redirect loops)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Re-throw so the calling code can handle it (show error messages, etc.)
    return Promise.reject(error);
  }
);

export default api;
