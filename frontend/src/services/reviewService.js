import api from '../api/axios';

/**
 * Review Service
 * Handles fetching and submitting reviews.
 */

/**
 * Get reviews for a specific coach.
 *
 * @param {number} coachId
 * @param {Object} params - Pagination params
 */
export const getCoachReviews = async (coachId, params = {}) => {
  const response = await api.get(`/reviews/coach/${coachId}`, { params });
  return response.data;
};

/**
 * Submit a review for a completed session (students only).
 *
 * @param {Object} data - { session_id, rating, comment }
 */
export const submitReview = async (data) => {
  const response = await api.post('/reviews', data);
  return response.data;
};
