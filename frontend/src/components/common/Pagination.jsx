/**
 * Pagination Component
 *
 * Renders page navigation buttons.
 * Purely presentational — all state is managed by the parent.
 *
 * CONTROLLED COMPONENT CONCEPT:
 * This component doesn't manage its own state.
 * The parent controls the current page (via currentPage prop)
 * and provides the handler (via onPageChange prop).
 * This is called a "controlled component" pattern.
 *
 * @param {number} currentPage - The active page
 * @param {number} lastPage - Total number of pages
 * @param {Function} onPageChange - Called with new page number when clicked
 * @param {number} total - Total number of items (for display)
 */
export default function Pagination({ currentPage, lastPage, onPageChange, total }) {
  if (lastPage <= 1) return null; // No pagination needed for single page

  // Generate page numbers to show (max 7 pages: current ± 2, first, last, with ellipsis)
  const getPageNumbers = () => {
    const pages = [];
    const range = 2; // Pages shown around current page

    for (let i = 1; i <= lastPage; i++) {
      // Always show first, last, and pages near current
      if (
        i === 1 ||
        i === lastPage ||
        (i >= currentPage - range && i <= currentPage + range)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-8">
      {total !== undefined && (
        <p className="text-sm text-gray-400">
          Page {currentPage} of {lastPage} ({total} total)
        </p>
      )}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600
                     text-gray-300 hover:bg-dark-600 disabled:opacity-40
                     disabled:cursor-not-allowed transition-colors text-sm"
        >
          ← Prev
        </button>

        {/* Page number buttons */}
        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...' || page === currentPage}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              page === currentPage
                ? 'bg-primary-500 text-dark-950 font-semibold'
                : page === '...'
                ? 'text-gray-500 cursor-default'
                : 'bg-dark-700 border border-dark-600 text-gray-300 hover:bg-dark-600'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600
                     text-gray-300 hover:bg-dark-600 disabled:opacity-40
                     disabled:cursor-not-allowed transition-colors text-sm"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
