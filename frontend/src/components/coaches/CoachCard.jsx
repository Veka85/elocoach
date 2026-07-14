import { Link } from 'react-router-dom';
import StarRating from '../common/StarRating';
import { getRankColor, getRankEmoji, truncate, formatCurrency } from '../../utils/helpers';

/**
 * CoachCard Component
 * File: src/components/coaches/CoachCard.jsx
 *
 * Displays a coach's summary in a card format for the coaches listing page.
 *
 * PROPS DESTRUCTURING CONCEPT:
 * Instead of receiving a single `props` object, we destructure directly.
 * ({ coach }) is the same as (props) where you'd access props.coach.
 * It's cleaner and makes it clear what data this component needs.
 *
 * @param {Object} coach - Coach data from CoachResource
 */
export default function CoachCard({ coach }) {
  return (
    <div className="card hover:border-dark-500 transition-all duration-200 flex flex-col group">
      {/* HEADER: Avatar + Name + Status */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          {/* Avatar or initials fallback */}
          {coach.avatar_url ? (
            <img
              src={coach.avatar_url}
              alt={coach.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary-500/20 border border-primary-500/30
                            flex items-center justify-center text-primary-400 text-xl font-bold">
              {coach.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          {/* Available indicator dot */}
          {coach.is_available && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-700"
                 title="Currently available" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-primary-300 transition-colors">
            {coach.name}
          </h3>
          {/* Summoner name in LoL style */}
          {coach.summoner_name && (
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {coach.summoner_name} · {coach.region}
            </p>
          )}
          {/* Rank with color coding */}
          <div className="flex items-center gap-1 mt-1">
            <span>{getRankEmoji(coach.rank)}</span>
            <span className={`text-sm font-medium ${getRankColor(coach.rank)}`}>
              {coach.rank}
            </span>
          </div>
        </div>

        {/* PRICE */}
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-white">
            {formatCurrency(coach.hourly_rate)}
          </p>
          <p className="text-xs text-gray-500">/hour</p>
        </div>
      </div>

      {/* RATING */}
      <div className="flex items-center gap-2 mb-3">
        <StarRating rating={coach.rating_avg} size="sm" />
        <span className="text-sm text-gray-300 font-medium">
          {coach.rating_avg > 0 ? coach.rating_avg.toFixed(1) : 'No reviews'}
        </span>
        {coach.total_reviews > 0 && (
          <span className="text-xs text-gray-500">({coach.total_reviews} reviews)</span>
        )}
        <span className="text-xs text-gray-500 ml-auto">
          {coach.total_sessions} sessions
        </span>
      </div>

      {/* BIO EXCERPT */}
      {coach.bio && (
        <p className="text-sm text-gray-400 flex-1 mb-4 leading-relaxed">
          {truncate(coach.bio, 120)}
        </p>
      )}

      {/* SPECIALIZATIONS */}
      {coach.specializations?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {coach.specializations.slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="badge bg-primary-500/10 text-primary-400 border border-primary-500/20"
            >
              {spec}
            </span>
          ))}
          {coach.specializations.length > 3 && (
            <span className="badge bg-dark-600 text-gray-400">
              +{coach.specializations.length - 3}
            </span>
          )}
        </div>
      )}

      {/* CHAMPIONS */}
      {coach.champions?.length > 0 && (
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-xs text-gray-500">Champions:</span>
          <div className="flex flex-wrap gap-1">
            {coach.champions.slice(0, 3).map((champ) => (
              <span key={champ} className="text-xs text-gray-300 bg-dark-600 px-2 py-0.5 rounded">
                {champ}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER: Languages + View Button */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-dark-600">
        <div className="flex gap-1">
          {coach.languages?.slice(0, 2).map((lang) => (
            <span key={lang} className="text-xs text-gray-500 bg-dark-600 px-2 py-0.5 rounded">
              {lang}
            </span>
          ))}
        </div>
        <Link
          to={`/coaches/${coach.id}`}
          className="btn-primary text-sm py-1.5 px-4"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
