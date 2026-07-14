import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSession, confirmSession, completeSession, cancelSession } from '../services/sessionService';
import { submitReview } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/common/StarRating';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { formatDateTime, formatCurrency, getStatusColor, capitalize, getRankColor } from '../utils/helpers';

/**
 * SessionDetail Page — Full session management
 * File: src/pages/SessionDetail.jsx
 *
 * Shows complete session info with role-appropriate action buttons.
 * Coach can: confirm, complete, enter notes
 * Student can: cancel, leave review (if completed)
 */
export default function SessionDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user, isCoach, isStudent } = useAuth();

  const [session, setSession]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Coach complete form
  const [coachNotes, setCoachNotes] = useState('');
  const [meetLink, setMeetLink]   = useState('');
  const [showCompleteForm, setShowCompleteForm] = useState(false);

  useEffect(() => {
    fetchSession();
  }, [id]);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const data = await getSession(id);
      setSession(data.data);
    } catch (err) {
      setError(err.response?.status === 403
        ? 'You do not have permission to view this session.'
        : err.response?.status === 404
        ? 'Session not found.'
        : 'Failed to load session.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      await confirmSession(session.id, meetLink || null);
      await fetchSession();
      setShowCompleteForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm session.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await completeSession(session.id, coachNotes || null);
      await fetchSession();
      setShowCompleteForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete session.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return;
    setActionLoading(true);
    try {
      await cancelSession(session.id);
      await fetchSession();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel session.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewRating === 0) { setError('Please select a rating.'); return; }
    setActionLoading(true);
    try {
      await submitReview({ session_id: session.id, rating: reviewRating, comment: reviewComment });
      setReviewSubmitted(true);
      await fetchSession();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" /></div>;
  if (error && !session) return <div className="max-w-2xl mx-auto px-4 py-12"><ErrorMessage message={error} /></div>;
  if (!session) return null;

  const isMySession = user?.id === session.coach?.id || user?.id === session.student?.id;
  const canConfirm  = isCoach && session.can_confirm;
  const canComplete = isCoach && session.can_complete;
  const canCancel   = session.can_cancel;
  const canReview   = isStudent && session.status === 'completed' && !session.has_review && !reviewSubmitted;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/sessions" className="hover:text-primary-400">Sessions</Link>
        <span>/</span>
        <span className="text-gray-300">Session #{session.id}</span>
      </div>

      {error && <div className="mb-6"><ErrorMessage message={error} onDismiss={() => setError(null)} /></div>}

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Session Details</h1>
          <span className={`badge ${getStatusColor(session.status)} text-sm px-3 py-1`}>
            {capitalize(session.status)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          {canConfirm && (
            <button
              onClick={() => setShowCompleteForm('confirm')}
              disabled={actionLoading}
              className="btn-primary"
            >
              ✓ Confirm Session
            </button>
          )}
          {canComplete && (
            <button
              onClick={() => setShowCompleteForm('complete')}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              ✓ Mark Complete
            </button>
          )}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="btn-danger"
            >
              {actionLoading ? <LoadingSpinner size="sm" /> : 'Cancel Session'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Session info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Session Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Session Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                <p className="text-gray-200">{formatDateTime(session.scheduled_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Duration</p>
                <p className="text-gray-200">{session.duration_minutes} minutes</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Price</p>
                <p className="text-gray-200 font-semibold">{formatCurrency(session.price)}</p>
              </div>
              {session.meet_link && session.status === 'confirmed' && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Meeting Link</p>
                  <a href={session.meet_link} target="_blank" rel="noopener noreferrer"
                     className="text-primary-400 hover:underline">
                    Join Meeting →
                  </a>
                </div>
              )}
            </div>
            {session.student_notes && (
              <div className="mt-4 pt-4 border-t border-dark-600">
                <p className="text-xs text-gray-500 mb-2">Student Goals</p>
                <p className="text-gray-300 text-sm">{session.student_notes}</p>
              </div>
            )}
            {session.cancellation_reason && (
              <div className="mt-4 pt-4 border-t border-dark-600">
                <p className="text-xs text-gray-500 mb-2">Cancellation Reason</p>
                <p className="text-gray-300 text-sm">{session.cancellation_reason}</p>
              </div>
            )}
          </div>

          {/* Confirm form */}
          {showCompleteForm === 'confirm' && (
            <div className="card border border-primary-500/30">
              <h3 className="font-semibold text-white mb-4">Confirm Session</h3>
              <div className="mb-4">
                <label className="form-label">Meeting Link <span className="text-gray-500 font-normal">(optional)</span></label>
                <input
                  type="url"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  placeholder="https://discord.gg/your-server or Google Meet URL"
                  className="form-input"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleConfirm} disabled={actionLoading} className="btn-primary">
                  {actionLoading ? <LoadingSpinner size="sm" /> : 'Confirm Session'}
                </button>
                <button onClick={() => setShowCompleteForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Complete form */}
          {showCompleteForm === 'complete' && (
            <div className="card border border-green-500/30">
              <h3 className="font-semibold text-white mb-4">Complete Session</h3>
              <div className="mb-4">
                <label className="form-label">Session Notes <span className="text-gray-500 font-normal">(optional)</span></label>
                <textarea
                  value={coachNotes}
                  onChange={(e) => setCoachNotes(e.target.value)}
                  placeholder="What did you cover? What should the student practice?"
                  rows={4}
                  className="form-input resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleComplete} disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                  {actionLoading ? <LoadingSpinner size="sm" /> : 'Mark as Completed'}
                </button>
                <button onClick={() => setShowCompleteForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Session Notes (post-session) */}
          {session.notes && (session.notes.coach_notes || session.notes.student_feedback) && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Session Notes</h2>
              {session.notes.coach_notes && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Coach Notes</p>
                  <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                    {session.notes.coach_notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Review section */}
          {session.review && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Review</h2>
              <div className="flex items-center gap-3 mb-2">
                <StarRating rating={session.review.rating} size="md" />
                <span className="text-gray-400 text-sm">
                  by {session.review.student?.name || 'Student'}
                </span>
              </div>
              {session.review.comment && (
                <p className="text-gray-300 text-sm">{session.review.comment}</p>
              )}
            </div>
          )}

          {/* Leave review form */}
          {canReview && !reviewSubmitted && (
            <div className="card border border-primary-500/20">
              <h2 className="text-lg font-semibold text-white mb-4">Leave a Review</h2>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Rating</label>
                  <StarRating rating={reviewRating} onChange={setReviewRating} size="lg" />
                </div>
                <div>
                  <label className="form-label">Comment <span className="text-gray-500 font-normal">(optional)</span></label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="How was your experience with this coach?"
                    rows={3}
                    className="form-input resize-none"
                  />
                </div>
                <button type="submit" disabled={actionLoading || reviewRating === 0} className="btn-primary">
                  {actionLoading ? <LoadingSpinner size="sm" /> : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {reviewSubmitted && (
            <div className="card bg-green-500/5 border border-green-500/30 text-center py-6">
              <p className="text-2xl mb-2">⭐</p>
              <p className="text-green-400 font-medium">Review submitted! Thank you.</p>
            </div>
          )}
        </div>

        {/* RIGHT: Participants */}
        <div className="space-y-4">
          {/* Coach Card */}
          {session.coach && (
            <div className="card">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Coach</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center font-bold text-gray-300">
                  {session.coach.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-white">{session.coach.name}</p>
                  {session.coach.summoner_name && (
                    <p className="text-xs text-gray-500 font-mono">{session.coach.summoner_name}</p>
                  )}
                  {session.coach.rank && (
                    <p className={`text-xs ${getRankColor(session.coach.rank)}`}>{session.coach.rank}</p>
                  )}
                </div>
              </div>
              <Link to={`/coaches/${session.coach.id}`} className="text-xs text-primary-400 hover:underline mt-3 block">
                View Profile →
              </Link>
            </div>
          )}

          {/* Student Card */}
          {session.student && (
            <div className="card">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Student</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center font-bold text-gray-300">
                  {session.student.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-white">{session.student.name}</p>
                  {session.student.summoner_name && (
                    <p className="text-xs text-gray-500 font-mono">{session.student.summoner_name}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
