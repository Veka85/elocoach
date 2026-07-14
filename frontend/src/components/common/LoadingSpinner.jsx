/**
 * LoadingSpinner Component
 * File: src/components/common/LoadingSpinner.jsx
 *
 * COMPONENT CONCEPT:
 * Small, reusable components like this follow the
 * "Single Responsibility Principle" — they do one thing.
 *
 * Props allow customization without code duplication:
 * <LoadingSpinner size="sm" />
 * <LoadingSpinner size="lg" text="Loading coaches..." />
 *
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} text - Optional loading text
 * @param {boolean} fullScreen - If true, centers in viewport
 */
export default function LoadingSpinner({ size = 'md', text = '', fullScreen = false }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* CSS animation via Tailwind's animate-spin */}
      <div className={`${sizes[size]} border-dark-600 border-t-primary-500 rounded-full animate-spin`} />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-900/50 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
