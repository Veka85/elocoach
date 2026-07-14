import { useState, useEffect, useCallback } from 'react';
import { getCoaches } from '../services/coachService';
import CoachCard from '../components/coaches/CoachCard';
import CoachFilters from '../components/coaches/CoachFilters';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

/**
 * Coaches Page — Browse and filter all verified coaches
 * File: src/pages/Coaches.jsx
 *
 * KEY CONCEPTS DEMONSTRATED:
 *
 * 1. MULTIPLE useEffect: One for initial load, one for filter changes
 *
 * 2. DEBOUNCING: We add a delay before fetching when search changes
 *    to avoid making an API request for every keystroke.
 *    "apple" = 5 requests without debounce, 1 with debounce.
 *
 * 3. STATE LIFTING: Filter state lives HERE (parent), not in CoachFilters.
 *    This allows Coaches.jsx to use filter values to fetch data.
 *    CoachFilters receives filters as props and reports changes up.
 */
export default function Coaches() {
  const [coaches, setCoaches] = useState([]);
  const [meta, setMeta]       = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filters, setFilters] = useState({
    search:    '',
    rank:      '',
    region:    '',
    max_price: '',
    sort:      'rating',
    page:      1,
  });

  /**
   * Fetch coaches whenever filters change.
   *
   * useCallback memoizes this function so it doesn't recreate on every render.
   * Without useCallback, the function reference changes every render,
   * causing the useEffect dependency to change, causing infinite loops.
   */
  const fetchCoaches = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);

    try {
      // Remove empty filter values before sending to API
      const params = Object.fromEntries(
        Object.entries(currentFilters).filter(([, v]) => v !== '' && v !== null)
      );

      const data = await getCoaches(params);
      setCoaches(data.data);
      setMeta(data.meta);
    } catch (err) {
      setError('Failed to load coaches. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * DEBOUNCED SEARCH:
   * When search input changes, wait 300ms before fetching.
   * If user types another character within 300ms, cancel the previous timer.
   *
   * useEffect CLEANUP:
   * The function returned from useEffect runs when:
   * - The component unmounts
   * - The effect re-runs (before the next run)
   *
   * We use it here to clear the timer when filters change quickly.
   */
  useEffect(() => {
    const delay = filters.search ? 300 : 0; // Debounce search, immediate for other filters

    const timer = setTimeout(() => {
      fetchCoaches(filters);
    }, delay);

    return () => clearTimeout(timer); // Cleanup: cancel pending timer
  }, [filters, fetchCoaches]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    // Scroll to top when changing pages for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Find Your Coach</h1>
        <p className="text-gray-400">
          Browse {meta.total > 0 ? meta.total : ''} verified League of Legends coaches
        </p>
      </div>

      {/* Filters */}
      <CoachFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Results */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" text="Loading coaches..." />
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : coaches.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-semibold text-white mb-2">No coaches found</h3>
          <p className="text-gray-400">Try adjusting your filters or search terms.</p>
          <button
            onClick={() => setFilters({ search: '', rank: '', region: '', max_price: '', sort: 'rating', page: 1 })}
            className="btn-secondary mt-4"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Results count */}
          <p className="text-sm text-gray-500 mb-4">
            Showing {coaches.length} of {meta.total} coaches
          </p>

          {/* Coach grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={handlePageChange}
            total={meta.total}
          />
        </>
      )}
    </div>
  );
}
