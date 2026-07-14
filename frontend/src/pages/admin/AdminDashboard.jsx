import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard, updateAdminUser } from '../../services/adminService';
import StatsCard from '../../components/dashboard/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatCurrency, formatDate } from '../../utils/helpers';

/**
 * Admin Dashboard Page
 * File: src/pages/admin/AdminDashboard.jsx
 *
 * Provides platform-wide overview for admins.
 * Key admin feature: verifying/rejecting coaches.
 *
 * This page demonstrates:
 * - Admin-only protected route
 * - Inline actions (verify coach without navigating away)
 * - Analytics data visualization
 */
export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [verifying, setVerifying] = useState(null); // ID of coach being verified

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const result = await getAdminDashboard();
      setData(result);
    } catch (err) {
      setError('Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCoach = async (userId, verify) => {
    setVerifying(userId);
    try {
      await updateAdminUser(userId, { is_verified: verify });
      // Refresh the list after verification
      await fetchDashboard();
    } catch (err) {
      setError('Failed to update coach. Please try again.');
    } finally {
      setVerifying(null);
    }
  };

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" text="Loading admin dashboard..." /></div>;
  if (error) return <div className="max-w-2xl mx-auto px-4 py-12"><ErrorMessage message={error} /></div>;
  if (!data) return null;

  const { stats, pending_coaches, top_coaches } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Platform overview and management</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/users" className="btn-secondary text-sm">Manage Users</Link>
          <Link to="/admin/sessions" className="btn-secondary text-sm">View Sessions</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon="👥" title="Total Users"     value={stats.total_users}     color="blue" />
        <StatsCard icon="🎯" title="Coaches"         value={stats.total_coaches}   subtitle={`${stats.verified_coaches} verified`} color="gold" />
        <StatsCard icon="🎮" title="Students"        value={stats.total_students}  color="purple" />
        <StatsCard icon="⚔️" title="Total Sessions"  value={stats.total_sessions}  color="green" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon="📅" title="Sessions Today"  value={stats.sessions_today}  color="blue" />
        <StatsCard icon="📊" title="This Month"      value={stats.sessions_this_month} color="gold" />
        <StatsCard icon="💰" title="Total Revenue"   value={formatCurrency(stats.total_revenue)} color="green" />
        <StatsCard icon="💵" title="This Month Rev"  value={formatCurrency(stats.revenue_this_month)} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending Verification */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Pending Verification
              {stats.unverified_coaches > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.unverified_coaches}
                </span>
              )}
            </h2>
            <Link to="/admin/users?verified=false" className="text-xs text-primary-400 hover:underline">View all</Link>
          </div>

          {pending_coaches?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">✅ No pending verifications</p>
          ) : (
            <div className="space-y-3">
              {pending_coaches.map((coach) => (
                <div key={coach.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-xl">
                  <div>
                    <p className="font-medium text-white text-sm">{coach.name}</p>
                    <p className="text-xs text-gray-500">{coach.email}</p>
                    <p className="text-xs text-gray-500">
                      {coach.rank} · {coach.region} · Joined {formatDate(coach.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerifyCoach(coach.id, true)}
                      disabled={verifying === coach.id}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {verifying === coach.id ? '...' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleVerifyCoach(coach.id, false)}
                      disabled={verifying === coach.id}
                      className="text-xs bg-dark-600 hover:bg-dark-500 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Coaches */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Top Coaches</h2>
          {top_coaches?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No coaches yet</p>
          ) : (
            <div className="space-y-3">
              {top_coaches.map((coach, idx) => (
                <div key={coach.id} className="flex items-center gap-3 p-3 bg-dark-800 rounded-xl">
                  <span className="text-sm font-bold text-gray-500 w-5">#{idx + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{coach.name}</p>
                    <p className="text-xs text-gray-500">{coach.total_sessions} sessions · {coach.total_reviews} reviews</p>
                  </div>
                  <span className="text-yellow-400 text-sm font-bold">⭐ {Number(coach.rating).toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
