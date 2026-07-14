import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCoach } from '../services/coachService';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/common/StarRating';
import BookingModal from '../components/sessions/BookingModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { getRankColor, getRankEmoji, formatCurrency, formatDate } from '../utils/helpers';

/**
 * CoachProfile Page — Full coach detail view
 * File: src/pages/CoachProfile.jsx
 *
 * KEY CONCEPTS:
 * - useParams() reads the :id from the URL (/coaches/5 → id = "5")
 * - Fetches coach data on mount
 * - Shows booking modal (state-driven)
 */
export default function CoachProfile() {
  const { id }   = useParams(); // Get :id from route /coaches/:id
  const { isAuthenticated, isStudent } = useAuth();

  const [coach, setCoach]     = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchCoach = async () => {
      setLoading(true);
      try {
        const data = await getCoach(id);
        setCoach(data.data);
        setReviews(data.reviews || []);
      } catch (err) {
        setError(err.response?.status === 404
          ? 'Coach not found.'
          : 'Failed to load coach profile.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCoach();
  }, [id]); // Re-fetch if id changes (navigating between profiles)

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" text="Loading profile..." /></div>;
  if (error) return <div className="max-w-2xl mx-auto px-4 py-12"><ErrorMessage message={error} /></div>;
  if (!coach) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/coaches" className="hover:text-primary-400 transition-colors">Coaches</Link>
        <span>/</span>
        <span className="text-gray-300">{coach.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ======= LEFT SIDEBAR: Main Info ======= */}
        <div className="lg:col-span-1 space-y-6">

          {/* Profile Card */}
          <div className="card">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-6">
              {coach.avatar_url ? (
                <img src={coach.avatar_url} alt={coach.name} className="w-24 h-24 rounded-2xl object-cover mb-4" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary-500/20 border border-primary-500/30
                                flex items-center justify-center text-primary-400 text-4xl font-bold mb-4">
                  {coach.name?.charAt(0)}
                </div>
              )}
              <h1 className="text-2xl font-bold text-white">{coach.name}</h1>
              {coach.summoner_name && (
                <p className="text-gray-400 font-mono text-sm mt-1">
                  {coach.summoner_name} · {coach.region}
                </p>
              )}

              {/* Verification badge */}
              {coach.is_verified && (
                <span className="mt-2 badge bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  ✓ Verified Coach
                </span>
              )}
            </div>

            {/* Rank */}
            <div className="flex items-center justify-between py-3 border-t border-dark-600">
              <span className="text-gray-400 text-sm">Current Rank</span>
              <div className="flex items-center gap-1">
                <span>{getRankEmoji(coach.rank)}</span>
                <span className={`font-semibold ${getRankColor(coach.rank)}`}>{coach.rank}</span>
              </div>
            </div>

            {coach.peak_rank && (
              <div className="flex items-center justify-between py-3 border-t border-dark-600">
                <span className="text-gray-400 text-sm">Peak Rank</span>
                <div className="flex items-center gap-1">
                  <span>{getRankEmoji(coach.peak_rank)}</span>
                  <span className={`font-medium ${getRankColor(coach.peak_rank)}`}>{coach.peak_rank}</span>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-dark-600">
              <div className="text-center">
                <p className="text-xl font-bold text-white">{coach.total_sessions}</p>
                <p className="text-xs text-gray-500">Sessions</p>
              </div>
              <div className="text-center border-x border-dark-600">
                <p className="text-xl font-bold text-primary-400">
                  {coach.rating_avg > 0 ? coach.rating_avg.toFixed(1) : '—'}
                </p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">{coach.total_reviews}</p>
                <p className="text-xs text-gray-500">Reviews</p>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="card">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-white">{formatCurrency(coach.hourly_rate)}</p>
              <p className="text-gray-400 text-sm">per hour</p>
            </div>

            {isStudent && coach.is_available ? (
              <button
                onClick={() => {
                  if (!isAuthenticated) window.location.href = '/login';
                  else setBookingOpen(true);
                }}
                className="btn-primary w-full py-3 text-base"
              >
                Book a Session
              </button>
            ) : !coach.is_available ? (
              <div className="text-center py-3 text-gray-400 bg-dark-600 rounded-lg text-sm">
                Not currently available
              </div>
            ) : !isAuthenticated ? (
              <Link to="/login" className="btn-primary w-full py-3 text-base text-center block">
                Login to Book
              </Link>
            ) : null}

            {bookingSuccess && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 text-center">
                ✅ Session booked! Waiting for coach confirmation.
              </div>
            )}

            {/* Social links */}
            {(coach.youtube_url || coach.twitch_url || coach.discord_username) && (
              <div className="mt-4 pt-4 border-t border-dark-600 flex gap-2 justify-center">
                {coach.youtube_url && (
                  <a href={coach.youtube_url} target="_blank" rel="noopener noreferrer"
                     className="text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded bg-dark-600">
                    YouTube
                  </a>
                )}
                {coach.twitch_url && (
                  <a href={coach.twitch_url} target="_blank" rel="noopener noreferrer"
                     className="text-xs text-gray-400 hover:text-purple-400 transition-colors px-2 py-1 rounded bg-dark-600">
                    Twitch
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ======= RIGHT CONTENT: Details ======= */}
        <div className="lg:col-span-2 space-y-6">

          {/* Bio */}
          {coach.bio && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-3">About</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{coach.bio}</p>
            </div>
          )}

          {/* Specializations */}
          {coach.specializations?.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-3">Specializations</h2>
              <div className="flex flex-wrap gap-2">
                {coach.specializations.map((spec) => (
                  <span key={spec} className="badge bg-primary-500/10 text-primary-400 border border-primary-500/20 text-sm px-3 py-1">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Champions */}
          {coach.champions?.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-3">Champion Pool</h2>
              <div className="flex flex-wrap gap-2">
                {coach.champions.map((champ) => (
                  <span key={champ} className="bg-dark-600 text-gray-200 px-3 py-1.5 rounded-lg text-sm">
                    {champ}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {coach.languages?.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-3">Languages</h2>
              <div className="flex gap-2">
                {coach.languages.map((lang) => (
                  <span key={lang} className="badge bg-dark-600 text-gray-300 text-sm px-3 py-1">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Reviews ({coach.total_reviews})
              </h2>
              {coach.rating_avg > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={coach.rating_avg} size="sm" />
                  <span className="text-white font-semibold">{coach.rating_avg.toFixed(1)}</span>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-dark-600 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-sm font-bold text-gray-300">
                          {review.student?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-200">{review.student?.name || 'Student'}</p>
                          <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    {review.comment && (
                      <p className="text-gray-400 text-sm ml-10">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        coach={coach}
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onSuccess={() => { setBookingSuccess(true); setBookingOpen(false); }}
      />
    </div>
  );
}
