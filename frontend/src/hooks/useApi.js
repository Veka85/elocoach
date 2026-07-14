import { useState, useCallback } from 'react';

/**
 * useApi — Custom hook for API calls with loading/error state
 * File: src/hooks/useApi.js
 *
 * CUSTOM HOOK PATTERN:
 * This hook abstracts the repetitive pattern of:
 * - isLoading state
 * - error state
 * - data state
 * - try/catch error handling
 *
 * WITHOUT this hook, every component would repeat:
 *   const [data, setData] = useState(null);
 *   const [loading, setLoading] = useState(false);
 *   const [error, setError] = useState(null);
 *   try { setLoading(true); setData(await apiCall()); }
 *   catch(e) { setError(e.response?.data?.message || 'Error'); }
 *   finally { setLoading(false); }
 *
 * WITH this hook, it becomes:
 *   const { execute, loading, error } = useApi(apiFunction);
 *   const result = await execute(params);
 *
 * CALLBACK CONCEPT:
 * useCallback(fn, []) memoizes the execute function.
 * Without memoization, each render creates a new function reference,
 * which could trigger unnecessary re-renders in child components.
 *
 * @param {Function} apiFunction - The API call to execute (from services/)
 * @returns {{ execute, loading, error, data, setError }}
 */
export function useApi(apiFunction) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [data, setData]       = useState(null);

  /**
   * Execute the API call.
   * Returns the result on success, or null on failure (error is set).
   */
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      // Extract error message from Axios error response
      // err.response?.data?.message — server returned JSON with message
      // err.message — network error or unknown
      const message = err.response?.data?.message
                   || err.response?.data?.error
                   || err.message
                   || 'An unexpected error occurred';

      setError(message);
      return null;
    } finally {
      // Always stop loading, whether success or failure
      setLoading(false);
    }
  }, [apiFunction]);

  return { execute, loading, error, data, setError };
}

/**
 * useFormErrors — Extracts Laravel validation errors for form fields
 *
 * Laravel returns validation errors like:
 * {
 *   message: "The given data was invalid.",
 *   errors: {
 *     email: ["The email has already been taken."],
 *     password: ["The password must be at least 8 characters."]
 *   }
 * }
 *
 * This hook provides helpers to display field-specific errors.
 *
 * @param {Object|null} axiosError - The caught Axios error object
 */
export function useFormErrors(axiosError) {
  const errors = axiosError?.response?.data?.errors || {};

  /**
   * Get the first error message for a specific field.
   * @param {string} field - Field name (e.g., 'email', 'password')
   * @returns {string|null}
   */
  const getError = (field) => {
    return errors[field]?.[0] || null;
  };

  return { errors, getError };
}
