import { Link } from 'react-router-dom';
import { formatDateTime, formatCurrency, getStatusColor, capitalize } from '../../utils/helpers';

/**
 * SessionCard Component
 * Displays a coaching session summary in card format.
 *
 * @param {Object} session - Session data from SessionResource
 * @param {string} viewAs - 'coach' | 'student' — affects what info is shown
 */
export default function SessionCard({ session, viewAs = 'student' }) {
  const otherParty = viewAs === 'student' ? session.coach : session.student;
  const otherLabel = viewAs === 'student' ? 'Coach' : 'Student';

  return (
    <div className="card hover:border-dark-500 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-4">
        {/* Other party info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center
                          text-gray-300 font-semibold text-sm border border-dark-500">
            {otherParty?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{otherLabel}</p>
            <p className="font-medium text-white">{otherParty?.name || 'Unknown'}</p>
            {otherParty?.summoner_name && (
              <p className="text-xs text-gray-500 font-mono">{otherParty.summoner_name}</p>
            )}
          </div>
        </div>

        {/* Status badge */}
        <span className={`badge ${getStatusColor(session.status)}`}>
          {capitalize(session.status)}
        </span>
      </div>

      {/* Session details */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-gray-500 text-xs mb-1">Scheduled</p>
          <p className="text-gray-200">{formatDateTime(session.scheduled_at)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Duration</p>
          <p className="text-gray-200">{session.duration_minutes} minutes</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Price</p>
          <p className="text-gray-200">{formatCurrency(session.price)}</p>
        </div>
        {session.meet_link && session.status === 'confirmed' && (
          <div>
            <p className="text-gray-500 text-xs mb-1">Meeting</p>
            <a
              href={session.meet_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 text-sm"
            >
              Join →
            </a>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-dark-600">
        <Link
          to={`/sessions/${session.id}`}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          View Details →
        </Link>
        {/* Quick action hints */}
        {session.status === 'pending' && viewAs === 'coach' && (
          <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
            Awaiting your confirmation
          </span>
        )}
        {session.status === 'completed' && !session.has_review && viewAs === 'student' && (
          <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-1 rounded">
            Leave a review!
          </span>
        )}
      </div>
    </div>
  );
}
