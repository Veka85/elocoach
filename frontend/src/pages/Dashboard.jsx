import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatsCard from '../components/dashboard/StatsCard';
import SessionCard from '../components/sessions/SessionCard';
import StarRating from '../components/common/StarRating';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { formatCurrency, formatDate } from '../utils/helpers';

/**
 * Dashboard Page
 * File: src/pages/Dashboard.jsx
 *
 * Shows role-appropriate statistics and recent activity.
 * The API returns different data based on the authenticated user's role.
 *
 * This demonstrates how one page can serve multiple user types
 * by switching on the 'role' field from the API response.
 */
export default function Dashboard() {
  const { user, isCoach, isStudent } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" text="Loading dashboard..." /></div>;
  if (error) return <div className="max-w-2xl mx-auto px-4 py-12"><ErrorMessage message={error} /></div>;
  if (!data) return null;

  const stats = data.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, <span className="text-primary-400">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1">
          {isCoach ? "Here's your coaching overview." : "Here's your learning progress."}
        </p>

        {/* Coach verification warning */}
        {isCoach && !stats.is_verified && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3">
            <span className="text-yellow-400 text-xl">⏳</span>
            <div>
              <p className="text-yellow-400 font-medium text-sm">Account Pending Verification</p>
              <p className="text-gray-400 text-sm mt-0.5">
                Your coach profile is awaiting admin approval. You won't appear in search results until verified.
                Complete your profile in the meantime.
              </p>
              <Link to="/profile" className="text-primary-400 text-sm hover:underline mt-1 inline-block">
                Complete Profile →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ========= COACH DASHBOARD ========= */}
      {isCoach && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              icon="⚔️"
              title="Total Sessions"
              value={stats.total_sessions}
              subtitle="All time"
              color="gold"
            />
            <StatsCard
              icon="📅"
              title="This Month"
              value={stats.sessions_this_month}
              subtitle="Completed sessions"
              color="blue"
            />
            <StatsCard
              icon="💰"
              title="Earnings"
              value={formatCurrency(stats.earnings_this_month)}
              subtitle="This month"
              color="green"
            />
            <StatsCard
              icon="⏳"
              title="Pending"
              value={stats.pending_sessions}
              subtitle="Awaiting confirmation"
              color={stats.pending_sessions > 0 ? 'gold' : 'blue'}
            />
          </div>

          {/* Rating */}
          {stats.rating_avg > 0 && (
            <div className="card mb-8 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-gray-400 text-sm mb-1">Your Rating</p>
                <div className="flex items-center gap-3">
                  <StarRating rating={stats.rating_avg} size="lg" />
                  <span className="text-3xl font-bold text-white">{Number(stats.rating_avg).toFixed(1)}</span>
                  <span className="text-gray-500">({stats.total_reviews} reviews)</span>
                </div>
              </div>
              <Link to="/sessions?status=pending" className="btn-secondary">
                View Pending ({stats.pending_sessions})
              </Link>
            </div>
          )}

          {/* Upcoming Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Upcoming Sessions</h2>
              <Link to="/sessions" className="text-sm text-primary-400 hover:text-primary-300">View all →</Link>
            </div>
            {data.upcoming_sessions?.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-4xl mb-3">📅</p>
                <p className="text-gray-400">No upcoming sessions. Make sure your profile is complete!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.upcoming_sessions?.map((session) => (
                  <SessionCard key={session.id} session={session} viewAs="coach" />
                ))}
              </div>
            )}
          </div>

          {/* Recent Reviews */}
          {data.recent_reviews?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Reviews</h2>
              <div className="space-y-4">
                {data.recent_reviews.map((review) => (
                  <div key={review.id} className="card flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center text-sm font-bold text-gray-300 flex-shrink-0">
                      {review.student?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-white text-sm">{review.student?.name}</span>
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-gray-500 text-xs ml-auto">{formatDate(review.created_at)}</span>
                      </div>
                      {review.comment && <p className="text-gray-400 text-sm">{review.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ========= STUDENT DASHBOARD ========= */}
      {isStudent && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatsCard
              icon="🎮"
              title="Sessions Completed"
              value={stats.completed_sessions}
              color="gold"
            />
            <StatsCard
              icon="💰"
              title="Total Invested"
              value={formatCurrency(stats.total_spent)}
              subtitle="In coaching"
              color="blue"
            />
            <StatsCard
              icon="👨‍🏫"
              title="Coaches Worked With"
              value={stats.coaches_worked_with}
              color="green"
            />
          </div>

          {/* Subscription Status */}
          {data.subscription ? (
            <div className="card mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Active Plan</p>
                <p className="text-xl font-bold text-white">{data.subscription.plan_name}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {data.subscription.sessions_remaining} sessions remaining
                  · Renews {formatDate(data.subscription.ends_at)}
                </p>
              </div>
              <Link to="/coaches" className="btn-primary">Book a Session</Link>
            </div>
          ) : (
            <div className="card mb-8 flex items-center justify-between bg-gradient-to-r from-primary-500/5 to-transparent">
              <div>
                <p className="text-white font-semibold">Save with a Subscription Plan</p>
                <p className="text-gray-400 text-sm mt-1">Get 2-8 sessions per month at a discounted rate.</p>
              </div>
              <Link to="/coaches" className="btn-secondary">View Plans</Link>
            </div>
          )}

          {/* Upcoming Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Upcoming Sessions</h2>
              <Link to="/sessions" className="text-sm text-primary-400 hover:text-primary-300">View all →</Link>
            </div>
            {data.upcoming_sessions?.length === 0 ? (
              <div className="card text-center py-10">
                <p className="text-5xl mb-3">🎮</p>
                <p className="text-white font-semibold mb-2">No upcoming sessions</p>
                <p className="text-gray-400 text-sm mb-4">Ready to climb? Find a coach and book your first session.</p>
                <Link to="/coaches" className="btn-primary inline-block">Browse Coaches</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.upcoming_sessions?.map((session) => (
                  <SessionCard key={session.id} session={session} viewAs="student" />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
