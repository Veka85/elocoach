import api from '../api/axios';

/**
 * Session Service
 * Handles all coaching session API calls.
 */

/**
 * Get sessions for the authenticated user.
 * Coaches see their coaching sessions, students see their booked sessions.
 *
 * @param {Object} params - Filter params (status, page)
 */
export const getSessions = async (params = {}) => {
  const response = await api.get('/sessions', { params });
  return response.data;
};

/**
 * Get a single session's details.
 *
 * @param {number} id
 */
export const getSession = async (id) => {
  const response = await api.get(`/sessions/${id}`);
  return response.data;
};

/**
 * Book a new coaching session (students only).
 *
 * @param {Object} data - { coach_id, scheduled_at, duration_minutes, notes }
 */
export const bookSession = async (data) => {
  const response = await api.post('/sessions', data);
  return response.data;
};

/**
 * Coach confirms a pending session.
 *
 * @param {number} sessionId
 * @param {string|null} meetLink - Optional meeting URL
 */
export const confirmSession = async (sessionId, meetLink = null) => {
  const response = await api.post(`/sessions/${sessionId}/confirm`, { meet_link: meetLink });
  return response.data;
};

/**
 * Coach marks a session as completed.
 *
 * @param {number} sessionId
 * @param {string|null} coachNotes - Optional post-session notes
 */
export const completeSession = async (sessionId, coachNotes = null) => {
  const response = await api.post(`/sessions/${sessionId}/complete`, { coach_notes: coachNotes });
  return response.data;
};

/**
 * Cancel a session (coach or student).
 *
 * @param {number} sessionId
 * @param {string|null} reason - Optional cancellation reason
 */
export const cancelSession = async (sessionId, reason = null) => {
  const response = await api.post(`/sessions/${sessionId}/cancel`, { reason });
  return response.data;
};
