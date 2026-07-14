/**
 * StarRating Component
 *
 * Displays a visual star rating (read-only or interactive).
 *
 * CONDITIONAL RENDERING CONCEPT:
 * We use inline ternary operators for simple true/false rendering.
 * For more complex conditions, early returns or variables work better.
 *
 * @param {number} rating - Current rating value (0-5)
 * @param {Function} onChange - If provided, makes stars clickable
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} showValue - Whether to show the numeric value
 */
export default function StarRating({ rating, onChange, size = 'md', showValue = false }) {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-1">
      {/* Create an array of 5 elements, then map over them */}
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          // Disable the button if no onChange handler (read-only mode)
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`transition-colors ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <svg
            className={`${sizes[size]} transition-colors ${
              // Full star: filled gold
              star <= Math.floor(rating)
                ? 'text-yellow-400'
                // Half star: partial fill (simplified as gold for rating > star - 0.5)
                : star <= rating + 0.5
                ? 'text-yellow-300'
                // Empty star: gray
                : 'text-gray-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      {/* Optional numeric value display */}
      {showValue && rating > 0 && (
        <span className={`text-gray-300 font-medium ml-1 ${textSizes[size]}`}>
          {typeof rating === 'number' ? rating.toFixed(1) : rating}
        </span>
      )}
    </div>
  );
}
