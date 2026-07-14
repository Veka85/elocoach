/**
 * StatsCard Component
 * Displays a single dashboard statistic.
 *
 * @param {string} title - Stat label
 * @param {string|number} value - The statistic value
 * @param {string} subtitle - Additional context (e.g., "this month")
 * @param {string} icon - Emoji or icon to display
 * @param {string} trend - Optional trend indicator ("+15%", "-3%")
 * @param {string} color - Color variant ('gold', 'blue', 'green', 'red')
 */
export default function StatsCard({ title, value, subtitle, icon, trend, color = 'gold' }) {
  const colorClasses = {
    gold:  'bg-primary-500/10 border-primary-500/20 text-primary-400',
    blue:  'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    red:   'bg-red-500/10 border-red-500/20 text-red-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  };

  const trendPositive = trend?.startsWith('+');

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trendPositive
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
