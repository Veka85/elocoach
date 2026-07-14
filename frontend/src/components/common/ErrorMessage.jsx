/**
 * ErrorMessage Component
 * Displays API errors or validation messages.
 *
 * @param {string} message - The error text
 * @param {Function} onDismiss - Optional callback to clear the error
 */
export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null; // Render nothing if no error

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
      {/* Error icon */}
      <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-red-400 text-sm flex-1">{message}</p>
      {/* Optional dismiss button */}
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400/60 hover:text-red-400 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
