import { useState } from 'react';
import { bookSession } from '../../services/sessionService';
import { formatCurrency } from '../../utils/helpers';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * BookingModal Component
 * File: src/components/sessions/BookingModal.jsx
 *
 * A modal dialog for booking a coaching session.
 *
 * MODAL PATTERN:
 * We pass isOpen and onClose props to control visibility from the parent.
 * The parent mounts/unmounts the modal or controls its visibility.
 *
 * FORM STATE CONCEPT:
 * Each form field is a separate piece of state (controlled inputs).
 * For more complex forms, consider using a single state object:
 * const [form, setForm] = useState({ date: '', duration: '' })
 * setForm(prev => ({ ...prev, date: newDate }))
 *
 * @param {Object} coach - The coach being booked
 * @param {boolean} isOpen
 * @param {Function} onClose
 * @param {Function} onSuccess - Called after successful booking
 */
export default function BookingModal({ coach, isOpen, onClose, onSuccess }) {
  const [scheduledAt, setScheduledAt]     = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  // Calculate price preview based on selected duration
  const pricePreview = (coach?.hourly_rate || 0) * (durationMinutes / 60);

  const handleSubmit = async (e) => {
    // e.preventDefault() stops the form from doing a full page refresh
    // (default HTML form behavior — not what we want in React!)
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await bookSession({
        coach_id:         coach.id,
        scheduled_at:     scheduledAt,
        duration_minutes: parseInt(durationMinutes),
        notes,
      });

      // Notify parent of success and close
      onSuccess?.(result.data);
      onClose();

      // Reset form for next use
      setScheduledAt('');
      setDurationMinutes(60);
      setNotes('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get minimum datetime (must be in the future)
  const minDateTime = new Date();
  minDateTime.setHours(minDateTime.getHours() + 1); // At least 1 hour from now
  const minDateTimeStr = minDateTime.toISOString().slice(0, 16); // Format: "2024-01-15T18:00"

  return (
    // OVERLAY: clicking outside closes the modal
    <div
      className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div>
            <h2 className="text-xl font-bold text-white">Book a Session</h2>
            <p className="text-sm text-gray-400 mt-0.5">with {coach?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-700"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

          {/* Date & Time */}
          <div>
            <label className="form-label">Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={minDateTimeStr}
              required
              className="form-input"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="form-label">Duration</label>
            <div className="grid grid-cols-5 gap-2">
              {[30, 60, 90, 120, 180].map((mins) => (
                <button
                  key={mins}
                  type="button" // Important: type="button" prevents form submission!
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    durationMinutes === mins
                      ? 'bg-primary-500 text-dark-950'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Goals / Notes */}
          <div>
            <label className="form-label">
              What do you want to focus on?
              <span className="text-gray-500 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. I struggle with wave management in mid lane and my roaming timing is off..."
              rows={3}
              maxLength={1000}
              className="form-input resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{notes.length}/1000</p>
          </div>

          {/* Price summary */}
          <div className="bg-dark-700 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Hourly rate</span>
              <span className="text-gray-200">{formatCurrency(coach?.hourly_rate)}/hr</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Duration</span>
              <span className="text-gray-200">{durationMinutes} minutes</span>
            </div>
            <div className="border-t border-dark-600 pt-2 mt-2 flex justify-between">
              <span className="font-semibold text-white">Total</span>
              <span className="font-bold text-primary-400 text-lg">{formatCurrency(pricePreview)}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !scheduledAt}
            className="btn-primary w-full py-3 text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Booking...
              </span>
            ) : (
              `Book for ${formatCurrency(pricePreview)}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
