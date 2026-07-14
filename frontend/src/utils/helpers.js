/**
 * Utility Helper Functions
 * File: src/utils/helpers.js
 *
 * Pure utility functions with no side effects.
 * These are imported wherever needed in the app.
 */

/**
 * Format a datetime string for display.
 *
 * @param {string} isoString - ISO 8601 datetime string from API
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 *
 * INTL API CONCEPT:
 * Intl.DateTimeFormat is the browser's built-in internationalization API.
 * It handles timezone, locale, and format differences automatically.
 * Much better than manually formatting dates with string manipulation.
 */
export const formatDate = (isoString, options = {}) => {
  if (!isoString) return 'N/A';

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(isoString));
};

/**
 * Format a datetime string including time.
 *
 * @param {string} isoString
 * @returns {string} e.g. "Jan 15, 2024 at 6:00 PM"
 */
export const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';

  return new Intl.DateTimeFormat('en-US', {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
};

/**
 * Format a currency value.
 *
 * @param {number} amount
 * @param {string} currency
 * @returns {string} e.g. "$25.00"
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Get Tailwind CSS classes for a session status badge.
 *
 * @param {string} status
 * @returns {string} Tailwind classes
 */
export const getStatusColor = (status) => {
  const colors = {
    pending:   'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    confirmed: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    completed: 'bg-green-500/20 text-green-400 border border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
    no_show:   'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400';
};

/**
 * Get Tailwind CSS classes for a rank color.
 * LoL rank colors: Iron=gray, Bronze=orange, Silver=gray, Gold=yellow,
 *                  Platinum=teal, Emerald=green, Diamond=cyan,
 *                  Master=purple, Grandmaster=red, Challenger=gold
 *
 * @param {string} rank
 * @returns {string} Tailwind text color class
 */
export const getRankColor = (rank) => {
  const colors = {
    Iron:         'text-gray-400',
    Bronze:       'text-orange-700',
    Silver:       'text-gray-300',
    Gold:         'text-yellow-400',
    Platinum:     'text-teal-400',
    Emerald:      'text-emerald-400',
    Diamond:      'text-cyan-400',
    Master:       'text-purple-400',
    Grandmaster:  'text-red-500',
    Challenger:   'text-yellow-300',
    Unranked:     'text-gray-500',
  };
  return colors[rank] || 'text-gray-400';
};

/**
 * Get rank emoji for visual flair.
 *
 * @param {string} rank
 * @returns {string}
 */
export const getRankEmoji = (rank) => {
  const emojis = {
    Iron:        '⚙️',
    Bronze:      '🥉',
    Silver:      '🥈',
    Gold:        '🥇',
    Platinum:    '💎',
    Emerald:     '💚',
    Diamond:     '💠',
    Master:      '👑',
    Grandmaster: '🔴',
    Challenger:  '⚔️',
    Unranked:    '—',
  };
  return emojis[rank] || '—';
};

/**
 * Capitalize the first letter of a string.
 * Useful for displaying status values: "pending" → "Pending"
 *
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
};

/**
 * Truncate text to a maximum length, appending "..." if truncated.
 *
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (text, maxLength = 150) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Get initials from a name (for avatar fallbacks).
 * "Viktor Petrovic" → "VP"
 * "Sarah Chen" → "SC"
 *
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Check if a datetime is in the past.
 *
 * @param {string} isoString
 * @returns {boolean}
 */
export const isPast = (isoString) => {
  if (!isoString) return false;
  return new Date(isoString) < new Date();
};

/**
 * Get a relative time string.
 * "2 days ago", "in 3 hours", etc.
 *
 * INTL CONCEPT:
 * Intl.RelativeTimeFormat handles language-specific relative time.
 *
 * @param {string} isoString
 * @returns {string}
 */
export const getRelativeTime = (isoString) => {
  if (!isoString) return '';

  const rtf   = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diff  = new Date(isoString) - new Date();
  const absDiff = Math.abs(diff);

  if (absDiff < 60000)        return rtf.format(Math.round(diff / 1000), 'second');
  if (absDiff < 3600000)      return rtf.format(Math.round(diff / 60000), 'minute');
  if (absDiff < 86400000)     return rtf.format(Math.round(diff / 3600000), 'hour');
  if (absDiff < 2592000000)   return rtf.format(Math.round(diff / 86400000), 'day');
  return rtf.format(Math.round(diff / 2592000000), 'month');
};
